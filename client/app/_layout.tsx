import { Stack } from "expo-router";
import './globals.css';
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(welcome)"
        options={{
          headerShown: false,
          animation: "ios_from_right",
        }}
      />
    </Stack>
  );
}
