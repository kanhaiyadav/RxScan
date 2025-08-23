import { Stack } from "expo-router";
import "@/app\\globals.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import './globals.css';
export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light"><Stack>
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
      </Stack></GluestackUIProvider>
  );
}
