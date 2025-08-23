import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as NavigationBar from 'expo-navigation-bar';

export default function HomeScreen() {
  const quickActions = [
    {
      id: 1,
      title: 'Scan Prescription',
      subtitle: 'Upload & analyze prescription',
      icon: 'camera',
      color: 'bg-teal-500',
      route: '/scan'
    },
    {
      id: 2,
      title: 'View Prescriptions',
      subtitle: 'See your prescription history',
      icon: 'document-text',
      color: 'bg-blue-500',
      route: '/prescriptions'
    },
    {
      id: 3,
      title: 'Medicine Reminders',
      subtitle: 'Set medication alerts',
      icon: 'alarm',
      color: 'bg-purple-500',
      route: '/reminders'
    },
    {
      id: 4,
      title: 'Health Profile',
      subtitle: 'Update your health info',
      icon: 'person',
      color: 'bg-green-500',
      route: '/profile'
    }
  ];

  const recentAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Drug Interaction Alert',
      message: 'Avoid alcohol with your current medication',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'info',
      title: 'Prescription Scanned',
      message: 'Successfully analyzed your prescription',
      time: '1 day ago'
    }
  ];

  useEffect(() => {
      NavigationBar.setVisibilityAsync("hidden"); // or 'light'
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#00ffc8" />

      {/* Header */}
      <LinearGradient
        colors={['#00ffc8', '#80f7ed']} // teal-500 to teal-600
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ elevation: 3 }}
        className='border-b border-gray-200'
      >
        <View className="bg-transparent px-6 py-4 ">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-gray-900">Welcome back!</Text>
              <Text className="text-gray-600 mt-1">Let&apos;s keep you healthy today</Text>
            </View>
            <TouchableOpacity className="bg-white p-3 rounded-full elevation-sm">
              <Ionicons name="notifications" size={24} color="#14B8A6" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Health Stats Card */}
        <View className='p-6'>
          <Text className="text-black text-lg font-semibold mb-4">Your Health Summary</Text>
          <View className="flex-row justify-between">
            <View className="bg-white p-4 flex-1 mr-2"
            style={{borderRadius: 8, elevation: 2}}
            >
              <Text className="text-black/80 text-sm">Prescriptions</Text>
              <Text className="text-black text-2xl font-bold">12</Text>
            </View>
            <View className="bg-white p-4 flex-1 ml-2"
            style={{borderRadius: 8, elevation: 2}}
            >
              <Text className="text-black/80 text-sm">Active Meds</Text>
              <Text className="text-black text-2xl font-bold">5</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-6 mt-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                className="bg-white rounded-2xl p-4 w-[48%] mb-4 border border-gray-100 elevation-sm"
                onPress={() => router.push('/(onboarding)' as any)}
              >
                <View className={`${action.color} w-12 h-12 rounded-xl items-center justify-center mb-3`}>
                  <Ionicons name={action.icon as any} size={24} color="white" />
                </View>
                <Text className="text-gray-900 font-semibold text-base">{action.title}</Text>
                <Text className="text-gray-500 text-sm mt-1">{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Alerts */}
        <View className="mx-6 mt-8 mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Recent Alerts</Text>
          {recentAlerts.map((alert) => (
            <View key={alert.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
              <View className="flex-row items-start">
                <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${alert.type === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
                  }`}>
                  <Ionicons
                    name={alert.type === 'warning' ? 'warning' : 'information-circle'}
                    size={16}
                    color={alert.type === 'warning' ? '#F97316' : '#3B82F6'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold">{alert.title}</Text>
                  <Text className="text-gray-600 text-sm mt-1">{alert.message}</Text>
                  <Text className="text-gray-400 text-xs mt-2">{alert.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}