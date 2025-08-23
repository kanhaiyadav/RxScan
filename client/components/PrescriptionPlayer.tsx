import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Modal,
    ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { AzureSpeechService, PrescriptionData, VoiceOption } from '@/lib/tts';

interface PrescriptionPlayerProps {
    prescriptionData: PrescriptionData;
    onPlayStart?: () => void;
    onPlayEnd?: () => void;
}

const PrescriptionPlayer: React.FC<PrescriptionPlayerProps> = ({
    prescriptionData,
    onPlayStart,
    onPlayEnd
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural');
    const [showVoiceSelector, setShowVoiceSelector] = useState(false);
    const [speechService] = useState(new AzureSpeechService());
    const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);

    useEffect(() => {
        setAvailableVoices(speechService.getAvailableVoices());
    }, []);

    const handlePlay = async () => {
        try {
            setIsLoading(true);

            await speechService.speakPrescription(
                prescriptionData,
                selectedVoice,
                () => {
                    setIsPlaying(true);
                    setIsLoading(false);
                    onPlayStart?.();
                },
                () => {
                    setIsPlaying(false);
                    onPlayEnd?.();
                }
            );
        } catch (error) {
            setIsLoading(false);
            setIsPlaying(false);
            Alert.alert(
                'Speech Error',
                'Unable to play prescription audio. Please check your internet connection and try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleStop = async () => {
        try {
            await speechService.stopSpeech();
            setIsPlaying(false);
        } catch (error) {
            console.error('Error stopping speech:', error);
        }
    };

    const getSelectedVoiceInfo = () => {
        return availableVoices.find(v => v.voiceName === selectedVoice);
    };

    const renderPlayButton = () => {
        if (isLoading) {
            return (
                <View style={styles.playButton}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.statusText}>Preparing audio...</Text>
                </View>
            );
        }

        if (isPlaying) {
            return (
                <TouchableOpacity style={[styles.playButton, styles.stopButton]} onPress={handleStop}>
                    <Ionicons name="stop-circle" size={60} color="#FF3B30" />
                    <Text style={styles.buttonText}>Stop</Text>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
                <Ionicons name="play-circle" size={60} color="#007AFF" />
                <Text style={styles.buttonText}>Listen to Prescription</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🔊 Audio Prescription Reader</Text>
                <Text style={styles.subtitle}>
                    Listen to your prescription in natural, easy-to-understand language
                </Text>
            </View>

            {/* Voice Selector */}
            <TouchableOpacity
                style={styles.voiceSelector}
                onPress={() => setShowVoiceSelector(true)}
            >
                <Ionicons name="person-circle" size={24} color="#007AFF" />
                <View style={styles.voiceInfo}>
                    <Text style={styles.voiceLabel}>Voice:</Text>
                    <Text style={styles.voiceName}>
                        {getSelectedVoiceInfo()?.displayName || 'English (US) - Jenny'}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>

            {/* Main Play Button */}
            <View style={styles.playerContainer}>
                {renderPlayButton()}
            </View>

            {/* Status Information */}
            {isPlaying && (
                <View style={styles.statusContainer}>
                    <View style={styles.waveform}>
                        <Text style={styles.statusText}>🎵 Playing prescription...</Text>
                    </View>
                </View>
            )}

            {/* Features List */}
            <View style={styles.features}>
                <Text style={styles.featuresTitle}>Features:</Text>
                <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                    <Text style={styles.featureText}>Natural conversational tone</Text>
                </View>
                <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                    <Text style={styles.featureText}>Multiple language support</Text>
                </View>
                <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                    <Text style={styles.featureText}>Clear medication instructions</Text>
                </View>
                <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                    <Text style={styles.featureText}>Optimized for elderly users</Text>
                </View>
            </View>

            {/* Voice Selection Modal */}
            <Modal
                visible={showVoiceSelector}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Voice</Text>
                        <TouchableOpacity onPress={() => setShowVoiceSelector(false)}>
                            <Text style={styles.doneButton}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.voiceList}>
                        {availableVoices.map((voice) => (
                            <TouchableOpacity
                                key={voice.voiceName}
                                style={[
                                    styles.voiceOption,
                                    selectedVoice === voice.voiceName && styles.selectedVoiceOption
                                ]}
                                onPress={() => {
                                    setSelectedVoice(voice.voiceName);
                                    setShowVoiceSelector(false);
                                }}
                            >
                                <View style={styles.voiceDetails}>
                                    <Text style={styles.voiceDisplayName}>{voice.displayName}</Text>
                                    <Text style={styles.voiceLocale}>{voice.locale}</Text>
                                </View>
                                {selectedVoice === voice.voiceName && (
                                    <Ionicons name="checkmark" size={24} color="#007AFF" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F2F2F7',
        borderRadius: 16,
        padding: 20,
        margin: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
    },
    voiceSelector: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    voiceInfo: {
        flex: 1,
        marginLeft: 12,
    },
    voiceLabel: {
        fontSize: 14,
        color: '#8E8E93',
    },
    voiceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        marginTop: 2,
    },
    playerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    playButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
        minWidth: 200,
    },
    stopButton: {
        backgroundColor: '#FFEBEE',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
        marginTop: 8,
    },
    statusContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    waveform: {
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: 16,
    },
    statusText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '500',
    },
    features: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureText: {
        fontSize: 16,
        color: '#1C1C1E',
        marginLeft: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    modalHeader: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    doneButton: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
    voiceList: {
        flex: 1,
    },
    voiceOption: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 12,
    },
    selectedVoiceOption: {
        backgroundColor: '#E3F2FD',
        borderColor: '#007AFF',
        borderWidth: 1,
    },
    voiceDetails: {
        flex: 1,
    },
    voiceDisplayName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    voiceLocale: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 2,
    },
});

export default PrescriptionPlayer;