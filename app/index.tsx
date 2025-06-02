import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <Text className="text-5xl text-red-500">Welcome</Text>
      <Link href={'/onboarding'} className="mt-4 text-blue-500">
        Go to Onboarding
      </Link>
      <Link href={'/movie/[id]'} className="mt-4 text-blue-500">
        Go to Movie
      </Link>
    </View>
  );
}
