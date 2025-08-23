import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {

  return (
    <SafeAreaView
      edges={['bottom']}
      style={{ flex: 1 }}
      className='pt-[30px]'
    >
      <Tabs
        initialRouteName='index'
        screenOptions={{
          animation: 'none',
          tabBarActiveTintColor: '#14B8A6',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            height: Platform.OS === 'android' ? 80 : 70,
            paddingBottom: Platform.OS === 'android' ? 20 : 10,
            paddingTop: 10,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 5,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <View className={`rounded-full ${focused ? 'bg-teal-50' : ''}`}>
                <Ionicons
                  name={focused ? 'home' : 'home-outline'}
                  size={24}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="prescription"
          options={{
            title: 'Prescriptions',
            tabBarIcon: ({ color, focused }) => (
              <View className={`rounded-full ${focused ? 'bg-teal-50' : ''}`}>
                <Ionicons
                  name={focused ? 'document-text' : 'document-text-outline'}
                  size={24}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color, focused }) => (
              <View className={`w-[60px] h-[60px] mb-[-10px] flex items-center justify-center rounded-full ${focused ? 'bg-teal-500' : 'bg-teal-500'} shadow-lg`}>
                <Ionicons
                  name="camera"
                  size={30}
                  color="white"
                />
              </View>
            ),
            tabBarLabel: () => null, // Hide label for center button
          }}
        />
        <Tabs.Screen
          name="reminder"
          options={{
            title: 'Reminders',
            tabBarIcon: ({ color, focused }) => (
              <View className={`rounded-full ${focused ? 'bg-teal-50' : ''}`}>
                <Ionicons
                  name={focused ? 'alarm' : 'alarm-outline'}
                  size={24}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <View className={`rounded-full ${focused ? 'bg-teal-50' : ''}`}>
                <Ionicons
                  name={focused ? 'person' : 'person-outline'}
                  size={24}
                  color={color}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}