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
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = React.useState(false)
  const handleClose = () => setShowAlertDialog(false)

  const router = useRouter();
  const { signOut, user } = useAuth();

  // Function to get user initials
  const getUserInitials = (name: string | undefined): string => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const getProfileColor = (userId: string | undefined): string => {
    if (!userId) return '#6B7280';

    const colors: string[] = [
      '#EF4444', // red-500
      '#F97316', // orange-500
      '#F59E0B', // amber-500
      '#EAB308', // yellow-500
      '#84CC16', // lime-500
      '#22C55E', // green-500
      '#10B981', // emerald-500
      '#14B8A6', // teal-500
      '#06B6D4', // cyan-500
      '#0EA5E9', // sky-500
      '#3B82F6', // blue-500
      '#6366F1', // indigo-500
      '#8B5CF6', // violet-500
      '#A855F7', // purple-500
      '#D946EF', // fuchsia-500
      '#EC4899', // pink-500
    ];

    // Use the user ID to generate a consistent index
    let hash: number = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Function to format date
  const formatMemberSince = (dateString: string | undefined): string => {
    if (!dateString) return 'Member';

    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `Member since ${month} ${year}`;
  };

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
    signOut();
    setShowAlertDialog(false);
    router.replace('/(auth)/signin')
  };

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
        <View className="px-6 py-4 pt-8">
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View className='m-6 p-6 bg-white'
          style={{
            borderRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 2
          }}
        >
          <View className="flex-row items-center">
            {/* Profile Picture with Initials */}
            <View
              className="w-20 h-20 rounded-full items-center justify-center mr-5"
              style={{
                backgroundColor: getProfileColor(user?.$id),
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3
              }}
            >
              <Text className="text-white text-3xl font-bold">
                {getUserInitials(user?.name)}
              </Text>
            </View>

            {/* User Details */}
            <View className="flex-1">
              <Text className="text-gray-900 text-xl font-bold mb-1">
                {user?.name || 'User'}
              </Text>
              <Text className="text-gray-600 text-sm mb-1">
                {user?.email || 'email@example.com'}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                <Text className="text-gray-500 text-xs ml-1">
                  {formatMemberSince(user?.registration)}
                </Text>
              </View>

              {/* Email Verification Badge */}
              <View className="flex-row items-center mt-2">
                <View className={`flex-row items-center px-2 py-1 rounded-full ${user?.emailVerification ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                  <Ionicons
                    name={user?.emailVerification ? "checkmark-circle" : "alert-circle"}
                    size={12}
                    color={user?.emailVerification ? "#10B981" : "#F59E0B"}
                  />
                  <Text className={`text-xs ml-1 font-medium ${user?.emailVerification ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                    {user?.emailVerification ? 'Verified' : 'Unverified'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              className="bg-gray-100 p-3 rounded-full ml-2"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2
              }}
            >
              <Ionicons name="create-outline" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Summary */}
        <View className="mx-6 bg-white p-5"
          style={{ borderRadius: 16, elevation: 2 }}
        >
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