import { View, Text } from "react-native";

export default function Onboarding() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Welcome to the App!</Text>
      <Text style={{ marginTop: 20, textAlign: 'center' }}>
        This is the onboarding screen. Here you can learn how to use the app.
      </Text>
    </View>
  );
}