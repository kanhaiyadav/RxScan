import React from 'react'
import { View, Image, Text } from 'react-native'
import slide1 from "@/assets/images/slide1.png";

const index = () => {

  return (
    <View className='flex-1 flex'>
      <View className='flex-1 items-center justify-center'>
        <View className='w-full mt-[100px]'
          style={{
            aspectRatio: "573/436",
          }}
        >
          <Image
            source={slide1}
            alt='no image'
            className="w-full h-full mx-auto"
          />
        </View>
      </View>
      <View>
        <View className="flex flex-col items-center mt-10">
          <Text className="text-4xl text-center text-gray-800 font-bold">Let&apos;s Simplify Your Meds.</Text>
          <Text className="text-xl text-gray-600 mt-4 text-center">PrescriptLens helps you scan, store, and manage prescriptions — so you can focus on feeling better.</Text>
        </View>
      </View>
    </View>
  )
}

export default index