import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ScanScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const scanOptions = [
    {
      id: 1,
      title: 'Take Photo',
      subtitle: 'Capture prescription with camera',
      icon: 'camera',
      color: 'bg-teal-500',
      action: 'camera'
    },
    {
      id: 2,
      title: 'Choose from Gallery',
      subtitle: 'Select existing photo',
      icon: 'images',
      color: 'bg-blue-500',
      action: 'gallery'
    },
    {
      id: 3,
      title: 'Scan Document',
      subtitle: 'Auto-detect document edges',
      icon: 'document-text',
      color: 'bg-purple-500',
      action: 'document'
    }
  ];

  const handleImagePicker = async (type: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleCameraLaunch = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera access');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleScanAction = (action: string) => {
    switch (action) {
      case 'camera':
        handleCameraLaunch();
        break;
      case 'gallery':
        handleImagePicker('gallery');
        break;
      case 'document':
        Alert.alert('Coming Soon', 'Document scanning feature will be available soon!');
        break;
    }
  };

  const analyzePrescription = () => {
    setIsScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert(
        'Scan Complete!',
        'Prescription analyzed successfully. Found 3 medicines with 1 interaction warning.',
        [
          {
            text: 'View Results',
            onPress: () => {
              // Navigate to results
            }
          }
        ]
      );
    }, 3000);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Scan Prescription</Text>
        <Text className="text-gray-600 mt-1">Upload your prescription to analyze medicines</Text>
      </View>

      <View className="flex-1 px-6">
        {!selectedImage ? (
          <View className="flex-1 justify-center">
            {/* Scan Icon */}
            <View className="items-center mb-8">
              <View className="bg-teal-100 w-32 h-32 rounded-full items-center justify-center mb-6">
                <Ionicons name="scan" size={64} color="#14B8A6" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
                Ready to Scan
              </Text>
              <Text className="text-gray-600 text-center px-4">
                Choose how you&apos;d like to upload your prescription
              </Text>
            </View>

            {/* Scan Options */}
            <View className="space-y-4">
              {scanOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-row items-center"
                  onPress={() => handleScanAction(option.action)}
                >
                  <View className={`${option.color} w-12 h-12 rounded-xl items-center justify-center mr-4`}>
                    <Ionicons name={option.icon as any} size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-lg">{option.title}</Text>
                    <Text className="text-gray-500 text-sm mt-1">{option.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Tips */}
            <View className="bg-blue-50 rounded-xl p-4 mt-8">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <View className="ml-3 flex-1">
                  <Text className="text-blue-900 font-medium">Tips for better scanning:</Text>
                  <Text className="text-blue-700 text-sm mt-1">
                    • Ensure good lighting{'\n'}
                    • Keep the prescription flat{'\n'}
                    • Avoid shadows and glare
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View className="flex-1 py-6">
            {/* Selected Image */}
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Selected Image</Text>
              <View className="rounded-xl overflow-hidden">
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full h-64 bg-gray-100"
                  resizeMode="cover"
                />
              </View>

              {/* Image Actions */}
              <View className="flex-row mt-4 space-x-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 py-3 px-4 rounded-xl flex-row items-center justify-center"
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="refresh" size={16} color="#6B7280" />
                  <Text className="text-gray-600 font-medium ml-2">Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-teal-500 py-3 px-4 rounded-xl flex-row items-center justify-center"
                  onPress={analyzePrescription}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <View className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      <Text className="text-white font-medium">Analyzing...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={16} color="white" />
                      <Text className="text-white font-medium ml-2">Analyze</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Analysis Info */}
            {isScanning && (
              <View className="bg-teal-50 rounded-xl p-4">
                <View className="flex-row items-center">
                  <View className="animate-pulse w-6 h-6 bg-teal-500 rounded-full mr-3" />
                  <View className="flex-1">
                    <Text className="text-teal-900 font-medium">Processing your prescription...</Text>
                    <Text className="text-teal-700 text-sm mt-1">
                      Extracting medicines and checking for interactions
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}