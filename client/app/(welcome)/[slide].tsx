import { useLocalSearchParams } from "expo-router";
import { View, Image, Text } from "react-native";
import { images } from "@/constants/images";

const slides = [
  {
    title: "Snap Your Prescription",
    subtitle: "Simply take a photo of your doctor's prescription and our smart scanner will read and organize all your medication details automatically.",
    src: images.slide2
  },
  {
    title: "Never Miss a Dose",
    subtitle: "Set personalized medication reminders that fit your schedule. Get notified when it's time to take your medicine and track your adherence effortlessly.",
    src: images.slide3
  }
]

export default function WelcomeScreen() {

  const { slide } = useLocalSearchParams();

  return (
    <View className='flex-1 flex'>
      <View className='flex-1 items-center justify-center'>
        <View className='w-full mt-[100px]'
          style={{
            aspectRatio: "490/470",
          }}
        >
          <Image
            source={slides[Number(slide) - 2].src}
            alt='no image'
            className="w-full h-full mx-auto"
          />
        </View>
      </View>
      <View>
        <View className="flex flex-col items-center mt-10">
          <Text className="text-4xl text-center text-gray-800 font-bold">{slides[Number(slide)-2].title}</Text>
          <Text className="text-xl text-gray-600 mt-4 text-center">{slides[Number(slide) - 2].subtitle}</Text>
        </View>
      </View>
    </View>
  )
}
