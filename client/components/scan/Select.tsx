import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const scanOptions = [
    {
        id: 1,
        title: 'Take Photo',
        subtitle: 'Capture prescription with camera',
        icon: 'camera',
        gradient: ['#00ffc8', '#00e6b8'],
        action: 'camera'
    },
    {
        id: 2,
        title: 'Choose from Gallery',
        subtitle: 'Select existing photo',
        icon: 'images',
        gradient: ['#4facfe', '#00f2fe'],
        action: 'gallery'
    },
    {
        id: 3,
        title: 'Document Scanner',
        subtitle: 'Auto-detect document edges',
        icon: 'document-text',
        gradient: ['#a8edea', '#fed6e3'],
        action: 'document'
    }
];


const Select = ({
    handleScanAction
}: {
    handleScanAction: (action: string) => void;
}) => {
    return (
        <View className="flex-1 justify-center px-6">
            <View className="items-center mb-8">
                <LinearGradient
                    colors={['#00ffc8', '#00e6b8']}
                    className="w-32 h-32 items-center justify-center mb-6 shadow-lg"
                    style={{ borderRadius: 900, elevation: 4 }}
                >
                    <Ionicons name="scan" size={64} color="white" />
                </LinearGradient>
                <Text className="text-xl font-semibold text-typography-900 text-center mb-2">
                    Ready to Scan
                </Text>
                <Text className="text-typography-600 text-center px-4">
                    Choose how you&apos;d like to upload your prescription
                </Text>
            </View>

            <View className="flex gap-2">
                {scanOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        className="bg-background-0 rounded-2xl p-5 shadow-sm border border-gray-100 flex-row items-center"
                        onPress={() => handleScanAction(option.action)}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={option.gradient as [string, string, ...string[]]}
                            className="w-12 h-12 items-center justify-center mr-4"
                            style={{ borderRadius: 8 }}
                        >
                            <Ionicons name={option.icon as any} size={24} color="white" />
                        </LinearGradient>
                        <View className="flex-1">
                            <Text className="text-typography-900 font-semibold text-lg">{option.title}</Text>
                            <Text className="text-typography-500 text-sm mt-1">{option.subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

export default Select