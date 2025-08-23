import "@/app/globals.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { AuthProvider } from "@/context/AuthContext";
import { UserHealthProvider } from "@/context/UserHealthContext";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UserHealthProvider>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="transparent"
            hidden={true}
          // translucent={true}
          />
          <GluestackUIProvider mode="light">
            <Stack initialRouteName="index">
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                  // Hide this screen from stack navigation
                  presentation: 'transparentModal'
                }}
              />
              <Stack.Screen
                name="(welcome)"
                options={{
                  headerShown: false,
                  animation: "ios_from_right",
                }}
              />
              <Stack.Screen
                name="(auth)"
                options={{
                  headerShown: false,
                  animation: "ios_from_right",
                }}
              />
              <Stack.Screen
                name="(dashboard)"
                options={{
                  headerShown: false,
                  animation: "fade",
                }}
              />
              <Stack.Screen
                name="(onboarding)"
                options={{
                  headerShown: false,
                  animation: "ios_from_right",
                }}
              />
            </Stack>
          </GluestackUIProvider>
        </UserHealthProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}