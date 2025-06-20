import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogBackdrop,
} from "@/components/ui/alert-dialog"
import { Button, ButtonText } from "@/components/ui/button"
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = React.useState(false)
  const handleClose = () => setShowAlertDialog(false)


  const router = useRouter();

  const profileSections = [
    {
      title: 'Health Information',
      items: [
        {
          icon: 'medical',
          title: 'Medical Conditions',
          subtitle: '3 conditions added',
          color: 'bg-red-500',
          route: '/profile/conditions'
        },
        {
          icon: 'warning',
          title: 'Allergies',
          subtitle: '2 allergies listed',
          color: 'bg-orange-500',
          route: '/profile/allergies'
        },
        {
          icon: 'medkit',
          title: 'Current Medications',
          subtitle: '5 active medicines',
          color: 'bg-blue-500',
          route: '/profile/medications'
        },
        {
          icon: 'restaurant',
          title: 'Dietary Restrictions',
          subtitle: 'Vegetarian, No alcohol',
          color: 'bg-green-500',
          route: '/profile/diet'
        }
      ]
    },
    {
      title: 'App Settings',
      items: [
        {
          icon: 'notifications',
          title: 'Notifications',
          subtitle: 'Manage your alerts',
          color: 'bg-purple-500',
          hasToggle: true,
          toggleValue: notificationsEnabled,
          onToggle: setNotificationsEnabled
        },
        {
          icon: 'moon',
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme',
          color: 'bg-gray-700',
          hasToggle: true,
          toggleValue: darkModeEnabled,
          onToggle: setDarkModeEnabled
        },
        {
          icon: 'language',
          title: 'Language',
          subtitle: 'English',
          color: 'bg-indigo-500',
          route: '/profile/language'
        },
        {
          icon: 'shield-checkmark',
          title: 'Privacy & Security',
          subtitle: 'Manage your data',
          color: 'bg-teal-500',
          route: '/profile/privacy'
        }
      ]
    },
    {
      title: 'Support & About',
      items: [
        {
          icon: 'help-circle',
          title: 'Help & Support',
          subtitle: 'Get help with the app',
          color: 'bg-cyan-500',
          route: '/profile/help'
        },
        {
          icon: 'document-text',
          title: 'Terms of Service',
          subtitle: 'Read our terms',
          color: 'bg-amber-500',
          route: '/profile/terms'
        },
        {
          icon: 'shield',
          title: 'Privacy Policy',
          subtitle: 'How we protect your data',
          color: 'bg-emerald-500',
          route: '/profile/privacy-policy'
        },
        {
          icon: 'information-circle',
          title: 'About RxScan',
          subtitle: 'Version 1.0.0',
          color: 'bg-pink-500',
          route: '/profile/about'
        }
      ]
    }
  ];

  const handleLogout = () => {
    setShowAlertDialog(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View>
          <LinearGradient
            colors={['#7de7db', '#19dca5']} // teal-500 to teal-600
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="mx-6 mt-6 p-6"
            style={{ borderRadius: 16, elevation: 3 }}
          >
            <View className="flex-row items-center">
              <View className="bg-black/20 w-16 h-16 rounded-full items-center justify-center mr-4">
                <Ionicons name="person" size={32} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-black text-xl font-bold">John Doe</Text>
                <Text className="text-black/80 text-sm mt-1">kanahiya@gmail.com</Text>
                <Text className="text-black/80 text-sm">Member since Jan 2024</Text>
              </View>
              <TouchableOpacity className="bg-white/20 p-2 rounded-full">
                <Ionicons name="create" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Health Summary */}
        <View className="mx-6 mt-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Health Summary</Text>
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <View className="bg-teal-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                <Ionicons name="document-text" size={24} color="#14B8A6" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">12</Text>
              <Text className="text-gray-500 text-sm">Prescriptions</Text>
            </View>
            <View className="items-center flex-1">
              <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                <Ionicons name="medical" size={24} color="#3B82F6" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">5</Text>
              <Text className="text-gray-500 text-sm">Active Meds</Text>
            </View>
            <View className="items-center flex-1">
              <View className="bg-orange-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                <Ionicons name="warning" size={24} color="#F97316" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">3</Text>
              <Text className="text-gray-500 text-sm">Warnings</Text>
            </View>
          </View>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mx-6 mt-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">{section.title}</Text>
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  className={`p-5 flex-row items-center ${itemIndex < section.items.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  onPress={() => {
                    if (item.route) {
                      // Navigate to route
                      console.log('Navigate to:', item.route);
                    }
                  }}
                >
                  <View className={`${item.color} w-10 h-10 rounded-full items-center justify-center mr-4`}>
                    <Ionicons name={item.icon as any} size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium">{item.title}</Text>
                    <Text className="text-gray-500 text-sm mt-1">{item.subtitle}</Text>
                  </View>
                  {item.hasToggle ? (
                    <Switch
                      value={item.toggleValue}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#E5E7EB', true: '#14B8A6' }}
                      thumbColor="#FFFFFF"
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View className="mx-6 mt-8 mb-8">
          <TouchableOpacity
            className="bg-red-50 border border-red-200 rounded-2xl p-3 flex-row items-center justify-center"
            onPress={() => setShowAlertDialog(true)}
          >
            <Ionicons name="log-out" size={24} color="#EF4444" />
            <Text className="text-red-600 font-semibold ml-2 text-lg">Logout</Text>
          </TouchableOpacity>
          <AlertDialog isOpen={showAlertDialog} onClose={handleClose} size="md">
            <AlertDialogBackdrop />
            <AlertDialogContent className='bg-red-100 border-0'>
              <AlertDialogHeader>
                <Text className='text-xl font-bold'>
                  Log Out
                </Text>
              </AlertDialogHeader>
              <AlertDialogBody className="mt-3 mb-4">
                <Text className='text-gray-500'>
                  This actions will log you out of your account. Are you sure you want to proceed?
                </Text>
              </AlertDialogBody>
              <AlertDialogFooter className="">
                <Button
                  action="secondary"
                  onPress={handleClose}
                  size="sm"
                  className='bg-white elevation-sm'
                >
                  <ButtonText>Cancel</ButtonText>
                </Button>
                <Button size="sm" className='bg-red-600' onPress={handleLogout}>
                  <ButtonText>Log out</ButtonText>
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}