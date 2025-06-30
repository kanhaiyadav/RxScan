import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const asyncStorage = AsyncStorage;
  
  useEffect(() => {
    const checkWelcomeStatus = async () => {
      const hasSeenWelcome = await asyncStorage.getItem("hasSeenWelcome");
      console.log("################", hasSeenWelcome);
      if (hasSeenWelcome !== "true") {
        // If the user has not seen the welcome screen, redirect to it
        router.replace("/(welcome)");
        return;
      }
      console.log("Auth state check:", { user, isLoading });
      if (!isLoading) {
        if (user) {
          router.replace("/(dashboard)");
        } else {
          router.replace("/(auth)/signin");
        }
      }
    };
    
    checkWelcomeStatus();
  }, [user, isLoading, router, asyncStorage]);

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}