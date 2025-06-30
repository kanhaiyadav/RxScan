import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserHealth } from '@/context/UserHealthContext';
import { useEffect, useState } from 'react';
import { images } from '@/constants/images';
import { icons } from '@/constants/icons';

export default function OnboardingLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { state } = useUserHealth();
  const [currentStep, setCurrentStep] = useState(1);

  // Determine current step based on the current route
  useEffect(() => {
    const currentRoute = segments[segments.length - 1];
    let step = 1;
    
    switch (currentRoute) {
      case '(onboarding)':
        step = 1;
        break;
      case 'step2':
        step = 2;
        break;
      case 'step3':
        step = 3;
        break;
      case 'step4':
        step = 4;
        break;
      default:
        step = 1;
    }
    
    setCurrentStep(step);
  }, [segments]);

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return 'Personal Information';
      case 2:
        return 'Medical Conditions';
      case 3:
        return 'Current Medications';
      case 4:
        return 'Dietary Restrictions';
      default:
        return 'Health Profile';
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView
      edges={['bottom']} // Only apply safe area to the bottom
      style={{ flex: 1, backgroundColor: '#F9FAFB' }} // Changed to light gray background
    >
      {/* Enhanced Header with Gradient-like Effect */}
      <View className="relative">
        {/* Main Header */}
        <View className="bg-[#12c388] h-36 rounded-b-[32px] relative overflow-hidden">
          {/* Background Pattern/Overlay */}
          <View className="absolute inset-0 bg-emerald-400 opacity-20" />
          
          {/* Header Content */}
          <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
            <TouchableOpacity 
              onPress={handleBack}
              className="bg-white/20 rounded-full p-2"
              activeOpacity={0.7}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View className="flex-1 items-center">
                <Text className="text-white text-xl font-bold">RxScan</Text>
              <Text className="text-white/90 text-sm font-medium mt-1">Health Profile Setup</Text>
            </View>
            
            <View className="w-10" />
          </View>
        </View>

        {/* Floating Progress Card */}
        <View className="px-6 -mt-8 mb-4">
          <View 
            className="bg-white rounded-3xl p-6 border border-gray-100"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Step Info Header */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="bg-emerald-100 rounded-full h-8 w-8 mr-3 flex items-center justify-center">
                  <Text className="text-emerald-700 font-bold text-sm">{currentStep}</Text>
                </View>
                <View>
                  <Text className="text-gray-900 font-bold text-base">{getStepTitle(currentStep)}</Text>
                  <Text className="text-gray-500 text-sm">Step {currentStep} of 4</Text>
                </View>
              </View>
              
              <View className="items-end">
                <Text className="text-emerald-600 text-lg font-bold">{currentStep * 25}%</Text>
                <Text className="text-gray-400 text-xs">Complete</Text>
              </View>
            </View>

            {/* Enhanced Progress Bar */}
            <View className="relative">
              <View className="bg-gray-100 rounded-full h-3 overflow-hidden">
                <View 
                  className="bg-emerald-500 rounded-full h-3"
                  style={{ 
                    width: `${currentStep * 25}%`,
                  }}
                />
              </View>
              
              {/* Progress Steps Indicators */}
              <View className="flex-row justify-between absolute -top-1 -bottom-1 left-0 right-0">
                {[1, 2, 3, 4].map((step) => (
                  <View
                    key={step}
                    className={`w-5 h-5 rounded-full border-2 ${
                      currentStep >= step
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'bg-white border-gray-300'
                    }`}
                    style={{
                      shadowColor: currentStep >= step ? '#10B981' : '#6B7280',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: currentStep >= step ? 0.3 : 0.1,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    {currentStep >= step && (
                      <View className="flex-1 items-center justify-center">
                        <Ionicons name="checkmark" size={12} color="white" />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Step Labels */}
            <View className="flex-row justify-between mt-6">
              {['Personal', 'Medical', 'Medications', 'Dietary'].map((label, index) => (
                <Text
                  key={index}
                  className={`text-xs font-medium ${
                    currentStep > index + 1
                      ? 'text-emerald-600'
                      : currentStep === index + 1
                      ? 'text-emerald-700'
                      : 'text-gray-400'
                  }`}
                >
                  {label}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="step2" />
        <Stack.Screen name="step3" />
        <Stack.Screen name="step4" />
      </Stack>
    </SafeAreaView>
  );
}