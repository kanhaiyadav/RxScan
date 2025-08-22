import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Import Gluestack components (add these to your components/ui folder)
import { ChevronDownIcon } from '@/components/ui/icon';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@/components/ui/slider';
import { usePrescriptionNarrative } from '@/lib/generateNarrative';
import { selectPrescriptionById } from '@/Store/slices/prescriptionSlice';
import { RootState } from '@/Store/store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

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
            { name: 'en-US-GuyNeural', displayName: 'Guy (Male)', language: 'en-US', languageDisplay: 'English (US)', gender: 'Male' },
            { name: 'en-US-JennyNeural', displayName: 'Jenny (Female)', language: 'en-US', languageDisplay: 'English (US)', gender: 'Female' },
            { name: 'en-US-DavisNeural', displayName: 'Davis (Male)', language: 'en-US', languageDisplay: 'English (US)', gender: 'Male' },
        ]
    },
    {
        code: 'en-IN',
        name: '🇮🇳 English (India)',
        voices: [
            { name: 'en-IN-NeerjaNeural', displayName: 'Neerja (Female)', language: 'en-IN', languageDisplay: 'English (India)', gender: 'Female' },
            { name: 'en-IN-PrabhatNeural', displayName: 'Prabhat (Male)', language: 'en-IN', languageDisplay: 'English (India)', gender: 'Male' },
        ]
    },
    {
        code: 'hi-IN',
        name: '🇮🇳 Hindi (India)',
        voices: [
            { name: 'hi-IN-SwaraNeural', displayName: 'Swara (Female)', language: 'hi-IN', languageDisplay: 'Hindi (India)', gender: 'Female' },
            { name: 'hi-IN-MadhurNeural', displayName: 'Madhur (Male)', language: 'hi-IN', languageDisplay: 'Hindi (India)', gender: 'Male' },
        ]
    },
    {
        code: 'bn-IN',
        name: '🇮🇳 Bengali (India)',
        voices: [
            { name: 'bn-IN-TanishaaNeural', displayName: 'Tanishaa (Female)', language: 'bn-IN', languageDisplay: 'Bengali (India)', gender: 'Female' },
            { name: 'bn-IN-BashkarNeural', displayName: 'Bashkar (Male)', language: 'bn-IN', languageDisplay: 'Bengali (India)', gender: 'Male' },
        ]
    },
    {
        code: 'kn-IN',
        name: '🇮🇳 Kannada (India)',
        voices: [
            { name: 'kn-IN-SapnaNeural', displayName: 'Sapna (Female)', language: 'kn-IN', languageDisplay: 'Kannada (India)', gender: 'Female' },
            { name: 'kn-IN-GaganNeural', displayName: 'Gagan (Male)', language: 'kn-IN', languageDisplay: 'Kannada (India)', gender: 'Male' },
        ]
    },
    {
        code: 'ml-IN',
        name: '🇮🇳 Malayalam (India)',
        voices: [
            { name: 'ml-IN-SobhanaNeural', displayName: 'Sobhana (Female)', language: 'ml-IN', languageDisplay: 'Malayalam (India)', gender: 'Female' },
            { name: 'ml-IN-MidhunNeural', displayName: 'Midhun (Male)', language: 'ml-IN', languageDisplay: 'Malayalam (India)', gender: 'Male' },
        ]
    },
    {
        code: 'mr-IN',
        name: '🇮🇳 Marathi (India)',
        voices: [
            { name: 'mr-IN-AarohiNeural', displayName: 'Aarohi (Female)', language: 'mr-IN', languageDisplay: 'Marathi (India)', gender: 'Female' },
            { name: 'mr-IN-ManoharNeural', displayName: 'Manohar (Male)', language: 'mr-IN', languageDisplay: 'Marathi (India)', gender: 'Male' },
        ]
    },
    {
        code: 'pa-IN',
        name: '🇮🇳 Punjabi (India)',
        voices: [
            { name: 'pa-IN-AnanyaNeural', displayName: 'Ananya (Female)', language: 'pa-IN', languageDisplay: 'Punjabi (India)', gender: 'Female' },
            { name: 'pa-IN-SukhdeepNeural', displayName: 'Sukhdeep (Male)', language: 'pa-IN', languageDisplay: 'Punjabi (India)', gender: 'Male' },
        ]
    },
    {
        code: 'or-IN',
        name: '🇮🇳 Odia (India)',
        voices: [
            { name: 'or-IN-SuchitraNeural', displayName: 'Suchitra (Female)', language: 'or-IN', languageDisplay: 'Odia (India)', gender: 'Female' },
            { name: 'or-IN-KishoreNeural', displayName: 'Kishore (Male)', language: 'or-IN', languageDisplay: 'Odia (India)', gender: 'Male' },
        ]
    },
    {
        code: 'ta-IN',
        name: '🇮🇳 Tamil (India)',
        voices: [
            { name: 'ta-IN-PallaviNeural', displayName: 'Pallavi (Female)', language: 'ta-IN', languageDisplay: 'Tamil (India)', gender: 'Female' },
            { name: 'ta-IN-ValluvarNeural', displayName: 'Valluvar (Male)', language: 'ta-IN', languageDisplay: 'Tamil (India)', gender: 'Male' },
        ]
    },
    {
        code: 'te-IN',
        name: '🇮🇳 Telugu (India)',
        voices: [
            { name: 'te-IN-ShrutiNeural', displayName: 'Shruti (Female)', language: 'te-IN', languageDisplay: 'Telugu (India)', gender: 'Female' },
            { name: 'te-IN-MohanNeural', displayName: 'Mohan (Male)', language: 'te-IN', languageDisplay: 'Telugu (India)', gender: 'Male' },
        ]
    },
    {
        code: 'gu-IN',
        name: '🇮🇳 Gujarati (India)',
        voices: [
            { name: 'gu-IN-DhwaniNeural', displayName: 'Dhwani (Female)', language: 'gu-IN', languageDisplay: 'Gujarati (India)', gender: 'Female' },
            { name: 'gu-IN-NiranjanNeural', displayName: 'Niranjan (Male)', language: 'gu-IN', languageDisplay: 'Gujarati (India)', gender: 'Male' },
        ]
    },
    {
        code: 'ur-IN',
        name: '🇮🇳 Urdu (India)',
        voices: [
            { name: 'ur-IN-GulNeural', displayName: 'Gul (Female)', language: 'ur-IN', languageDisplay: 'Urdu (India)', gender: 'Female' },
            { name: 'ur-IN-SalmanNeural', displayName: 'Salman (Male)', language: 'ur-IN', languageDisplay: 'Urdu (India)', gender: 'Male' },
        ]
    },
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
    const [audioFormat, setAudioFormat] = useState<string>(`${AUDIO_FORMATS[2].quality}-${AUDIO_FORMATS[2].display}`);
    const [speechRate, setSpeechRate] = useState<number>(1.0);
    const [speechPitch, setSpeechPitch] = useState<string>('+0%');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isTranslating, setIsTranslating] = useState<boolean>(false);
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

    const { generateNarrative } = usePrescriptionNarrative(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);
    const [narrative, setNarrative] = useState<string | null>(null);
    const router = useRouter();
    const { prescriptionId } = useLocalSearchParams();
    const data = useSelector((state: RootState) => selectPrescriptionById(state, Array.isArray(prescriptionId) ? prescriptionId[0] : prescriptionId));

    useEffect(() => {
        (async () => {
            setIsTranslating(true);
            const { raw_response, ...withoutRaw } = data.ocrResult;
            const result = await generateNarrative(withoutRaw, { language: selectedLanguage.name });
            // const result = {
            //     narrative: "Generated narrative text",
            //     // Add any other properties you need
            // }
            if (result.narrative) {
                setText(result.narrative);
            }
            setIsTranslating(false);
        })();
    }, [selectedLanguage, data?.ocrResult])

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
                colors={['#00ffc8', '#80f7ed']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className='p-4 flex-row items-center gap-4'
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                >
                    <Ionicons name='arrow-back' size={24} />
                </TouchableOpacity>
                <View>
                    <Text className="text-2xl font-bold text-gray-900">
                        Hear Prescription
                    </Text>
                    <Text className="text-base text-gray-600">
                        Hear out what your prescription has to say
                    </Text>
                </View>
            </LinearGradient>

            <View style={{ padding: 20 }}>

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
                    elevation: 2,
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Ionicons name="mic" size={20} color="teal" />
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
                            selectedValue={selectedLanguage.name}
                            onValueChange={(value) => {
                                const lang = LANGUAGE_GROUPS.find(l => l.code === value);
                                if (lang) {
                                    setSelectedLanguage(lang);
                                    setSelectedVoice(lang.voices[0]);
                                }
                            }}
                            isDisabled={isTranslating}
                        >
                            <SelectTrigger variant="outline" size="lg">
                                <SelectInput placeholder="Select Language" className='h-[50px] px-4 text-gray-600 text-md' />
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
                            selectedValue={selectedVoice.displayName}
                            onValueChange={(value) => {
                                const voice = selectedLanguage.voices.find(v => v.name === value);
                                if (voice) {
                                    setSelectedVoice(voice);
                                }
                            }}
                        >
                            <SelectTrigger variant="outline" size="lg">
                                <SelectInput placeholder="Select Voice" className='h-[50px] px-4 text-gray-600 text-md' />
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
                                            label={`${voice.displayName}`}
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
                            <SelectTrigger variant="outline" size="lg">
                                <SelectInput placeholder="Select Quality" className='h-[50px] px-4 text-gray-600 text-md' />
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
                                            value={format.quality}
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
                            <Text style={{ fontSize: 14, fontWeight: '600' }} className='text-primary-500'>
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
                                        backgroundColor: speechPitch === pitch ? 'teal' : '#f1f5f9',
                                        borderWidth: 1,
                                        borderColor: speechPitch === pitch ? 'teal' : '#e2e8f0',
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
                        borderRadius: 16,
                        padding: 18,
                        marginBottom: 20,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: isGenerating ? 0 : 0.3,
                        shadowRadius: 8,
                        elevation: isGenerating ? 0 : 3,
                    }}
                    className={`${isGenerating || isTranslating ? 'bg-gray-300' : 'bg-primary-400'}`}
                    onPress={generateSpeech}
                    disabled={isGenerating || isTranslating}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        {isGenerating ? (
                            <>
                                <Ionicons name="hourglass" size={24} color="#ffffff" />
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

                {
                    isTranslating && (
                        <View className='flex-row items-center gap-2 justify-center'>
                            <ActivityIndicator size="small" color="#00b894" />
                            <Text className='text-center text-gray-500 text-sm'>
                                Translating & Narrating your prescription into {selectedVoice.languageDisplay}
                            </Text>
                        </View>
                    )
                }

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
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        shadowColor: 'teal',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: playbackState.isLoading ? 0 : 0.3,
                                        shadowRadius: 8,
                                        elevation: playbackState.isLoading ? 0 : 8,
                                    }}
                                    className={"bg-primary-400"}
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
                                        backgroundColor: showSpeedControl ? 'teal' : '#f1f5f9',
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
                                        backgroundColor: showVolumeControl ? 'teal' : '#f1f5f9',
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
                                    <Ionicons name="speedometer" size={16} color="teal" />
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
                                                backgroundColor: playbackState.rate === speed ? 'teal' : '#ffffff',
                                                borderWidth: 1,
                                                borderColor: playbackState.rate === speed ? 'teal' : '#e2e8f0',
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
                                    <Ionicons name={getVolumeIcon(playbackState.volume)} size={16} color="teal" />
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
                                                backgroundColor: Math.abs(playbackState.volume - vol) < 0.01 ? 'teal' : '#ffffff',
                                                borderWidth: 1,
                                                borderColor: Math.abs(playbackState.volume - vol) < 0.01 ? 'teal' : '#e2e8f0',
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
                                <Ionicons name="information-circle" size={16} color="teal" />
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