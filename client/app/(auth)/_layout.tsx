import { Stack } from "expo-router";
import * as NavigationBar from 'expo-navigation-bar';
import React from 'react';
import { images } from '@/constants/images';
import { Image, View } from 'react-native';

export default function AuthLayout() {
  NavigationBar.setButtonStyleAsync("dark");

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
        <View className='w-full aspect-[1440/389] absolute top-0 left-0 translate-y-[-98%] z-0'>
          <Image
            source={images.wave}
            className='w-full h-full'
          />
        </View>
        
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent'}, // Important!
          }}
        >
          <Stack.Screen
            name="signin"
            options={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="signup"
            options={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          />
        </Stack>
      </View>
    </View>
  );
}