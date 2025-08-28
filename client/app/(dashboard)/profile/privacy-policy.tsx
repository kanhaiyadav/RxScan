import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';

const PrivacyPolicyPage: React.FC = () => {

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
                        Privacy Policy
                    </Text>
                    <Text className="text-base text-gray-500">
                        Effective Date: 1st September 2025
                    </Text>
                </View>
            </LinearGradient>
            <View className="px-6 py-8">

                <Text className="text-lg text-typography-950 mb-8 leading-6">
                    At RxScan, your privacy is our priority.
                </Text>

                {/* Section 1 */}
                <View className="mb-8">
                    <Text className="text-xl font-semibold text-typography-600 mb-4">
                        1. Data We Collect
                    </Text>
                    <View className="pl-4 gap-4">
                        <View>
                            <Text className="text-base font-semibold text-typography-700 mb-1">
                                • Prescription Data:
                            </Text>
                            <Text className="text-typography-950 text-base leading-6 pl-4">
                                Uploaded prescriptions are processed using AI to extract text and provide insights.
                            </Text>
                        </View>

                        <View>
                            <Text className="text-base font-semibold text-typography-700 mb-1">
                                • Usage Data:
                            </Text>
                            <Text className="text-typography-950 text-base leading-6 pl-4">
                                App performance, crash reports, and usage patterns to improve our services.
                            </Text>
                        </View>

                        <View>
                            <Text className="text-base font-semibold text-typography-700 mb-1">
                                • Reminders & Preferences:
                            </Text>
                            <Text className="text-typography-950 text-base leading-6 pl-4">
                                Medicine schedules and app settings.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Section 2 */}
                <View className="mb-8">
                    <Text className="text-xl font-semibold text-typography-600 mb-4">
                        2. How We Use Your Data
                    </Text>
                    <View className="pl-4">
                        <View className="flex-row mb-3">
                            <Text className="text-typography-950 text-base mr-2">•</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                To provide prescription scanning, medicine details, reminders, and audio narration.
                            </Text>
                        </View>
                        <View className="flex-row mb-3">
                            <Text className="text-typography-950 text-base mr-2">•</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                To improve app performance and user experience.
                            </Text>
                        </View>
                        <View className="flex-row mb-3">
                            <Text className="text-typography-950 text-base mr-2">•</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                <Text className="font-semibold">Never</Text> for advertising or selling to third parties.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Section 3 */}
                <View className="mb-8">
                    <Text className="text-xl font-semibold text-typography-600 mb-4">
                        3. Data Security
                    </Text>
                    <View className="bg-green-50 dark:bg-green-500/15 rounded-lg p-6 border border-green-500">
                        <View className="flex-row items-center mb-3">
                            <Text className="text-lg mr-3">🔒</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                All prescription data is encrypted.
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-lg mr-3">☁️</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                Secure cloud storage and access control protect your information.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Section 4 */}
                <View className="mb-8">
                    <Text className="text-xl font-semibold text-typography-600 mb-4">
                        4. Third-Party Services
                    </Text>
                    <Text className="text-typography-950 text-base mb-4 leading-6">
                        We integrate with:
                    </Text>
                    <View className="pl-4 gap-4">
                        <View className="bg-blue-50 dark:bg-blue-500/15 rounded-lg p-4 border border-blue-500">
                            <Text className="text-base font-semibold text-blue-800 dark:text-blue-500 mb-2">
                                • Gemini API (Google):
                            </Text>
                            <Text className="text-blue-700 dark:text-blue-400 text-sm leading-5">
                                For OCR and search grounding.
                            </Text>
                        </View>

                        <View className="bg-purple-50 dark:bg-purple-500/15 rounded-lg p-4 border border-purple-500">
                            <Text className="text-base font-semibold text-purple-800 dark:text-purple-500 mb-2">
                                • Azure Cognitive Services:
                            </Text>
                            <Text className="text-purple-700 dark:text-purple-400 text-sm leading-5">
                                For text-to-speech narration.
                            </Text>
                        </View>
                    </View>
                    <Text className="text-typography-600 text-sm mt-4 leading-5 italic">
                        These services may process limited data to deliver results.
                    </Text>
                </View>

                {/* Section 5 */}
                <View className="mb-8">
                    <Text className="text-xl font-semibold text-typography-600 mb-4">
                        5. Your Rights
                    </Text>
                    <View className="bg-background-0 rounded-lg p-6 elevation-sm">
                        <View className="flex-row items-center mb-4">
                            <Text className="text-lg mr-3">🗑️</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                You can delete your account and all data at any time.
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-lg mr-3">📋</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                You can request a copy of your stored data via support.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Contact Section */}
                <View className="bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500 rounded-lg p-6 mt-8">
                    <Text className="text-blue-800 dark:text-blue-500 font-semibold text-center text-lg mb-2">
                        Questions About Privacy?
                    </Text>
                    <Text className="text-blue-700 dark:text-blue-400 text-center leading-6">
                        Contact us at <Text className="font-semibold">privacy@rxscan.app</Text> for
                        any questions about how we handle your data.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default PrivacyPolicyPage;