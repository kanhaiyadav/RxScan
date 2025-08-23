// app/(auth)/signup.tsx
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, View } from 'react-native';

const SignUp = () => {
  const router = useRouter();
  const { signUp, isLoading, error } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    const success = await signUp(email.trim(), password);
    
    if (success) {
      // Navigation will be handled by the auth state change in index.tsx
      router.replace('/(onboarding)');
    } else {
      Alert.alert('Sign Up Failed', error || 'Failed to create account');
    }
  };

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
          <TextInput 
            className='flex-1 text-lg p-0 m-0' 
            placeholder='Email'
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View className='flex flex-row items-center gap-4 border-b border-primary-500 py-2 px-2'>
          <Ionicons name="lock-closed-outline" size={24} color="gray" />
          <TextInput 
            className='flex-1 text-lg p-0 m-0' 
            placeholder='Password'
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <View className='flex flex-row items-center gap-4 border-b border-primary-500 py-2 px-2'>
          <Ionicons name="lock-closed-outline" size={24} color="gray" />
          <TextInput 
            className='flex-1 text-lg p-0 m-0' 
            placeholder='Confirm Password'
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        <Button 
          size='xl' 
          className='h-[50px]'
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className='text-lg text-primary-foreground'>Sign Up</Text>
          )}
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