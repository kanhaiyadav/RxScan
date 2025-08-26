import { images } from '@/constants/images';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const slides = [
    {
        title: "Let’s Simplify Your Meds.",
        subtitle: "PrescriptLens helps you scan, store, and manage prescriptions — so you can focus on feeling better.",
        src: images.slide1
    },
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

// SVG Background Component
const BackgroundSVG = () => (
    <Svg
        width={screenWidth}
        height={screenHeight}
        style={{ position: 'absolute', top: 0, left: 0 }}
        viewBox="0 0 540 960"
        preserveAspectRatio="xMidYMid slice"
    >
        {/* Your custom SVG paths */}
        <Path
            d="M0 206L18 192.7C36 179.3 72 152.7 108 156.5C144 160.3 180 194.7 216 210.5C252 226.3 288 223.7 324 208.7C360 193.7 396 166.3 432 162.8C468 159.3 504 179.7 522 189.8L540 200L540 0L522 0C504 0 468 0 432 0C396 0 360 0 324 0C288 0 252 0 216 0C180 0 144 0 108 0C72 0 36 0 18 0L0 0Z"
            fill="#91dfce"
        />
        <Path
            d="M0 132L18 132.7C36 133.3 72 134.7 108 131.2C144 127.7 180 119.3 216 116C252 112.7 288 114.3 324 126.3C360 138.3 396 160.7 432 149.2C468 137.7 504 92.3 522 69.7L540 47L540 0L522 0C504 0 468 0 432 0C396 0 360 0 324 0C288 0 252 0 216 0C180 0 144 0 108 0C72 0 36 0 18 0L0 0Z"
            fill="#65d0b5"
        />
        <Path
            d="M0 30L18 36.3C36 42.7 72 55.3 108 55.2C144 55 180 42 216 48.8C252 55.7 288 82.3 324 94.7C360 107 396 105 432 100.3C468 95.7 504 88.3 522 84.7L540 81L540 0L522 0C504 0 468 0 432 0C396 0 360 0 324 0C288 0 252 0 216 0C180 0 144 0 108 0C72 0 36 0 18 0L0 0Z"
            fill="#07b992"
        />
    </Svg>
);

const WelcomePage = ({ slide }: {
    slide: number
}) => {

    const router = useRouter()

    return (
        <View className='bg-primary-500/5 flex-1 w-screen px-4 relative'>
            {/* SVG Background */}
            <BackgroundSVG />

            {/* Content overlay */}
            <SafeAreaView className='flex-1 flex flex-col justify-between relative z-10'>
                <View className='flex-1 items-center justify-center'>
                    <View className='w-full mt-[100px]'
                        style={{
                            aspectRatio: slide === 1 ? "573/436" : "490/470",
                        }}
                    >
                        <Image
                            source={slides[slide - 1].src}
                            className="w-full h-full mx-auto"
                        />
                    </View>
                </View>
                <View>
                    <View className="flex flex-col items-center mt-10">
                        <Text className="text-4xl text-center text-typography-800 font-bold">{slides[slide - 1].title}</Text>
                        <Text className="text-xl text-typography-600 mt-4 text-center">{slides[slide - 1].subtitle}</Text>

                        <Pressable onPress={() => {
                            if (slide === 3) {
                                router.push('/(auth)/signin' as any)
                                return;
                            }
                            router.push(`/(welcome)/${slide + 1}` as any)
                        }}
                            className='w-full p-4 py-[12px] bg-primary-500 rounded-full mt-6 shadow-[4px_4px_0_10px_rgb(0,0,0)]'
                        >
                            <Text className="text-primary-foreground font-semibold text-center text-lg">
                                {slide === 3 ? 'Get Started' : 'Next'}
                            </Text>
                        </Pressable>
                    </View>
                    <View className='flex flex-row justify-center mt-6'>
                        {
                            Array.from({ length: 3 }, (_, index) => (
                                <View
                                    key={index}
                                    className={`w-3 h-3 mx-1 rounded-full ${slide === index + 1 ? 'bg-primary-500' : 'bg-gray-300'}`}
                                />
                            ))
                        }
                    </View>
                </View>
            </SafeAreaView>
        </View>
    )
}

export default WelcomePage