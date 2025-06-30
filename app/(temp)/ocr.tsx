import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Type definitions
interface Doctor {
  name?: string;
  qualifications?: string;
  registration_number?: string;
  clinic_name?: string;
  address?: string;
  phone?: string;
}

interface Patient {
  name?: string;
  age?: string;
  gender?: string;
  address?: string;
  prescription_date?: string;
}

interface Medication {
  name?: string;
  dosage?: string;
  quantity?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  uncertain?: boolean;
}

interface AdditionalNotes {
  special_instructions?: string;
  follow_up?: string;
  warnings?: string;
}

interface PrescriptionData {
  doctor?: Doctor;
  patient?: Patient;
  medications?: Medication[];
  additional_notes?: AdditionalNotes;
  extraction_notes?: string;
  raw_response?: string;
  note?: string;
}

interface ApiResponse {
  success: boolean;
  data?: PrescriptionData;
  error?: string;
}

interface SelectedImage {
  uri: string;
  fileName?: string;
  fileSize?: number;
}

const PrescriptionOCR: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PrescriptionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // SOLUTION 1: Replace with your laptop's IP address
  // To find your IP: Windows (ipconfig), Mac/Linux (ifconfig or ip addr)
  // Example: If your laptop IP is 192.168.1.100, use:
  const API_BASE_URL = 'https://ef15-14-194-180-242.ngrok-free.app'; // Replace with your actual IP

  // Alternative for development - you can also use your Expo tunnel URL
  // const API_BASE_URL = 'https://your-tunnel-url.ngrok.io';

  const pickImage = async (): Promise<void> => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to select images.');
        return;
      }

      // SOLUTION 2: Fixed deprecated MediaTypeOptions
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images, // Fixed deprecated MediaTypeOptions
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          fileName: asset.fileName ?? undefined,
          fileSize: asset.fileSize || 0,
        });
        setResult(null);
        setError(null);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to pick image: ${(error as Error).message}`);
    }
  };

  const takePhoto = async (): Promise<void> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          fileName: asset.fileName || 'prescription.jpg',
          fileSize: asset.fileSize || 0,
        });
        setResult(null);
        setError(null);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to take photo: ${(error as Error).message}`);
    }
  };

  const showImageOptions = (): void => {
    Alert.alert(
      'Select Image',
      'Choose how you want to select the prescription image',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const extractPrescription = async (): Promise<void> => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: selectedImage.fileName || 'prescription.jpg',
      } as any);

      console.log('Making request to:', `${API_BASE_URL}/api/extract`);

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 60000) // 60 seconds
      );

      // Race between fetch and timeout
      const fetchPromise = fetch(`${API_BASE_URL}/api/extract`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to extract prescription data');
      }
    } catch (error) {
      console.error('Network error:', error);
      if (error.message?.includes('Request timeout')) {
        setError('Request timed out. Please check your connection and try again.');
      } else if (error.message?.includes('Network request failed')) {
        console.log(error);
        setError('Cannot connect to server. Make sure your Flask server is running and accessible from your device.');
      } else {
        setError(`Network error: ${(error as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const renderInfoItem = (label: string, value?: string): React.ReactNode => {
    if (!value || value === 'null') return null;

    return (
      <View className="flex-row mb-2 flex-wrap">
        <Text className="font-bold text-gray-600 min-w-[120px] mr-2">{label}:</Text>
        <Text className="text-gray-800 flex-1">{value}</Text>
      </View>
    );
  };

  const renderMedication = (med: Medication, index: number): React.ReactNode => {
    return (
      <View
        key={index}
        className={`bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm ${med.uncertain ? 'bg-yellow-50 border-l-4 border-l-yellow-400' : ''
          }`}
      >
        <Text className="text-lg font-bold text-pink-600 mb-2">
          {med.name || 'Unknown Medicine'}
        </Text>
        {renderInfoItem('Dosage', med.dosage)}
        {renderInfoItem('Quantity', med.quantity)}
        {renderInfoItem('Frequency', med.frequency)}
        {renderInfoItem('Duration', med.duration)}
        {renderInfoItem('Instructions', med.instructions)}
        {med.uncertain && (
          <Text className="mt-2 text-yellow-700 italic">
            ⚠️ This medication information is uncertain
          </Text>
        )}
      </View>
    );
  };

  const renderResults = (): React.ReactNode => {
    if (!result) return null;

    // Handle fallback case where JSON parsing failed
    if (result.raw_response) {
      return (
        <View className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4 mb-5">
          <Text className="text-lg font-bold text-blue-600 mb-2">📄 Raw Response</Text>
          <Text className="font-bold mb-2 text-gray-600">{result.note}</Text>
          <Text className="font-mono bg-gray-100 p-4 rounded border border-dashed border-gray-400">
            {result.raw_response}
          </Text>
        </View>
      );
    }

    // Show parsing note if available
    const showParsingNote = result.extraction_notes && result.extraction_notes.includes('Could not parse as JSON');

    return (
      <ScrollView className="max-h-[500px]" showsVerticalScrollIndicator={false}>
        {/* Parsing Note */}
        {showParsingNote && (
          <View className="bg-yellow-50 border-l-4 border-l-yellow-400 rounded-lg p-4 mb-5">
            <Text className="text-base font-bold text-yellow-700 mb-1">⚠️ Parsing Note</Text>
            <Text className="text-sm text-yellow-700">Could not parse as JSON, but data was successfully extracted</Text>
          </View>
        )}

        {/* Doctor Information */}
        {result.doctor && (
          <View className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4 mb-5">
            <Text className="text-lg font-bold text-blue-600 mb-2">👨‍⚕️ Doctor Information</Text>
            {renderInfoItem('Name', result.doctor.name)}
            {renderInfoItem('Qualifications', result.doctor.qualifications)}
            {renderInfoItem('Registration', result.doctor.registration_number)}
            {renderInfoItem('Clinic', result.doctor.clinic_name)}
            {renderInfoItem('Address', result.doctor.address)}
            {renderInfoItem('Phone', result.doctor.phone)}
          </View>
        )}

        {/* Patient Information */}
        {result.patient && (
          <View className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4 mb-5">
            <Text className="text-lg font-bold text-blue-600 mb-2">👤 Patient Information</Text>
            {renderInfoItem('Name', result.patient.name)}
            {renderInfoItem('Age', result.patient.age)}
            {renderInfoItem('Gender', result.patient.gender)}
            {renderInfoItem('Address', result.patient.address)}
            {renderInfoItem('Date', result.patient.prescription_date)}
          </View>
        )}

        {/* Medications */}
        {result.medications && result.medications.length > 0 && (
          <View className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4 mb-5">
            <Text className="text-lg font-bold text-blue-600 mb-2">💊 Medications</Text>
            {result.medications.map(renderMedication)}
          </View>
        )}

        {/* Additional Notes */}
        {result.additional_notes && (
          <View className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4 mb-5">
            <Text className="text-lg font-bold text-blue-600 mb-2">📝 Additional Notes</Text>
            {renderInfoItem('Special Instructions', result.additional_notes.special_instructions)}
            {renderInfoItem('Follow-up', result.additional_notes.follow_up)}
            {renderInfoItem('Warnings', result.additional_notes.warnings)}
          </View>
        )}

        {/* Extraction Notes */}
        {result.extraction_notes && (
          <View className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4 mb-5">
            <Text className="text-lg font-bold text-blue-600 mb-2">ℹ️ Extraction Notes</Text>
            <Text className="text-gray-800">{result.extraction_notes}</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 p-5">
        <Text className="text-3xl font-bold text-center mb-8 text-gray-800">
          🏥 Prescription OCR
        </Text>

        {/* Upload Area */}
        <TouchableOpacity
          className="border-2 border-dashed border-gray-300 rounded-2xl p-16 items-center mb-5 bg-white"
          onPress={showImageOptions}
          activeOpacity={0.7}
        >
          <Text className="text-6xl mb-5">📄</Text>
          <Text className="text-lg text-gray-600 text-center mb-1">
            Tap to select prescription image
          </Text>
          <Text className="text-sm text-gray-400 text-center">
            Camera or Gallery
          </Text>
        </TouchableOpacity>

        {/* Image Preview */}
        {selectedImage && (
          <View className="items-center mb-5">
            <Image
              source={{ uri: selectedImage.uri }}
              className="w-48 h-36 rounded-xl mb-2"
              resizeMode="cover"
            />
            <Text className="text-sm text-gray-600">
              {selectedImage.fileName} ({formatFileSize(selectedImage.fileSize || 0)})
            </Text>
          </View>
        )}

        {/* Extract Button */}
        <TouchableOpacity
          className={`bg-blue-500 py-4 px-8 rounded-full mt-5 ${(!selectedImage || loading) ? 'opacity-60' : ''
            }`}
          onPress={extractPrescription}
          disabled={!selectedImage || loading}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold text-center">
            {loading ? 'Processing...' : 'Extract Prescription Details'}
          </Text>
        </TouchableOpacity>

        {/* Loading Indicator */}
        {loading && (
          <View className="items-center mt-5">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="mt-2 text-base text-gray-600">Processing prescription image...</Text>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View className="bg-red-100 border-l-4 border-l-red-500 p-5 rounded-xl mt-5">
            <Text className="text-lg font-bold text-red-600 mb-2">Error</Text>
            <Text className="text-base text-red-800">{error}</Text>
          </View>
        )}

        {/* Results */}
        {result && (
          <View className="mt-8">
            <Text className="text-xl font-bold text-green-600 mb-4">Extraction Results</Text>
            {renderResults()}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrescriptionOCR;