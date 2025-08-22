import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native';
import { Audio, AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import Gluestack components (add these to your components/ui folder)
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem } from '@/components/ui/select';
import { ChevronDownIcon } from '@/components/ui/icon';
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb } from '@/components/ui/slider';

// Polyfill for crypto.getRandomValues (required by Azure SDK)
if (typeof global.crypto !== 'object') {
    global.crypto = {
        getRandomValues: (array: any) => {
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
            return array;
        },
        randomUUID: () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        subtle: {} as SubtleCrypto
    } as Crypto;
}
if (typeof global.crypto.getRandomValues !== 'function') {
    global.crypto.getRandomValues = (array: any) => {
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
        return array;
    };
}

// Polyfill for btoa/atob if needed
if (typeof global.btoa === 'undefined') {
    global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}
if (typeof global.atob === 'undefined') {
    global.atob = (b64: string) => Buffer.from(b64, 'base64').toString('binary');
}

interface TTSComponentProps {
    subscriptionKey?: string;
    region?: string;
}

interface PlaybackState {
    isPlaying: boolean;
    isLoading: boolean;
    duration: number;
    position: number;
    volume: number;
    rate: number;
}

interface VoiceOption {
    name: string;
    displayName: string;
    language: string;
    languageDisplay: string;
    gender: string;
}

interface LanguageGroup {
    code: string;
    name: string;
    voices: VoiceOption[];
}

// Organized voice options by language (Fixed duplicate Hindi entry)
const LANGUAGE_GROUPS: LanguageGroup[] = [
    {
        code: 'en-US',
        name: '🇺🇸 English (United States)',
        voices: [
            { name: 'en-US-AriaNeural', displayName: 'Aria (Female)', language: 'en-US', languageDisplay: 'English (US)', gender: 'Female' },
            { name: 'en-US-DavisNeural', displayName: 'Davis (Male)', language: 'en-US', languageDisplay: 'English (US)', gender: 'Male' },
            { name: 'en-US-JennyNeural', displayName: 'Jenny (Female)', language: 'en-US', languageDisplay: 'English (US)', gender: 'Female' },
            { name: 'en-US-GuyNeural', displayName: 'Guy (Male)', language: 'en-US', languageDisplay: 'English (US)', gender: 'Male' },
            { name: 'en-US-JaneNeural', displayName: 'Jane (Female)', language: 'en-US', languageDisplay: 'English (US)', gender: 'Female' },
            { name: 'en-US-JasonNeural', displayName: 'Jason (Male)', language: 'en-US', languageDisplay: 'English (US)', gender: 'Male' },
        ]
    },
    {
        code: 'hi-IN',
        name: '🇮🇳 Hindi (India)',
        voices: [
            { name: 'hi-IN-SwaraNeural', displayName: 'Swara (Female)', language: 'hi-IN', languageDisplay: 'Hindi (India)', gender: 'Female' },
            { name: 'hi-IN-MadhurNeural', displayName: 'Madhur (Male)', language: 'hi-IN', languageDisplay: 'Hindi (India)', gender: 'Male' },
            { name: 'hi-IN-RehaNeural', displayName: 'Reha (Female)', language: 'hi-IN', languageDisplay: 'Hindi (India)', gender: 'Female' },
        ]
    },
    {
        code: 'en-GB',
        name: '🇬🇧 English (United Kingdom)',
        voices: [
            { name: 'en-GB-SoniaNeural', displayName: 'Sonia (Female)', language: 'en-GB', languageDisplay: 'English (UK)', gender: 'Female' },
            { name: 'en-GB-RyanNeural', displayName: 'Ryan (Male)', language: 'en-GB', languageDisplay: 'English (UK)', gender: 'Male' },
            { name: 'en-GB-LibbyNeural', displayName: 'Libby (Female)', language: 'en-GB', languageDisplay: 'English (UK)', gender: 'Female' },
            { name: 'en-GB-MaisieNeural', displayName: 'Maisie (Female)', language: 'en-GB', languageDisplay: 'English (UK)', gender: 'Female' },
        ]
    },
    {
        code: 'es-ES',
        name: '🇪🇸 Spanish (Spain)',
        voices: [
            { name: 'es-ES-ElviraNeural', displayName: 'Elvira (Female)', language: 'es-ES', languageDisplay: 'Spanish (Spain)', gender: 'Female' },
            { name: 'es-ES-AlvaroNeural', displayName: 'Alvaro (Male)', language: 'es-ES', languageDisplay: 'Spanish (Spain)', gender: 'Male' },
            { name: 'es-ES-AbrilNeural', displayName: 'Abril (Female)', language: 'es-ES', languageDisplay: 'Spanish (Spain)', gender: 'Female' },
            { name: 'es-ES-ArnauNeural', displayName: 'Arnau (Male)', language: 'es-ES', languageDisplay: 'Spanish (Spain)', gender: 'Male' },
        ]
    },
    {
        code: 'es-MX',
        name: '🇲🇽 Spanish (Mexico)',
        voices: [
            { name: 'es-MX-DaliaNeural', displayName: 'Dalia (Female)', language: 'es-MX', languageDisplay: 'Spanish (Mexico)', gender: 'Female' },
            { name: 'es-MX-JorgeNeural', displayName: 'Jorge (Male)', language: 'es-MX', languageDisplay: 'Spanish (Mexico)', gender: 'Male' },
            { name: 'es-MX-CandelaNeural', displayName: 'Candela (Female)', language: 'es-MX', languageDisplay: 'Spanish (Mexico)', gender: 'Female' },
        ]
    },
    {
        code: 'fr-FR',
        name: '🇫🇷 French (France)',
        voices: [
            { name: 'fr-FR-DeniseNeural', displayName: 'Denise (Female)', language: 'fr-FR', languageDisplay: 'French (France)', gender: 'Female' },
            { name: 'fr-FR-HenriNeural', displayName: 'Henri (Male)', language: 'fr-FR', languageDisplay: 'French (France)', gender: 'Male' },
            { name: 'fr-FR-EloiseNeural', displayName: 'Eloise (Female)', language: 'fr-FR', languageDisplay: 'French (France)', gender: 'Female' },
            { name: 'fr-FR-RemyNeural', displayName: 'Remy (Male)', language: 'fr-FR', languageDisplay: 'French (France)', gender: 'Male' },
        ]
    },
    {
        code: 'de-DE',
        name: '🇩🇪 German (Germany)',
        voices: [
            { name: 'de-DE-KatjaNeural', displayName: 'Katja (Female)', language: 'de-DE', languageDisplay: 'German (Germany)', gender: 'Female' },
            { name: 'de-DE-ConradNeural', displayName: 'Conrad (Male)', language: 'de-DE', languageDisplay: 'German (Germany)', gender: 'Male' },
            { name: 'de-DE-AmalaNeural', displayName: 'Amala (Female)', language: 'de-DE', languageDisplay: 'German (Germany)', gender: 'Female' },
            { name: 'de-DE-BerndNeural', displayName: 'Bernd (Male)', language: 'de-DE', languageDisplay: 'German (Germany)', gender: 'Male' },
        ]
    },
    {
        code: 'ja-JP',
        name: '🇯🇵 Japanese (Japan)',
        voices: [
            { name: 'ja-JP-NanamiNeural', displayName: 'Nanami (Female)', language: 'ja-JP', languageDisplay: 'Japanese (Japan)', gender: 'Female' },
            { name: 'ja-JP-KeitaNeural', displayName: 'Keita (Male)', language: 'ja-JP', languageDisplay: 'Japanese (Japan)', gender: 'Male' },
            { name: 'ja-JP-AoiNeural', displayName: 'Aoi (Female)', language: 'ja-JP', languageDisplay: 'Japanese (Japan)', gender: 'Female' },
            { name: 'ja-JP-DaichiNeural', displayName: 'Daichi (Male)', language: 'ja-JP', languageDisplay: 'Japanese (Japan)', gender: 'Male' },
        ]
    },
    {
        code: 'zh-CN',
        name: '🇨🇳 Chinese (Mainland)',
        voices: [
            { name: 'zh-CN-XiaoxiaoNeural', displayName: 'Xiaoxiao (Female)', language: 'zh-CN', languageDisplay: 'Chinese (Mainland)', gender: 'Female' },
            { name: 'zh-CN-YunxiNeural', displayName: 'Yunxi (Male)', language: 'zh-CN', languageDisplay: 'Chinese (Mainland)', gender: 'Male' },
            { name: 'zh-CN-XiaoyiNeural', displayName: 'Xiaoyi (Female)', language: 'zh-CN', languageDisplay: 'Chinese (Mainland)', gender: 'Female' },
            { name: 'zh-CN-YunjianNeural', displayName: 'Yunjian (Male)', language: 'zh-CN', languageDisplay: 'Chinese (Mainland)', gender: 'Male' },
        ]
    },
    {
        code: 'pt-BR',
        name: '🇧🇷 Portuguese (Brazil)',
        voices: [
            { name: 'pt-BR-FranciscaNeural', displayName: 'Francisca (Female)', language: 'pt-BR', languageDisplay: 'Portuguese (Brazil)', gender: 'Female' },
            { name: 'pt-BR-AntonioNeural', displayName: 'Antonio (Male)', language: 'pt-BR', languageDisplay: 'Portuguese (Brazil)', gender: 'Male' },
            { name: 'pt-BR-BrendaNeural', displayName: 'Brenda (Female)', language: 'pt-BR', languageDisplay: 'Portuguese (Brazil)', gender: 'Female' },
        ]
    },
    {
        code: 'it-IT',
        name: '🇮🇹 Italian (Italy)',
        voices: [
            { name: 'it-IT-ElsaNeural', displayName: 'Elsa (Female)', language: 'it-IT', languageDisplay: 'Italian (Italy)', gender: 'Female' },
            { name: 'it-IT-IsabellaNeural', displayName: 'Isabella (Female)', language: 'it-IT', languageDisplay: 'Italian (Italy)', gender: 'Female' },
            { name: 'it-IT-DiegoNeural', displayName: 'Diego (Male)', language: 'it-IT', languageDisplay: 'Italian (Italy)', gender: 'Male' },
        ]
    },
    {
        code: 'ru-RU',
        name: '🇷🇺 Russian (Russia)',
        voices: [
            { name: 'ru-RU-SvetlanaNeural', displayName: 'Svetlana (Female)', language: 'ru-RU', languageDisplay: 'Russian (Russia)', gender: 'Female' },
            { name: 'ru-RU-DmitryNeural', displayName: 'Dmitry (Male)', language: 'ru-RU', languageDisplay: 'Russian (Russia)', gender: 'Male' },
            { name: 'ru-RU-DariyaNeural', displayName: 'Dariya (Female)', language: 'ru-RU', languageDisplay: 'Russian (Russia)', gender: 'Female' },
        ]
    }
];

// Audio format options
const AUDIO_FORMATS = [
    { value: 'audio-16khz-32kbitrate-mono-mp3', display: 'MP3 16kHz 32kbps', quality: 'Basic' },
    { value: 'audio-16khz-64kbitrate-mono-mp3', display: 'MP3 16kHz 64kbps', quality: 'Good' },
    { value: 'audio-24khz-48kbitrate-mono-mp3', display: 'MP3 24kHz 48kbps', quality: 'Better' },
    { value: 'audio-24khz-96kbitrate-mono-mp3', display: 'MP3 24kHz 96kbps', quality: 'High' },
    { value: 'audio-48khz-96kbitrate-mono-mp3', display: 'MP3 48kHz 96kbps', quality: 'Very High' },
    { value: 'audio-48khz-192kbitrate-mono-mp3', display: 'MP3 48kHz 192kbps', quality: 'Premium' },
];

// Playback speed options
const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

const { width } = Dimensions.get('window');

const TTSComponent: React.FC<TTSComponentProps> = ({
    subscriptionKey = process.env.EXPO_PUBLIC_AZURE_SUBSCRIPTION_KEY,
    region = process.env.EXPO_PUBLIC_AZURE_REGION,
}) => {
    const [text, setText] = useState<string>('');
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageGroup>(LANGUAGE_GROUPS[0]);
    const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(LANGUAGE_GROUPS[0].voices[0]);
    const [audioFormat, setAudioFormat] = useState<string>(AUDIO_FORMATS[2].value);
    const [speechRate, setSpeechRate] = useState<number>(1.0);
    const [speechPitch, setSpeechPitch] = useState<string>('+0%');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [audioFileInfo, setAudioFileInfo] = useState<{ uri: string, size: string } | null>(null);
    const [playbackState, setPlaybackState] = useState<PlaybackState>({
        isPlaying: false,
        isLoading: false,
        duration: 0,
        position: 0,
        volume: 1.0,
        rate: 1.0,
    });
    const [showVolumeControl, setShowVolumeControl] = useState<boolean>(false);
    const [showSpeedControl, setShowSpeedControl] = useState<boolean>(false);

    const soundRef = useRef<Audio.Sound | null>(null);
    const audioUriRef = useRef<string | null>(null);

    // Initialize audio mode
    const initializeAudio = useCallback(async () => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: false,
                interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                playThroughEarpieceAndroid: false,
            });
        } catch (error) {
            console.error('Failed to initialize audio:', error);
        }
    }, []);

    // Generate speech from text using Azure Speech SDK
    const generateSpeech = useCallback(async () => {
        if (!text.trim()) {
            Alert.alert('Error', 'Please enter some text to convert to speech');
            return;
        }

        if (!subscriptionKey || !region) {
            Alert.alert('Error', 'Azure subscription key and region are required');
            return;
        }

        setIsGenerating(true);

        try {
            // Clean up previous audio
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }

            // Configure Azure Speech SDK
            const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);

            // Set audio format
            const formatMap: { [key: string]: sdk.SpeechSynthesisOutputFormat } = {
                'audio-16khz-32kbitrate-mono-mp3': sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3,
                'audio-16khz-64kbitrate-mono-mp3': sdk.SpeechSynthesisOutputFormat.Audio16Khz64KBitRateMonoMp3,
                'audio-24khz-48kbitrate-mono-mp3': sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3,
                'audio-24khz-96kbitrate-mono-mp3': sdk.SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3,
                'audio-48khz-96kbitrate-mono-mp3': sdk.SpeechSynthesisOutputFormat.Audio48Khz96KBitRateMonoMp3,
                'audio-48khz-192kbitrate-mono-mp3': sdk.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3,
            };

            speechConfig.speechSynthesisOutputFormat = formatMap[audioFormat] || sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;

            // Create synthesizer
            const synthesizer = new sdk.SpeechSynthesizer(speechConfig, undefined);

            // Create SSML with voice settings
            const ssml = `<?xml version="1.0" encoding="UTF-8"?>
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${selectedVoice.language}">
          <voice name="${selectedVoice.name}">
            <prosody rate="${speechRate}" pitch="${speechPitch}">
              ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </prosody>
          </voice>
        </speak>`;

            // Perform synthesis and get audio data
            const audioData = await new Promise<ArrayBuffer>((resolve, reject) => {
                synthesizer.speakSsmlAsync(
                    ssml,
                    (result) => {
                        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            console.log('✅ Speech synthesis completed');
                            resolve(result.audioData);
                        } else {
                            console.error('❌ Speech synthesis failed:', result.errorDetails);
                            reject(new Error(result.errorDetails || 'Speech synthesis failed'));
                        }
                        synthesizer.close();
                    },
                    (error) => {
                        console.error('Speech synthesis error:', error);
                        synthesizer.close();
                        reject(error);
                    }
                );
            });

            // Save audio data to file
            const fileName = `tts_${Date.now()}.mp3`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            // Convert ArrayBuffer to base64
            const uint8Array = new Uint8Array(audioData);
            let binaryString = '';
            for (let i = 0; i < uint8Array.length; i++) {
                binaryString += String.fromCharCode(uint8Array[i]);
            }
            const base64Data = btoa(binaryString);

            // Write file
            await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Get file info
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            const fileSizeKB = fileInfo.exists && !fileInfo.isDirectory
                ? Math.round((fileInfo.size || 0) / 1024)
                : 0;

            audioUriRef.current = fileUri;
            setAudioFileInfo({
                uri: fileUri,
                size: `${fileSizeKB} KB`
            });

            console.log('Audio file saved to:', fileUri);
            console.log('File size:', `${fileSizeKB} KB`);

            // Initialize audio for playback
            await initializeAudio();

        } catch (error) {
            console.error('Error generating speech:', error);
            Alert.alert('Error', 'Failed to generate speech. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    }, [text, selectedVoice, audioFormat, speechRate, speechPitch, subscriptionKey, region, initializeAudio]);

    // Play/pause audio
    const togglePlayback = useCallback(async () => {
        try {
            if (!audioUriRef.current) {
                Alert.alert('Error', 'No audio file available. Please generate speech first.');
                return;
            }

            if (soundRef.current) {
                if (playbackState.isPlaying) {
                    await soundRef.current.pauseAsync();
                    setPlaybackState(prev => ({ ...prev, isPlaying: false }));
                } else {
                    await soundRef.current.playAsync();
                    setPlaybackState(prev => ({ ...prev, isPlaying: true }));
                }
            } else {
                // Load and play new audio
                setPlaybackState(prev => ({ ...prev, isLoading: true }));

                const { sound } = await Audio.Sound.createAsync(
                    { uri: audioUriRef.current },
                    {
                        shouldPlay: true,
                        volume: playbackState.volume,
                        rate: playbackState.rate,
                        pitchCorrectionQuality: Audio.PitchCorrectionQuality.High,
                    },
                    onPlaybackStatusUpdate
                );

                soundRef.current = sound;
                setPlaybackState(prev => ({
                    ...prev,
                    isPlaying: true,
                    isLoading: false
                }));
            }
        } catch (error) {
            console.error('Error toggling playback:', error);
            setPlaybackState(prev => ({
                ...prev,
                isPlaying: false,
                isLoading: false
            }));
            Alert.alert('Error', 'Failed to play audio');
        }
    }, [playbackState.isPlaying, playbackState.volume, playbackState.rate]);

    // Stop audio playback
    const stopPlayback = useCallback(async () => {
        try {
            if (soundRef.current) {
                await soundRef.current.stopAsync();
                await soundRef.current.setPositionAsync(0);
                setPlaybackState(prev => ({
                    ...prev,
                    isPlaying: false,
                    position: 0
                }));
            }
        } catch (error) {
            console.error('Error stopping playback:', error);
        }
    }, []);

    // Skip forward/backward
    const skipTime = useCallback(async (seconds: number) => {
        try {
            if (soundRef.current && playbackState.duration > 0) {
                const newPosition = Math.max(0, Math.min(playbackState.position + (seconds * 1000), playbackState.duration));
                await soundRef.current.setPositionAsync(newPosition);
            }
        } catch (error) {
            console.error('Error skipping time:', error);
        }
    }, [playbackState.position, playbackState.duration]);

    // Change playback speed
    const changePlaybackSpeed = useCallback(async (newRate: number) => {
        try {
            if (soundRef.current) {
                await soundRef.current.setRateAsync(newRate, true, Audio.PitchCorrectionQuality.High);
                setPlaybackState(prev => ({ ...prev, rate: newRate }));
            } else {
                setPlaybackState(prev => ({ ...prev, rate: newRate }));
            }
        } catch (error) {
            console.error('Error changing playback speed:', error);
        }
    }, []);

    // Change volume
    const changeVolume = useCallback(async (newVolume: number) => {
        try {
            if (soundRef.current) {
                await soundRef.current.setVolumeAsync(newVolume);
            }
            setPlaybackState(prev => ({ ...prev, volume: newVolume }));
        } catch (error) {
            console.error('Error changing volume:', error);
        }
    }, []);

    // Handle playback status updates
    const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setPlaybackState(prev => ({
                ...prev,
                isPlaying: status.isPlaying,
                duration: status.durationMillis || 0,
                position: status.positionMillis || 0,
                isLoading: false,
            }));

            if (status.didJustFinish) {
                setPlaybackState(prev => ({
                    ...prev,
                    isPlaying: false,
                    position: 0
                }));
            }
        }
    }, []);

    // Seek to position
    const seekToPosition = useCallback(async (value: number[]) => {
        try {
            if (soundRef.current && playbackState.duration > 0) {
                const seekPosition = (value[0] / 100) * playbackState.duration;
                await soundRef.current.setPositionAsync(seekPosition);
            }
        } catch (error) {
            console.error('Error seeking:', error);
        }
    }, [playbackState.duration]);

    // Format time for display
    const formatTime = useCallback((milliseconds: number): string => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    // Calculate progress percentage
    const progressPercentage = playbackState.duration > 0
        ? (playbackState.position / playbackState.duration) * 100
        : 0;

    // Get volume icon
    const getVolumeIcon = useCallback((volume: number) => {
        if (volume === 0) return 'volume-mute';
        if (volume < 0.5) return 'volume-low';
        return 'volume-high';
    }, []);

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Header with Gradient */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    paddingTop: 60,
                    paddingBottom: 30,
                    paddingHorizontal: 20,
                    borderBottomLeftRadius: 30,
                    borderBottomRightRadius: 30,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Ionicons name="volume-high" size={28} color="#ffffff" />
                    <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginLeft: 12 }}>
                        Text to Speech
                    </Text>
                </View>
                <Text style={{ fontSize: 16, color: '#e2e8f0', opacity: 0.9 }}>
                    Convert your text to natural-sounding speech
                </Text>
            </LinearGradient>

            <View style={{ padding: 20 }}>
                {/* Text Input Card */}
                <View style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Ionicons name="document-text" size={20} color="#667eea" />
                        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', marginLeft: 8 }}>
                            Enter Your Text
                        </Text>
                    </View>

                    <TextInput
                        style={{
                            borderWidth: 2,
                            borderColor: '#e2e8f0',
                            borderRadius: 12,
                            padding: 16,
                            fontSize: 16,
                            minHeight: 120,
                            textAlignVertical: 'top',
                            backgroundColor: '#f8fafc',
                            color: '#1e293b',
                        }}
                        placeholder="Type or paste the text you want to convert to speech..."
                        placeholderTextColor="#94a3b8"
                        value={text}
                        onChangeText={setText}
                        multiline
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                        <Text style={{ color: '#64748b', fontSize: 12 }}>
                            {text.length} characters
                        </Text>
                        <Text style={{ color: '#64748b', fontSize: 12 }}>
                            ~{Math.ceil(text.length / 4)} words
                        </Text>
                    </View>
                </View>

                {/* Voice Settings Card */}
                <View style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Ionicons name="mic" size={20} color="#667eea" />
                        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', marginLeft: 8 }}>
                            Voice Settings
                        </Text>
                    </View>

                    {/* Language Selection */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                            Language
                        </Text>
                        <Select
                            selectedValue={selectedLanguage.code}
                            onValueChange={(value) => {
                                const lang = LANGUAGE_GROUPS.find(l => l.code === value);
                                if (lang) {
                                    setSelectedLanguage(lang);
                                    setSelectedVoice(lang.voices[0]);
                                }
                            }}
                        >
                            <SelectTrigger variant="outline" size="md">
                                <SelectInput placeholder="Select Language" />
                                <SelectIcon className="mr-3">
                                    <ChevronDownIcon />
                                </SelectIcon>
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectBackdrop />
                                <SelectContent>
                                    <SelectDragIndicatorWrapper>
                                        <SelectDragIndicator />
                                    </SelectDragIndicatorWrapper>
                                    {LANGUAGE_GROUPS.map((language) => (
                                        <SelectItem
                                            key={language.code}
                                            label={language.name}
                                            value={language.code}
                                        />
                                    ))}
                                </SelectContent>
                            </SelectPortal>
                        </Select>
                    </View>

                    {/* Voice Selection */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                            Voice ({selectedLanguage.voices.length} available)
                        </Text>
                        <Select
                            selectedValue={selectedVoice.name}
                            onValueChange={(value) => {
                                const voice = selectedLanguage.voices.find(v => v.name === value);
                                if (voice) {
                                    setSelectedVoice(voice);
                                }
                            }}
                        >
                            <SelectTrigger variant="outline" size="md">
                                <SelectInput placeholder="Select Voice" />
                                <SelectIcon className="mr-3">
                                    <ChevronDownIcon />
                                </SelectIcon>
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectBackdrop />
                                <SelectContent>
                                    <SelectDragIndicatorWrapper>
                                        <SelectDragIndicator />
                                    </SelectDragIndicatorWrapper>
                                    {selectedLanguage.voices.map((voice) => (
                                        <SelectItem
                                            key={voice.name}
                                            label={`${voice.displayName} - ${voice.gender}`}
                                            value={voice.name}
                                        />
                                    ))}
                                </SelectContent>
                            </SelectPortal>
                        </Select>
                    </View>

                    {/* Audio Quality */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                            Audio Quality
                        </Text>
                        <Select
                            selectedValue={audioFormat}
                            onValueChange={(value) => setAudioFormat(value)}
                        >
                            <SelectTrigger variant="outline" size="md">
                                <SelectInput placeholder="Select Quality" />
                                <SelectIcon className="mr-3">
                                    <ChevronDownIcon />
                                </SelectIcon>
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectBackdrop />
                                <SelectContent>
                                    <SelectDragIndicatorWrapper>
                                        <SelectDragIndicator />
                                    </SelectDragIndicatorWrapper>
                                    {AUDIO_FORMATS.map((format) => (
                                        <SelectItem
                                            key={format.value}
                                            label={`${format.quality} - ${format.display}`}
                                            value={format.value}
                                        />
                                    ))}
                                </SelectContent>
                            </SelectPortal>
                        </Select>
                    </View>

                    {/* Speech Rate */}
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
                                Speech Rate
                            </Text>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#667eea' }}>
                                {speechRate.toFixed(1)}x
                            </Text>
                        </View>
                        <Slider
                            value={speechRate}
                            onChange={(value) => setSpeechRate(value)}
                            minValue={0.5}
                            maxValue={2.0}
                            step={0.1}
                            className="w-full"
                        >
                            <SliderTrack>
                                <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                            <Text style={{ fontSize: 12, color: '#64748b' }}>0.5x (Slow)</Text>
                            <Text style={{ fontSize: 12, color: '#64748b' }}>2.0x (Fast)</Text>
                        </View>
                    </View>

                    {/* Speech Pitch */}
                    <View>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
                            Speech Pitch
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            {['-20%', '0%', '+20%'].map((pitch) => (
                                <TouchableOpacity
                                    key={pitch}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 12,
                                        paddingHorizontal: 8,
                                        marginHorizontal: 4,
                                        borderRadius: 10,
                                        backgroundColor: speechPitch === pitch ? '#667eea' : '#f1f5f9',
                                        borderWidth: 1,
                                        borderColor: speechPitch === pitch ? '#667eea' : '#e2e8f0',
                                    }}
                                    onPress={() => setSpeechPitch(pitch)}
                                >
                                    <Text style={{
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: speechPitch === pitch ? '#ffffff' : '#64748b'
                                    }}>
                                        {pitch}
                                    </Text>
                                    <Text style={{
                                        textAlign: 'center',
                                        fontSize: 11,
                                        color: speechPitch === pitch ? '#e2e8f0' : '#94a3b8',
                                        marginTop: 2,
                                    }}>
                                        {pitch === '-20%' ? 'Lower' : pitch === '0%' ? 'Normal' : 'Higher'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Generate Button */}
                <TouchableOpacity
                    style={{
                        backgroundColor: isGenerating ? '#94a3b8' : '#667eea',
                        borderRadius: 16,
                        padding: 18,
                        marginBottom: 20,
                        shadowColor: '#667eea',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: isGenerating ? 0 : 0.3,
                        shadowRadius: 8,
                        elevation: isGenerating ? 0 : 8,
                    }}
                    onPress={generateSpeech}
                    disabled={isGenerating}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        {isGenerating ? (
                            <>
                                <Ionicons name="hourglass" size={20} color="#ffffff" />
                                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '600', marginLeft: 8 }}>
                                    Generating Speech...
                                </Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="play-circle" size={20} color="#ffffff" />
                                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '600', marginLeft: 8 }}>
                                    Generate Speech
                                </Text>
                            </>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Enhanced Audio Player */}
                {audioUriRef.current && audioFileInfo && (
                    <View style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 20,
                        padding: 24,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 12,
                        elevation: 8,
                    }}>
                        {/* Player Header */}
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <View style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                backgroundColor: '#f0f4ff',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 12,
                            }}>
                                <Ionicons
                                    name={playbackState.isPlaying ? "pause" : "play"}
                                    size={36}
                                    color="#667eea"
                                />
                            </View>

                            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', textAlign: 'center' }}>
                                {selectedVoice.displayName}
                            </Text>
                            <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center' }}>
                                {selectedVoice.languageDisplay} • {selectedVoice.gender}
                            </Text>
                        </View>

                        {/* Progress Bar */}
                        <View style={{ marginBottom: 12 }}>
                            <Slider
                                value={progressPercentage}
                                onChange={(value) => seekToPosition([value])}
                                minValue={0}
                                maxValue={100}
                                step={1}
                                className="w-full"
                                isDisabled={playbackState.duration === 0}
                            >
                                <SliderTrack>
                                    <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb />
                            </Slider>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                <Text style={{ fontSize: 12, color: '#64748b' }}>
                                    {formatTime(playbackState.position)}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#64748b' }}>
                                    {formatTime(playbackState.duration)}
                                </Text>
                            </View>
                        </View>

                        {/* Enhanced Control Buttons */}
                        <View style={{ marginBottom: 20 }}>
                            {/* Primary Controls */}
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16,
                                gap: 12,
                            }}>
                                {/* Skip Backward */}
                                <TouchableOpacity
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 25,
                                        backgroundColor: '#f1f5f9',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onPress={() => skipTime(-10)}
                                >
                                    <Ionicons name="play-back" size={24} color="#64748b" />
                                </TouchableOpacity>

                                {/* Stop */}
                                <TouchableOpacity
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 25,
                                        backgroundColor: '#f1f5f9',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onPress={stopPlayback}
                                >
                                    <Ionicons name="stop" size={24} color="#64748b" />
                                </TouchableOpacity>

                                {/* Play/Pause */}
                                <TouchableOpacity
                                    style={{
                                        width: 70,
                                        height: 70,
                                        borderRadius: 35,
                                        backgroundColor: playbackState.isLoading ? '#94a3b8' : '#667eea',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        shadowColor: '#667eea',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: playbackState.isLoading ? 0 : 0.3,
                                        shadowRadius: 8,
                                        elevation: playbackState.isLoading ? 0 : 8,
                                    }}
                                    onPress={togglePlayback}
                                    disabled={playbackState.isLoading}
                                >
                                    <Ionicons
                                        name={
                                            playbackState.isLoading
                                                ? 'hourglass'
                                                : playbackState.isPlaying
                                                    ? 'pause'
                                                    : 'play'
                                        }
                                        size={32}
                                        color="#ffffff"
                                    />
                                </TouchableOpacity>

                                {/* Speed Control */}
                                <TouchableOpacity
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 25,
                                        backgroundColor: showSpeedControl ? '#667eea' : '#f1f5f9',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onPress={() => setShowSpeedControl(!showSpeedControl)}
                                >
                                    <Text style={{
                                        fontSize: 12,
                                        fontWeight: '600',
                                        color: showSpeedControl ? '#ffffff' : '#64748b'
                                    }}>
                                        {playbackState.rate.toFixed(1)}x
                                    </Text>
                                </TouchableOpacity>

                                {/* Skip Forward */}
                                <TouchableOpacity
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 25,
                                        backgroundColor: '#f1f5f9',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onPress={() => skipTime(10)}
                                >
                                    <Ionicons name="play-forward" size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            {/* Secondary Controls */}
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 20,
                            }}>
                                {/* Volume Control Button */}
                                <TouchableOpacity
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: showVolumeControl ? '#667eea' : '#f1f5f9',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onPress={() => setShowVolumeControl(!showVolumeControl)}
                                >
                                    <Ionicons
                                        name={getVolumeIcon(playbackState.volume)}
                                        size={20}
                                        color={showVolumeControl ? '#ffffff' : '#64748b'}
                                    />
                                </TouchableOpacity>

                                {/* Skip indicators */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>-10s</Text>
                                        <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: '#94a3b8' }} />
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>+10s</Text>
                                        <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: '#94a3b8' }} />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Speed Control Panel */}
                        {showSpeedControl && (
                            <View style={{
                                backgroundColor: '#f8fafc',
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 16,
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                    <Ionicons name="speedometer" size={16} color="#667eea" />
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginLeft: 6 }}>
                                        Playback Speed: {playbackState.rate.toFixed(1)}x
                                    </Text>
                                </View>

                                <View style={{
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    gap: 8,
                                    justifyContent: 'center',
                                }}>
                                    {PLAYBACK_SPEEDS.map((speed) => (
                                        <TouchableOpacity
                                            key={speed}
                                            style={{
                                                paddingVertical: 8,
                                                paddingHorizontal: 12,
                                                borderRadius: 8,
                                                backgroundColor: playbackState.rate === speed ? '#667eea' : '#ffffff',
                                                borderWidth: 1,
                                                borderColor: playbackState.rate === speed ? '#667eea' : '#e2e8f0',
                                            }}
                                            onPress={() => changePlaybackSpeed(speed)}
                                        >
                                            <Text style={{
                                                fontSize: 12,
                                                fontWeight: '600',
                                                color: playbackState.rate === speed ? '#ffffff' : '#64748b'
                                            }}>
                                                {speed}x
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Volume Control Panel */}
                        {showVolumeControl && (
                            <View style={{
                                backgroundColor: '#f8fafc',
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 16,
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                    <Ionicons name={getVolumeIcon(playbackState.volume)} size={16} color="#667eea" />
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginLeft: 6 }}>
                                        Volume: {Math.round(playbackState.volume * 100)}%
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <Ionicons name="volume-low" size={16} color="#94a3b8" />
                                    <View style={{ flex: 1 }}>
                                        <Slider
                                            value={playbackState.volume}
                                            onChange={(value) => changeVolume(value)}
                                            minValue={0}
                                            maxValue={1}
                                            step={0.01}
                                            className="w-full"
                                        >
                                            <SliderTrack>
                                                <SliderFilledTrack />
                                            </SliderTrack>
                                            <SliderThumb />
                                        </Slider>
                                    </View>
                                    <Ionicons name="volume-high" size={16} color="#94a3b8" />
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 8 }}>
                                    {[0, 0.25, 0.5, 0.75, 1.0].map((vol) => (
                                        <TouchableOpacity
                                            key={vol}
                                            style={{
                                                flex: 1,
                                                paddingVertical: 6,
                                                borderRadius: 6,
                                                backgroundColor: Math.abs(playbackState.volume - vol) < 0.01 ? '#667eea' : '#ffffff',
                                                borderWidth: 1,
                                                borderColor: Math.abs(playbackState.volume - vol) < 0.01 ? '#667eea' : '#e2e8f0',
                                                alignItems: 'center',
                                            }}
                                            onPress={() => changeVolume(vol)}
                                        >
                                            <Text style={{
                                                fontSize: 11,
                                                fontWeight: '500',
                                                color: Math.abs(playbackState.volume - vol) < 0.01 ? '#ffffff' : '#64748b'
                                            }}>
                                                {Math.round(vol * 100)}%
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* File Information */}
                        <View style={{
                            backgroundColor: '#f8fafc',
                            borderRadius: 12,
                            padding: 16,
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <Ionicons name="information-circle" size={16} color="#667eea" />
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginLeft: 6 }}>
                                    File Details
                                </Text>
                            </View>

                            <View style={{ gap: 4 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 12, color: '#64748b' }}>Format:</Text>
                                    <Text style={{ fontSize: 12, color: '#374151', fontWeight: '500' }}>
                                        {AUDIO_FORMATS.find(f => f.value === audioFormat)?.quality} MP3
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 12, color: '#64748b' }}>Size:</Text>
                                    <Text style={{ fontSize: 12, color: '#374151', fontWeight: '500' }}>
                                        {audioFileInfo.size}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 12, color: '#64748b' }}>Duration:</Text>
                                    <Text style={{ fontSize: 12, color: '#374151', fontWeight: '500' }}>
                                        {formatTime(playbackState.duration)}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 12, color: '#64748b' }}>Speed:</Text>
                                    <Text style={{ fontSize: 12, color: '#374151', fontWeight: '500' }}>
                                        {playbackState.rate.toFixed(1)}x
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 12, color: '#64748b' }}>Volume:</Text>
                                    <Text style={{ fontSize: 12, color: '#374151', fontWeight: '500' }}>
                                        {Math.round(playbackState.volume * 100)}%
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default TTSComponent;