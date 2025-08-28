import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Linking } from 'react-native';
import {
    Accordion,
    AccordionItem,
    AccordionHeader,
    AccordionTrigger,
    AccordionTitleText,
    AccordionContentText,
    AccordionIcon,
    AccordionContent,
} from "@/components/ui/accordion"
import { ChevronDownIcon, ChevronUpIcon } from '@/components/ui/icon';
import { Divider } from "@/components/ui/divider"
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const HelpSupportPage: React.FC = () => {
    const handleEmailPress = () => {
        Linking.openURL('mailto:support@rxscan.app');
    };

    const handleWebsitePress = () => {
        Linking.openURL('https://www.rxscan.app/help');
    };

    const router = useRouter();

    const faqData = [
        {
            id: 'q1',
            icon: 'scan',
            title: 'How does RxScan work?',
            content: 'RxScan scans your prescription using advanced AI (Gemini model) to extract text. It then provides easy-to-understand medicine details, dosage guidance, reminders, and audio narration for better accessibility.',
            color: 'bg-blue-500'
        },
        {
            id: 'q2',
            icon: 'checkmark-circle',
            title: 'Is RxScan accurate?',
            content: 'We use AI-powered OCR and verified data sources. However, the information is for educational purposes only. Always confirm with your doctor or pharmacist before making decisions.',
            color: 'bg-green-500'
        },
        {
            id: 'q3',
            icon: 'notifications',
            title: 'Can I set medicine reminders?',
            content: 'Yes, RxScan allows you to set daily reminders so you never miss your dose.',
            color: 'bg-purple-500'
        },
        {
            id: 'q4',
            icon: 'language',
            title: 'Does RxScan support multiple languages?',
            content: 'Yes, we support English and several Indian languages with natural-sounding audio narration.',
            color: 'bg-orange-500'
        },
        {
            id: 'q5',
            icon: 'shield-checkmark',
            title: 'Where are my prescriptions stored?',
            content: 'Prescriptions are securely stored within the app, encrypted, and accessible only to you.',
            color: 'bg-teal-500'
        }
    ];

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
                        Help & Support
                    </Text>
                    <Text className="text-base text-gray-500">
                        We&apos;re here to ensure smooth experience.
                    </Text>
                </View>
            </LinearGradient>
            <View className="px-6 py-8">
                {/* FAQ Section */}
                <View className="mb-8">
                    <Text className="text-lg font-semibold text-typography-950 mb-4">
                        Frequently Asked Questions
                    </Text>

                    <View className="bg-background-0 rounded-2xl shadow-sm border border-outline-200">
                        <Accordion
                            size="md"
                            variant="filled"
                            type="single"
                            isCollapsible={true}
                            isDisabled={false}
                            className="border-0 rounded-2xl overflow-hidden"
                        >
                            {faqData.map((faq, faqIndex) => (
                                <View key={faq.id}>
                                    <AccordionItem value={faq.id} className='p-1'>
                                        <AccordionHeader>
                                            <AccordionTrigger>
                                                {({ isExpanded }: { isExpanded: boolean }) => {
                                                    return (
                                                        <>
                                                            <View className="flex-1">
                                                                <Text className='text-md font-bold text-typography-950'>{faq.title}</Text>
                                                            </View>
                                                            {isExpanded ? (
                                                                <AccordionIcon as={ChevronUpIcon} className="ml-3" />
                                                            ) : (
                                                                <AccordionIcon as={ChevronDownIcon} className="ml-3" />
                                                            )}
                                                        </>
                                                    )
                                                }}
                                            </AccordionTrigger>
                                        </AccordionHeader>
                                        <AccordionContent>
                                            <View className='pl-4 pr-4 pb-2'>
                                                <Text className='text-sm text-gray-700 leading-6'>
                                                    {faq.content.includes('educational purposes only') ? (
                                                        <>
                                                            We use AI-powered OCR and verified data sources. However, the information is for{' '}
                                                            <Text className="font-semibold">educational purposes only</Text>. Always confirm
                                                            with your doctor or pharmacist before making decisions.
                                                        </>
                                                    ) : (
                                                        faq.content
                                                    )}
                                                </Text>
                                            </View>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <Divider className={`${faqIndex < faqData.length - 1 ? 'block' : 'hidden'}`} />
                                </View>
                            ))}
                        </Accordion>
                    </View>
                </View>

                {/* Contact Support Section */}
                <View className="mb-8">
                    <Text className="text-lg font-semibold text-typography-950 mb-4">
                        Contact Support
                    </Text>

                    <View className="bg-background-0 elevation-sm rounded-lg p-6">
                        <Text className="text-typography-700 mb-4 leading-6">
                            If you have any issues, questions, or feedback:
                        </Text>

                        <View className="space-y-3">
                            <TouchableOpacity onPress={handleEmailPress} className="flex-row items-center">
                                <Text className="text-lg">📧</Text>
                                <Text className="text-blue-500 underline ml-2 text-base">
                                    support@rxscan.app
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleWebsitePress} className="flex-row items-center">
                                <Text className="text-lg">🌐</Text>
                                <Text className="text-blue-500 underline ml-2 text-base">
                                    www.rxscan.app/help
                                </Text>
                            </TouchableOpacity>

                            <View className="flex-row items-center">
                                <Text className="text-lg">📱</Text>
                                <Text className="text-typography-700 ml-2 text-base">
                                    In-app chat: Available under &quot;Support&quot; in settings
                                </Text>
                            </View>
                        </View>

                        <View className="mt-6 p-4 bg-white rounded-lg">
                            <Text className="text-gray-700 text-center font-medium">
                                We usually respond within 24–48 hours
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default HelpSupportPage;