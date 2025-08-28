import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';

const AboutRxScanPage: React.FC = () => {

    const router = useRouter();
    
    return (
        <ScrollView className="flex-1 bg-background-50">
            <LinearGradient
                colors={['#00ffc8', '#80f7ed']}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                className='p-4 flex-row items-center gap-4 border-b-1 border-gray-200 dark:border-outline-200'
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                >
                    <Ionicons name='arrow-back' size={24} />
                </TouchableOpacity>
                <View>
                    <Text className="text-2xl font-bold text-gray-900">
                        About RxScan
                    </Text>
                    <Text className="text-base text-gray-500">
                        Making Prescriptions Simple & Accessible
                    </Text>
                </View>
            </LinearGradient>
            <View className="px-6 py-8">

                {/* Mission Statement */}
                <View className="rounded-lg mb-8">
                    <Text className="text-lg text-typography-950 text-center leading-7">
                        RxScan was created to make medical prescriptions easier to understand for everyone —
                        especially for patients with visual impairments, low literacy, language barriers,
                        and elderly users needing reminders.
                    </Text>
                </View>

                {/* What RxScan Offers */}
                <View className="mb-8">
                    <Text className="text-lg font-semibold text-typography-600 mb-6">
                        What RxScan Offers
                    </Text>

                    <View className="gap-4">
                        <View className="bg-background-0 rounded-lg p-5 elevation-sm">
                            <View className="flex-row items-center mb-3">
                                <Text className="text-2xl mr-4">🤖</Text>
                                <Text className="text-lg font-semibold text-typography-800 flex-1">
                                    AI-powered OCR
                                </Text>
                            </View>
                            <Text className="text-typography-950 leading-6 pl-12">
                                Extracts text from prescriptions using advanced AI technology.
                            </Text>
                        </View>

                        <View className="bg-background-0 rounded-lg p-5 elevation-sm">
                            <View className="flex-row items-center mb-3">
                                <Text className="text-2xl mr-4">💊</Text>
                                <Text className="text-lg font-semibold text-typography-800 flex-1">
                                    Medicine Lookup
                                </Text>
                            </View>
                            <Text className="text-typography-950 leading-6 pl-12">
                                Provides easy-to-read medicine details and dosage information.
                            </Text>
                        </View>

                        <View className="bg-background-0 rounded-lg p-5 elevation-sm">
                            <View className="flex-row items-center mb-3">
                                <Text className="text-2xl mr-4">🔊</Text>
                                <Text className="text-lg font-semibold text-typography-800 flex-1">
                                    Audio Narration
                                </Text>
                            </View>
                            <Text className="text-typography-950 leading-6 pl-12">
                                Reads prescriptions aloud in natural voices for accessibility.
                            </Text>
                        </View>

                        <View className="bg-background-0 rounded-lg p-5 elevation-sm">
                            <View className="flex-row items-center mb-3">
                                <Text className="text-2xl mr-4">⏰</Text>
                                <Text className="text-lg font-semibold text-typography-800 flex-1">
                                    Reminders
                                </Text>
                            </View>
                            <Text className="text-typography-950 leading-6 pl-12">
                                Ensures medicines are taken on time with smart notifications.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Our Mission */}
                <View className="mb-8">
                    <Text className="text-lg font-semibold text-typography-500 mb-4">
                        Our Mission
                    </Text>
                    <View className="bg-green-500/15 rounded-lg p-6">
                        <Text className="text-typography-800 text-base leading-7 text-center">
                            To empower patients with accessible, understandable, and reliable health information,
                            reducing medication errors and improving adherence.
                        </Text>
                    </View>
                </View>

                {/* Our Vision */}
                <View className="mb-8">
                    <Text className="text-lg font-semibold text-typography-500 mb-4">
                        Our Vision
                    </Text>
                    <View className="bg-purple-500/15 rounded-lg p-6">
                        <Text className="text-typography-800 text-base leading-7 text-center">
                            A world where <Text className="font-bold">healthcare is accessible to everyone</Text>,
                            regardless of literacy, language, or ability.
                        </Text>
                    </View>
                </View>

                {/* Target Users */}
                <View className="mb-8">
                    <Text className="text-lg font-semibold text-typography-600 mb-6">
                        Who Benefits from RxScan
                    </Text>

                    <View className="grid grid-cols-2 gap-4">
                        <View className="bg-orange-50 dark:bg-orange-500/15 border border-orange-50 rounded-lg p-4">
                            <Text className="text-3xl text-center mb-2">👁️</Text>
                            <Text className="text-sm font-medium text-orange-800 dark:text-orange-500 text-center">
                                Visual Impairments
                            </Text>
                        </View>

                        <View className="bg-blue-50 dark:bg-blue-500/15 border border-blue-500 rounded-lg p-4">
                            <Text className="text-3xl text-center mb-2">📚</Text>
                            <Text className="text-sm font-medium text-blue-800 dark:text-blue-500 text-center">
                                Low Literacy
                            </Text>
                        </View>

                        <View className="bg-green-50 dark:bg-green-500/15 border border-green-500 rounded-lg p-4">
                            <Text className="text-3xl text-center mb-2">🌍</Text>
                            <Text className="text-sm font-medium text-green-800 dark:text-green-500 text-center">
                                Language Barriers
                            </Text>
                        </View>

                        <View className="bg-purple-50 dark:bg-purple-500/15 border border-purple-500 rounded-lg p-4">
                            <Text className="text-3xl text-center mb-2">👴</Text>
                            <Text className="text-sm font-medium text-purple-800 dark:text-purple-500 text-center">
                                Elderly Users
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Technology Stack */}
                <View className="mb-8">
                    <Text className="text-lg font-semibold text-typography-600 mb-6">
                        Powered By
                    </Text>

                    <View className="gap-3">
                        <View className="flex-row items-center bg-background-0 rounded-lg p-4">
                            <Text className="text-lg mr-3">🧠</Text>
                            <View className="flex-1">
                                <Text className="font-medium text-typography-800">Google Gemini AI</Text>
                                <Text className="text-sm text-typography-950">Advanced OCR and text processing</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center bg-background-0 rounded-lg p-4">
                            <Text className="text-lg mr-3">🎤</Text>
                            <View className="flex-1">
                                <Text className="font-medium text-typography-800">Azure Cognitive Services</Text>
                                <Text className="text-sm text-typography-950">Natural text-to-speech narration</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center bg-background-0 rounded-lg p-4">
                            <Text className="text-lg mr-3">🔍</Text>
                            <View className="flex-1">
                                <Text className="font-medium text-typography-800">Google Search Grounding</Text>
                                <Text className="text-sm text-typography-950">Verified medicine information</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Contact/Feedback */}
                <View className="rounded-lg p-6 mt-8">
                    <Text className="text-xl font-semibold text-typography-600 text-center mb-3">
                        Have Feedback or Questions?
                    </Text>
                    <Text className="text-typography-700 text-center leading-6">
                        We&apos;re constantly improving RxScan based on user feedback.
                        Reach out to us at{' '}
                        <Text className="font-semibold text-blue-600">hello@rxscan.app</Text>
                    </Text>
                </View>

                {/* Version Info */}
                <View className="mt-8 items-center">
                    <Text className="text-sm text-typography-500">
                        Version 1.0.0 • Made with ❤️ for better healthcare
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default AboutRxScanPage;