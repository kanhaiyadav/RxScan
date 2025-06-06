import { Link, useRouter } from "expo-router";
import { Text, Pressable, View} from "react-native";

export default function Index() {

  const router = useRouter();
  const handlePress = () => {
    router.push('/onboarding');
  }
  
  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <Text className="text-5xl text-red-500">Welcome</Text>

      
      <Pressable className="px-4 py-2 bg-orange-300 text-black font-semibold rounded-[6px] my-4" onPress={handlePress}>
        <Text className="text-xl">Profile</Text>
      </Pressable>
    </View>
  );
}
