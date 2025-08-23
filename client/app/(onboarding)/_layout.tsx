import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHealthProfile } from '@/context/HealthProfileContext';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingLayout() {
  
  const router = useRouter();
  const { healthProfile } = useHealthProfile();
  
  return (
    <SafeAreaView
      edges={['bottom']} // Only apply safe area to the bottom
      style={{ flex: 1, backgroundColor: '#FFFFFF' }} // Set background if needed
    >
      <View className="bg-emerald-400 h-32 rounded-b-[50px] relative">
        <View className="flex-row items-center justify-between px-6 pt-12">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">Health Profile</Text>
          <View />
        </View>
      </View>

      {/* Progress indicator */}
      <View className="px-6 -mt-6 mb-6">
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-600 text-sm">Step 1 of 4</Text>
            <Text className="text-emerald-500 text-sm font-medium">{healthProfile.step * 25}%</Text>
          </View>
          <View className="bg-gray-200 rounded-full h-2">
            <View className="bg-emerald-400 rounded-full h-2"
              style={{ width: `${healthProfile.step * 25}%` }}
            />
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