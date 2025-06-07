import WelcomePage from "@/components/WelcomPage";
import { useLocalSearchParams } from "expo-router";

export default function WelcomeScreen() {

  const { slide } = useLocalSearchParams();

  return (
    <WelcomePage slide={Number(slide)}/>
  )
}