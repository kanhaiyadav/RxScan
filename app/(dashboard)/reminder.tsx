import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RemindersScreen() {
  const [activeTab, setActiveTab] = useState('Today');

  const tabs = ['Today', 'Upcoming', 'All'];

  const reminders = [
    {
      id: 1,
      medicine: 'Amoxicillin 500mg',
      time: '08:00 AM',
      status: 'taken',
      frequency: 'Before breakfast',
      color: 'bg-green-500',
      doctor: 'Dr. Sarah Johnson'
    },
    {
      id: 2,
      medicine: 'Paracetamol 650mg',
      time: '02:00 PM',
      status: 'pending',
      frequency: 'After lunch',
      color: 'bg-blue-500',
      doctor: 'Dr. Sarah Johnson'
    },
    {
      id: 3,
      medicine: 'Metformin 500mg',
      time: '08:00 PM',
      status: 'pending',
      frequency: 'After dinner',
      color: 'bg-purple-500',
      doctor: 'Dr. Michael Chen'
    },
    {
      id: 4,
      medicine: 'Atorvastatin 20mg',
      time: '10:00 PM',
      status: 'missed',
      frequency: 'Before sleep',
      color: 'bg-red-500',
      doctor: 'Dr. Priya Sharma'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken':
        return { icon: 'checkmark-circle', color: '#10B981' };
      case 'pending':
        return { icon: 'time', color: '#F59E0B' };
      case 'missed':
        return { icon: 'close-circle', color: '#EF4444' };
      default:
        return { icon: 'time', color: '#6B7280' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'taken':
        return 'Taken';
      case 'pending':
        return 'Pending';
      case 'missed':
        return 'Missed';
      default:
        return 'Unknown';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">Medicine Reminders</Text>
          <TouchableOpacity className="bg-primary-100 p-3 rounded-full elevation-sm">
            <Ionicons name="add" size={24} color="#14B8A6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="flex-row mx-6 mt-6 gap-4">
        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <View className="flex-row items-center">
            <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={20} color="#10B981" />
            </View>
            <View className="ml-3">
              <Text className="text-2xl font-bold text-gray-900">3</Text>
              <Text className="text-gray-500 text-sm">Taken Today</Text>
            </View>
          </View>
        </View>

        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center">
            <View className="bg-orange-100 w-10 h-10 rounded-full items-center justify-center">
              <Ionicons name="time" size={20} color="#F59E0B" />
            </View>
            <View className="ml-3">
              <Text className="text-2xl font-bold text-gray-900">2</Text>
              <Text className="text-gray-500 text-sm">Pending</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white mx-6 mt-6 rounded-2xl p-1 shadow-sm border border-gray-100">
        <View className="flex-row">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-3 px-4 rounded-xl ${activeTab === tab ? 'bg-teal-500' : 'bg-transparent'
                }`}
              onPress={() => setActiveTab(tab)}
            >
              <Text className={`text-center font-medium ${activeTab === tab ? 'text-white' : 'text-gray-600'
                }`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 mt-6" showsVerticalScrollIndicator={false}>
        <View className="mx-6">
          {reminders.map((reminder) => {
            const statusInfo = getStatusIcon(reminder.status);
            return (
              <View
                key={reminder.id}
                className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-200"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className={`${reminder.color} w-4 h-12 rounded-full mr-4`} />
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-900">
                        {reminder.medicine}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {reminder.frequency} • {reminder.doctor}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-xl font-bold text-gray-900">
                      {reminder.time}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons
                        name={statusInfo.icon as any}
                        size={16}
                        color={statusInfo.color}
                      />
                      <Text className="text-sm ml-1" style={{ color: statusInfo.color }}>
                        {getStatusText(reminder.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                {reminder.status === 'pending' && (
                  <View className="flex-row gap-3 mt-4">
                    <TouchableOpacity className="flex-1 bg-gray-100 py-3 px-4 rounded-xl flex-row items-center justify-center elevation-sm">
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Skip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-teal-500 py-3 px-4 rounded-xl flex-row items-center justify-center elevation-sm">
                      <Ionicons name="checkmark" size={16} color="white" />
                      <Text className="text-white font-medium ml-2">Mark as Taken</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {reminder.status === 'missed' && (
                  <View className="flex-row gap-3 mt-4">
                    <TouchableOpacity className="flex-1 bg-red-50 py-3 px-4 rounded-xl flex-row items-center justify-center">
                      <Ionicons name="refresh" size={16} color="#EF4444" />
                      <Text className="text-red-600 font-medium ml-2">Reschedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-teal-500 py-3 px-4 rounded-xl flex-row items-center justify-center">
                      <Ionicons name="checkmark" size={16} color="white" />
                      <Text className="text-white font-medium ml-2">Take Now</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Settings Section */}
        <View className="mx-6 mt-6 mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Reminder Settings</Text>

          <View className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <View className="p-5 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">Push Notifications</Text>
                  <Text className="text-gray-500 text-sm mt-1">Get notified when it&apos;s time to take medicine</Text>
                </View>
                <Switch
                  value={true}
                  onValueChange={() => { }}
                  trackColor={{ false: '#E5E7EB', true: '#14B8A6' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View className="p-5 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">Sound Alerts</Text>
                  <Text className="text-gray-500 text-sm mt-1">Play sound with notifications</Text>
                </View>
                <Switch
                  value={false}
                  onValueChange={() => { }}
                  trackColor={{ false: '#E5E7EB', true: '#14B8A6' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <TouchableOpacity className="p-5 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-gray-900 font-medium">Snooze Duration</Text>
                <Text className="text-gray-500 text-sm mt-1">5 minutes</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}