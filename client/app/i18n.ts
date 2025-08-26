import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';

// Get device language
const getDeviceLanguage = (): string => {
  const locales = Localization.getLocales();
  const deviceLanguage = locales && locales.length > 0 && locales[0].languageCode ? locales[0].languageCode : 'en'; // Get language code only (e.g., 'en')
  // Check if device language is supported, otherwise default to English
  return ['en', 'hi', 'bn'].includes(deviceLanguage) ? deviceLanguage : 'en';
};

// Configure i18next
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: en,
      },
      hi: {
        translation: hi,
      },
      bn: {
        translation: bn,
      },
    },
    lng: getDeviceLanguage(), // Auto-detect device language
    fallbackLng: 'en', // Fallback language if translation is missing
    
    // Debug mode (disable in production)
    debug: __DEV__,

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // React specific options
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

export default i18n;