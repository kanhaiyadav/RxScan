import React from 'react';
import { images } from '@/constants/images';
import { Link, useRouter } from 'expo-router';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from '@/components/ui/button';
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxIcon,
} from "@/components/ui/checkbox"

const SignIn = () => {

  const router = useRouter()

  return (
    <View className='bg-primary-500/5 flex-1 w-screen relative'>
      <View className='w-full aspect-[298/217]'>
        <Image
          source={images.authBg}
          className='w-full h-full'
          style={{ resizeMode: 'cover' }}
        />
      </View>
      <View className='flex-1 relative'>
        <View className='w-full aspect-[1440/500] absolute top-0 left-0 translate-y-[-98%]'>
          <Image
            source={images.wave}
            className='w-full h-full'
          />
        </View>
        <Text className='text-5xl leading-[50px] font-bold pl-8 translate-y-[-100%]'>Sign in</Text>
        <View className='px-8 gap-6'>
          <View className='flex flex-row items-center gap-4 border-b border-primary-500 py-2 px-2'>
            <Fontisto name="email" size={24} color={"gray"} />
            <TextInput className='flex-1 text-lg p-0 m-0' placeholder='Email' />
          </View>
          <View className='flex flex-row items-center gap-4 border-b border-primary-500 py-2 px-2'>
            <Ionicons name="lock-closed-outline" size={24} color="gray" />
            <TextInput className='flex-1 text-lg p-0 m-0' placeholder='Password' />
          </View>
          <View className='flex flex-row items-center justify-between mt-[-5px]'>
            <Checkbox value='something' size="sm" isInvalid={false} isDisabled={false} className='ml-2'>
              <CheckboxIndicator>
                <CheckboxIcon />
              </CheckboxIndicator>
              <CheckboxLabel>Remember me</CheckboxLabel>
            </Checkbox>
            <Link href={'/(auth)/forgot-password'} asChild className='ml-auto'>
              <Pressable className='mt-2'>
                <Text className='text-primary-500 text-sm'>Forgot Password?</Text>
              </Pressable>
            </Link>
          </View>
          <Button size='xl' className='h-[50px]'>
            <Text className='text-lg text-primary-foreground'>Sign In</Text>
          </Button>
        </View>
      </View>
    </View>
  )
}

export default SignIn