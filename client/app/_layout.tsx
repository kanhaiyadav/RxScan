// app/_layout.tsx
import "@/app/globals.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { AuthProvider } from "@/context/AuthContext";
import { HealthProfileProvider } from "@/context/HealthProfileContext";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
      <HealthProfileProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
        // translucent={true}
        />
        <GluestackUIProvider mode="light">
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
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
                animation: "ios_from_right",
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
      </HealthProfileProvider>
    </AuthProvider>
  );
}