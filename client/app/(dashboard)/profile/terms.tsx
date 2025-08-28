import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';

const TermsOfServicePage: React.FC = () => {

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
                        Terms of Service
                    </Text>
                    <Text className="text-base text-gray-500">
                        Effective Date: 1st September 2025
                    </Text>
                </View>
            </LinearGradient>
            <View className="px-6 py-8">
                <Text className="text-lg text-typography-950 mb-8 leading-6">
                    Welcome to RxScan! By using our app, you agree to the following terms:
                </Text>

                {/* Section 1 */}
                <View className="mb-8">
                    <Text className="text-xl font-semibold text-typography-600 mb-4">
                        1. Use of the App
                    </Text>
                    <View className="pl-4">
                        <View className="flex-row mb-3">
                            <Text className="text-typography-950 text-base mr-2">•</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                RxScan provides AI-powered tools to read prescriptions, explain medicines,
                                set reminders, and offer audio narration.
                            </Text>
                        </View>
                        <View className="flex-row mb-3">
                            <Text className="text-typography-950 text-base mr-2">•</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                RxScan is <Text className="font-semibold">not a substitute for medical advice,
                                    diagnosis, or treatment</Text>. Always consult your healthcare provider.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Section 2 */}
                <View className="mb-8">
                    <Text className="text-xl font-semibold text-typography-600 mb-4">
                        2. User Responsibilities
                    </Text>
                    <View className="pl-4">
                        <View className="flex-row mb-3">
                            <Text className="text-typography-950 text-base mr-2">•</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                You are responsible for the accuracy of prescriptions uploaded.
                            </Text>
                        </View>
                        <View className="flex-row mb-3">
                            <Text className="text-typography-950 text-base mr-2">•</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                You must not misuse the app (e.g., upload irrelevant or harmful content).
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Section 3 */}
                <View className="mb-8">
                    <Text className="text-xl font-semibold text-typography-600 mb-4">
                        3. Data & Privacy
                    </Text>
                    <View className="pl-4">
                        <View className="flex-row mb-3">
                            <Text className="text-typography-950 text-base mr-2">•</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                Your data (prescriptions, reminders, settings) is stored securely and
                                never sold to third parties.
                            </Text>
                        </View>
                        <View className="flex-row mb-3">
                            <Text className="text-typography-950 text-base mr-2">•</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                For more details, see our <Text className="font-semibold text-blue-600">
                                    Privacy Policy</Text>.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Section 4 */}
                <View className="mb-8">
                    <Text className="text-xl font-semibold text-typography-600 mb-4">
                        4. Limitations of Liability
                    </Text>
                    <View className="pl-4">
                        <View className="flex-row mb-3">
                            <Text className="text-typography-950 text-base mr-2">•</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                RxScan strives for accuracy but cannot guarantee 100% correctness of
                                OCR or medical details.
                            </Text>
                        </View>
                        <View className="flex-row mb-3">
                            <Text className="text-typography-950 text-base mr-2">•</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                We are not liable for medical outcomes based on app usage.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Section 5 */}
                <View className="mb-8">
                    <Text className="text-xl font-semibold text-typography-600 mb-4">
                        5. Modifications
                    </Text>
                    <View className="pl-4">
                        <View className="flex-row mb-3">
                            <Text className="text-typography-950 text-base mr-2">•</Text>
                            <Text className="text-typography-950 text-base flex-1 leading-6">
                                We may update these terms from time to time. Continued use of the app
                                means you accept the changes.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Disclaimer Box */}
                <View className="bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500 rounded-lg p-6 mt-8">
                    <Text className="text-red-800 dark:text-red-500 font-semibold text-center text-lg mb-2">
                        ⚠️ Important Medical Disclaimer
                    </Text>
                    <Text className="text-red-700 dark:text-red-400 text-center leading-6">
                        RxScan is for informational purposes only and should not replace professional
                        medical advice. Always consult with qualified healthcare providers for medical decisions.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default TermsOfServicePage;