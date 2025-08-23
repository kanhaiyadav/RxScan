import { Stack } from "expo-router";
import * as NavigationBar from 'expo-navigation-bar';


export default function AuthLayout() {

  NavigationBar.setButtonStyleAsync("dark");

  return (
    <Stack>
      <Stack.Screen
        name="signin"
        options={{
          headerShown: false,
          animation: "ios_from_right",
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          headerShown: false,
          animation: "ios_from_right",
        }}
      />
    </Stack>
  )
}