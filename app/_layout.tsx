import { Stack } from "expo-router";
import "@/app\\globals.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { StatusBar } from "react-native";
import { UserHealthProvider } from "@/context/UserHealthContext";


export default function RootLayout() {
  return (
      <UserHealthProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
        // translucent={true}
        />
        <GluestackUIProvider mode="light">
          <Stack>
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
      </UserHealthProvider>
  );
}
