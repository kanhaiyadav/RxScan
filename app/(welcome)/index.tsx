import React, { useEffect } from 'react'
import { View, Image, Text, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next';
import slide1 from "@/assets/images/slide1.png";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Index = () => {
  const { t, i18n } = useTranslation();
  const asyncStorage = AsyncStorage;
  
  useEffect(() => {
    asyncStorage.getItem("hasSeenWelcome").then((value) => {
      if (value === null) {
        // If the user has not seen the welcome screen, set it to true
        asyncStorage.setItem("hasSeenWelcome", "true");
      }
    }).catch((error) => {
      console.error("Error accessing AsyncStorage:", error);
    });
  }, [asyncStorage]);

  // Quick language switch function
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };
  
  return (
    <View className='flex-1 flex'>
      {/* Language Quick Switch - Optional for demo */}
      <View className="flex-row justify-center pt-4 space-x-2">
        <TouchableOpacity 
          onPress={() => changeLanguage('en')}
          className={`px-3 py-1 rounded-full ${i18n.language === 'en' ? 'bg-primary-500' : 'bg-gray-200'}`}
        >
          <Text className={`text-xs ${i18n.language === 'en' ? 'text-white font-bold' : 'text-gray-600'}`}>EN</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => changeLanguage('hi')}
          className={`px-3 py-1 rounded-full ${i18n.language === 'hi' ? 'bg-primary-500' : 'bg-gray-200'}`}
        >
          <Text className={`text-xs ${i18n.language === 'hi' ? 'text-white font-bold' : 'text-gray-600'}`}>हि</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => changeLanguage('bn')}
          className={`px-3 py-1 rounded-full ${i18n.language === 'bn' ? 'bg-primary-500' : 'bg-gray-200'}`}
        >
          <Text className={`text-xs ${i18n.language === 'bn' ? 'text-white font-bold' : 'text-gray-600'}`}>বা</Text>
        </TouchableOpacity>
      </View>

      <View className='flex-1 items-center justify-center'>
        <View className='w-full mt-[100px]'
          style={{
            aspectRatio: "573/436",
          }}
        >
          <Image
            source={slide1}
            alt='no image'
            className="w-full h-full mx-auto"
          />
        </View>
      </View>
      <View>
        <View className="flex flex-col items-center mt-10">
          <Text className="text-4xl text-center text-gray-800 font-bold">
            {t('welcomeTitle', "Let's Simplify Your Meds.")}
          </Text>
          <Text className="text-xl text-gray-600 mt-4 text-center">
            {t('welcomeSubtitle', "RxScan helps you scan, store, and manage prescriptions — so you can focus on feeling better.")}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default Index