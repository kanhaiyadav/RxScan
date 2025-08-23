import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function WelcomeScreen() {

  const { slide } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View>
      <Text className="text-5xl text-red-500">Welcome to the App</Text>
      <Text className="text-xl text-gray-700 mt-4">this is slide: {slide}</Text>
      <Pressable onPress={() => router.push(`/(welcome)/${Number(slide) + 1}` as any)}>
        <Text className="px-4 py-2 bg-orange-300 text-black font-semibold rounded-[6px] my-4 text-center">
          Next Slide
        </Text>
      </Pressable>
    </View>
  )
}