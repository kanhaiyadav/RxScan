import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogBackdrop,
} from "@/components/ui/alert-dialog";

interface Language {
    code: string;
    name: string;
    nativeName: string;
}

const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
];

export default function LanguageSwitcher() {
    const { t, i18n } = useTranslation();
    const [showLanguageDialog, setShowLanguageDialog] = useState(false);

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (languageCode: string) => {
        i18n.changeLanguage(languageCode);
        setShowLanguageDialog(false);
    };

    return (
        <>
            <TouchableOpacity
                className="flex-row items-center justify-between p-4 pr-11"
                onPress={() => setShowLanguageDialog(true)}
            >
                <View className="flex-row items-center">
                    <View className="bg-indigo-500 w-10 h-10 rounded-full items-center justify-center mr-4">
                        <Ionicons name="language" size={20} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-typography-900 font-medium">{t('language')}</Text>
                        <Text className="text-typography-500 text-sm mt-1">{currentLanguage.nativeName}</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <AlertDialog isOpen={showLanguageDialog} onClose={() => setShowLanguageDialog(false)} size="md">
                <AlertDialogBackdrop />
                <AlertDialogContent className='bg-background-0 border-0'>
                    <AlertDialogHeader>
                        <Text className='text-xl font-bold'>
                            {t('selectLanguage')}
                        </Text>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        {languages.map((language) => (
                            <TouchableOpacity
                                key={language.code}
                                className={`p-4 rounded-lg mb-2 flex-row items-center justify-between ${i18n.language === language.code ? 'bg-primary-100' : 'bg-gray-50'
                                    }`}
                                onPress={() => changeLanguage(language.code)}
                            >
                                <View>
                                    <Text className={`font-medium ${i18n.language === language.code ? 'text-primary-600' : 'text-typography-900'
                                        }`}>
                                        {language.nativeName}
                                    </Text>
                                    <Text className="text-typography-500 text-sm">{language.name}</Text>
                                </View>
                                {i18n.language === language.code && (
                                    <Ionicons name="checkmark-circle" size={24} color="#14B8A6" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </AlertDialogBody>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}