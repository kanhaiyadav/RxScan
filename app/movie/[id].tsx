import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function Onboarding() {

  const { id } = useLocalSearchParams();
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Welcome to the moview page</Text>
      <Text style={{ marginTop: 20, textAlign: 'center' }}>
        This is the movie page with ID: {id}. Here you can learn more about the movie.
      </Text>
    </View>
  );
}