// app/index.tsx
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // User is authenticated, redirect to onboarding
        router.replace("/(onboarding)");
      } else {
        // User is not authenticated, redirect to welcome/auth
        router.replace("/(welcome)");
      }
    }
  }, [user, isLoading, router]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="text-xl mt-4">Loading...</Text>
      </View>
    );
  }

  // This should not be reached due to the useEffect redirects
  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <Text className="text-5xl text-red-500">Welcome</Text>
    </View>
  );
}