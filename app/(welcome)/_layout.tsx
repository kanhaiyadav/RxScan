import { Stack } from "expo-router";

export default function WelcomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          animation: "ios_from_right",
        }}
      />
      <Stack.Screen
        name="[slide]"
        options={{
          headerShown: false,
          animation: "ios_from_right",
        }}
      />
    </Stack>
  )
}