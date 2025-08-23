import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log("Auth state check:", { user, isLoading });
    if (!isLoading) {
      if (user) {
        router.replace("/(dashboard)");
      } else {
        router.replace("/(auth)/signin");
      }
    }
  }, [user, isLoading, router]);

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}