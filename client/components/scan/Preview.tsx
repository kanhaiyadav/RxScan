import { Image, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { SelectedImage } from '@/types/prescription'

const Preview = ({ selectedImage, isLoading, extractPrescription, setCurrentStep, ocrError, ocrLoading }: {
    selectedImage: SelectedImage | null
    isLoading: boolean
    extractPrescription: () => void
    setCurrentStep: React.Dispatch<React.SetStateAction<"select" | "preview" | "results">>
    ocrError: string | null
    ocrLoading?: boolean
}) => {

    const formatFileSize = (bytes: number): string => {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    
    return (
        <View className="flex-1 p-6">
            <View className="bg-white flex-1 rounded-2xl p-4 mb-6 shadow-sm border border-gray-200">
                <Text className="text-lg font-semibold text-gray-900 mb-4">Preview Image</Text>
                {selectedImage && (
                    <Image
                        source={{ uri: selectedImage.uri }}
                        className="w-full flex-1 bg-gray-100 rounded-xl mb-4"
                        resizeMode="contain"
                    />
                )}
                <View>
                    <Text className="text-gray-600">
                        {selectedImage?.fileName || 'prescription.jpg'}
                    </Text>
                    <Text className="text-gray-600">
                        Size: {selectedImage?.fileSize ? formatFileSize(selectedImage.fileSize) : 'Unknown'}
                    </Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View className="gap-4">
                <TouchableOpacity
                    className={`rounded-2xl overflow-hidden elevation-sm ${isLoading ? 'opacity-50' : ''
                        }`}
                    disabled={isLoading}
                    onPress={extractPrescription}
                >
                    <LinearGradient
                        colors={['#00ffc8', '#00e6b8']}
                        className="p-4 flex-row items-center justify-center"
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="black" />
                        ) : (
                            <Ionicons name="scan" size={24} color="black" />
                        )}
                        <Text className="text-black font-semibold text-lg ml-3">
                            {isLoading ? 'Analyzing...' : 'Start Analysis'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-white border border-gray-300 rounded-2xl p-4 flex-row items-center justify-center"
                    onPress={() => setCurrentStep('select')}
                    disabled={isLoading}
                >
                    <Ionicons name="refresh" size={20} color="#6b7280" />
                    <Text className="text-gray-700 font-medium ml-2">Choose Different Image</Text>
                </TouchableOpacity>
            </View>

            {/* Error Display */}
            {ocrError && (
                <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-4">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="alert-circle" size={20} color="#ef4444" />
                        <Text className="text-red-800 font-semibold ml-2">Error</Text>
                    </View>
                    <Text className="text-red-700">{ocrError}</Text>
                    <TouchableOpacity
                        className="bg-red-100 rounded-xl p-3 mt-3"
                        onPress={extractPrescription}
                    >
                        <Text className="text-red-800 font-medium text-center">Try Again</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
}

export default Preview