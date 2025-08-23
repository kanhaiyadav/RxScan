import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

const WelcomPage = ({ src, title, subtitle, slide }: {
  src: any;
  title: string
  subtitle: string
  slide: string | number
}) => {

  const router = useRouter()

  return (
    <View>
      <View className='w-full'>
        <Image
          source={src}
          className="h-[350px] aspect-[543/460] mx-auto"
        />
      </View>
      <Text className="text-5xl text-red-500">{title}</Text>
      <Text className="text-xl text-gray-700 mt-4">{subtitle}</Text>

      <Text className="text-xl text-gray-700 mt-4">this is slide: {slide}</Text>
      <Pressable onPress={() => router.push(`/(welcome)/${Number(slide) + 1}` as any)}>
        <Text className="px-4 py-2 bg-orange-300 text-black font-semibold rounded-[6px] my-4 text-center">
          Next Slide
        </Text>
      </Pressable>
    </View>
  )
}

export default WelcomPage