import { View, Text, TouchableOpacity, Switch } from 'react-native'
import React from 'react'
import LanguageSwitcher from '../LanguageSwitcher';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { useTheme } from '@/context/ThemeContext';

const AppSettings = () => {

    const { isDark, toggleTheme } = useTheme();
    
    return (
        <View className="mx-6 mt-4">
            <Text className="text-lg font-semibold text-typography-600 mb-4">App Settings</Text>
            <View className="bg-background-0 rounded-2xl shadow-sm border border-outline-200">
                <TouchableOpacity
                    className={`p-5 flex-row items-center border-b border-outline-200`}
                >
                    <View className={`bg-purple-500 w-10 h-10 rounded-full items-center justify-center mr-4`}>
                        <Ionicons name="notifications" size={20} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-typography-900 font-medium">Notifications</Text>
                        <Text className="text-typography-500 text-sm mt-1">Manage Your Alerts</Text>
                    </View>
                    <Switch
                        value={false}
                        trackColor={{ false: '#E5E7EB', true: '#14B8A6' }}
                        thumbColor="#FFFFFF"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    className={`p-5 flex-row items-center border-b border-outline-200`}
                >
                    <View className={`bg-gray-800 w-10 h-10 rounded-full items-center justify-center mr-4`}>
                        <Ionicons name="moon" size={20} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-typography-900 font-medium">Dark Mode</Text>
                        <Text className="text-typography-500 text-sm mt-1">Switch to dark theme</Text>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={() => toggleTheme()}
                        trackColor={{ false: '#E5E7EB', true: '#14B8A6' }}
                        thumbColor="#FFFFFF"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    className={`p-5 flex-row items-center border-b border-outline-200`}
                >
                    <View className={`bg-teal-500 w-10 h-10 rounded-full items-center justify-center mr-4`}>
                        <Ionicons name="shield-checkmark" size={20} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-typography-900 font-medium">Privacy & Security</Text>
                        <Text className="text-typography-500 text-sm mt-1">Manage Your Data</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Language Switcher - Add after other settings */}
                <View>
                    <LanguageSwitcher />
                </View>
            </View>
        </View>
    )
}

export default AppSettings