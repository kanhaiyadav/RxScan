import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from '@/components/ui/button';
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxIcon,
} from "@/components/ui/checkbox"
import { Link, useRouter } from 'expo-router';

const SignUp = () => {
  const router = useRouter();

  return (
    <View className='flex-1'>
      {/* Page Heading */}
      <Text className='text-5xl leading-[50px] font-bold pl-8 translate-y-[-10%] mb-6'>
        Sign Up
      </Text>

      {/* Form Content */}
      <View className='px-8 gap-6'>
        <View className='flex flex-row items-center gap-4 border-b border-primary-500 py-2 px-2'>
          <Fontisto name="email" size={24} color={"gray"} />
          <TextInput className='flex-1 text-lg p-0 m-0' placeholder='Email' />
        </View>
        <View className='flex flex-row items-center gap-4 border-b border-primary-500 py-2 px-2'>
          <Ionicons name="lock-closed-outline" size={24} color="gray" />
          <TextInput className='flex-1 text-lg p-0 m-0' placeholder='Password' />
        </View>
        <View className='flex flex-row items-center gap-4 border-b border-primary-500 py-2 px-2'>
          <Ionicons name="lock-closed-outline" size={24} color="gray" />
          <TextInput className='flex-1 text-lg p-0 m-0' placeholder='Confirm Password' />
        </View>
        <Button size='xl' className='h-[50px]'>
          <Text className='text-lg text-primary-foreground'>Sign Up</Text>
        </Button>
        <View className='flex flex-row items-center gap-1 w-fit m-auto mt-[-10px]'>
          <Text>Already have an account?</Text>
          <Text
            className='font-bold text-primary-500'
            onPress={() => router.navigate('/(auth)/signin')}
          >
            Sign In
          </Text>
        </View>
      </View>
    </View>
  )
}

export default SignUp