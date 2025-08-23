import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { usePrescriptionScanner } from '@/hooks/usePrescriptionScanner';

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

export default function EnhancedPrescriptionOCR() {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<PrescriptionData | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'select' | 'preview' | 'results'>('select');

  // Use the prescription scanner hook
  const {
    loading: analysisLoading,
    error: analysisError,
    analyzePrescriptionFromApiData,
    validatePrescription,
  } = usePrescriptionScanner();

  const [prescriptionAnalysis, setPrescriptionAnalysis] = useState<any>(null);
  const [validationResults, setValidationResults] = useState<any>(null);

  // Replace with your actual API base URL
  const API_BASE_URL = 'https://648b-14-194-180-252.ngrok-free.app';

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

  // Function to parse JSON from raw response
  const parseRawResponse = (rawResponse: string): PrescriptionData | null => {
    try {
      const cleanedResponse = rawResponse.replace(/```json\s*|\s*```/g, '').trim();
      const parsedData = JSON.parse(cleanedResponse);
      console.log('Successfully parsed JSON:', parsedData);
      return parsedData;
    } catch (error) {
      console.error('Failed to parse JSON from raw response:', error);
      return null;
    }
  };

  const handleCameraLaunch = async () => {
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          fileName: asset.fileName || 'prescription.jpg',
          fileSize: asset.fileSize || 0,
        });
        setCurrentStep('preview');
        resetResults();
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', `Failed to take photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          fileName: asset.fileName || 'selected_image.jpg',
          fileSize: asset.fileSize || 0,
        });
        setCurrentStep('preview');
        resetResults();
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', `Failed to pick image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleScanAction = (action: string) => {
    switch (action) {
      case 'camera':
        handleCameraLaunch();
        break;
      case 'gallery':
        handleImagePicker();
        break;
      case 'document':
        Alert.alert('Coming Soon', 'Document scanning feature will be available soon!');
        break;
    }
  };

  const resetResults = () => {
    setOcrResult(null);
    setOcrError(null);
    setPrescriptionAnalysis(null);
    setValidationResults(null);
  };

  // Extract prescription using OCR API
  const extractPrescription = async (): Promise<void> => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    setOcrLoading(true);
    setOcrError(null);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: selectedImage.fileName || 'prescription.jpg',
      } as any);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 60000)
      );

      const fetchPromise = fetch(`${API_BASE_URL}/api/extract`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        let processedResult = data.data;

        // Parse raw response if available
        if (data.data.raw_response) {
          const parsedData = parseRawResponse(data.data.raw_response);
          if (parsedData) {
            processedResult = {
              ...parsedData,
              raw_response: data.data.raw_response,
              note: data.data.note,
              extraction_notes: parsedData.extraction_notes || data.data.extraction_notes
            };
          }
        }

        setOcrResult(processedResult);
        // Automatically start analysis after OCR
        await analyzePrescription(processedResult);
      } else {
        setOcrError(data.error || 'Failed to extract prescription data');
      }
    } catch (error) {
      console.error('OCR error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      if (errorMessage.includes('Request timeout')) {
        setOcrError('Request timed out. Please check your connection and try again.');
      } else if (errorMessage.includes('Network request failed')) {
        setOcrError('Cannot connect to server. Make sure your Flask server is running and accessible.');
      } else {
        setOcrError(`Network error: ${errorMessage}`);
      }
    } finally {
      setOcrLoading(false);
    }
  };

  // Analyze prescription using the hook
  const analyzePrescription = async (prescriptionData: PrescriptionData) => {
    try {
      console.log('Starting prescription analysis...');

      // Use the hook to analyze prescription
      const analysis = await analyzePrescriptionFromApiData(prescriptionData);
      setPrescriptionAnalysis(analysis);

      // Validate prescription against user profile
      const validation = await validatePrescription(analysis);
      setValidationResults(validation);

      console.log('Analysis completed:', analysis);
      console.log('Validation results:', validation);

      setCurrentStep('results');
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Error', 'Failed to analyze prescription. Please try again.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getRiskBgColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#fef2f2';
      case 'medium': return '#fffbeb';
      case 'low': return '#f0fdf4';
      default: return '#f9fafb';
    }
  };

  const renderInfoItem = (label: string, value?: string): React.ReactNode => {
    if (!value || value === 'null') return null;

    return (
      <View className="flex-row mb-3 px-1">
        <Text className="font-semibold text-gray-700 min-w-[100px] mr-3">{label}:</Text>
        <Text className="text-gray-900 flex-1 font-medium">{value}</Text>
      </View>
    );
  };

  const renderMedicineAnalysis = (item: any, index: number): React.ReactNode => {
    const { medicine, analysis, hasWarnings, warningCount } = item;

    return (
      <View
        key={index}
        className={`bg-white border rounded-2xl p-5 mb-4 shadow-sm ${medicine.uncertain ? 'bg-yellow-50 border-yellow-300 border-l-4 border-l-yellow-500' : 'border-gray-200'
          }`}
      >
        {/* Medicine Header */}
        <View className="flex-row items-center mb-3">
          <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
            <Ionicons name="medical" size={20} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">{medicine.name}</Text>
            <Text className="text-sm text-gray-600">
              Confidence: {Math.round(medicine.confidence * 100)}%
            </Text>
          </View>
          {hasWarnings && (
            <View className="bg-red-100 px-3 py-1 rounded-full">
              <Text className="text-red-800 text-xs font-medium">
                {warningCount} warning{warningCount > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Medicine Details */}
        <View className="space-y-2 mb-4">
          {renderInfoItem('Dosage', medicine.dosage)}
          {renderInfoItem('Frequency', medicine.frequency)}
          {renderInfoItem('Duration', medicine.duration)}
          {renderInfoItem('Instructions', medicine.instructions)}
        </View>

        {/* Analysis Results */}
        {analysis ? (
          <View className="border-t border-gray-200 pt-4">
            <Text className="font-semibold text-gray-900 mb-2">Analysis:</Text>

            {/* Basic Info */}
            <View className="bg-gray-50 rounded-xl p-3 mb-3">
              <Text className="text-sm text-gray-800">
                <Text className="font-medium">Generic Name:</Text> {analysis.genericName || 'N/A'}
              </Text>
              <Text className="text-sm text-gray-800 mt-1">
                <Text className="font-medium">Category:</Text> {analysis.category || 'N/A'}
              </Text>
              <Text className="text-sm text-gray-800 mt-1">
                <Text className="font-medium">Uses:</Text> {analysis.uses || 'N/A'}
              </Text>
            </View>

            {/* Warnings */}
            {analysis.warnings && analysis.warnings.length > 0 && (
              <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3">
                <Text className="font-medium text-yellow-800 mb-2">⚠️ Warnings:</Text>
                {analysis.warnings.map((warning: string, idx: number) => (
                  <Text key={idx} className="text-sm text-yellow-800 mb-1">• {warning}</Text>
                ))}
              </View>
            )}

            {/* Interactions */}
            {analysis.interactions && analysis.interactions.length > 0 && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                <Text className="font-medium text-red-800 mb-2">🚫 Interactions:</Text>
                {analysis.interactions.map((interaction: any, idx: number) => (
                  <View key={idx} className="mb-2">
                    <Text className="text-sm font-medium text-red-800">
                      {interaction.severity.toUpperCase()}: {interaction.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Side Effects */}
            {analysis.sideEffects && analysis.sideEffects.length > 0 && (
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <Text className="font-medium text-blue-800 mb-2">Side Effects:</Text>
                {analysis.sideEffects.slice(0, 3).map((effect: string, idx: number) => (
                  <Text key={idx} className="text-sm text-blue-800 mb-1">• {effect}</Text>
                ))}
                {analysis.sideEffects.length > 3 && (
                  <Text className="text-sm text-blue-600 mt-1">
                    +{analysis.sideEffects.length - 3} more...
                  </Text>
                )}
              </View>
            )}
          </View>
        ) : (
          <View className="border-t border-gray-200 pt-4">
            <View className="bg-gray-100 rounded-xl p-3">
              <Text className="text-gray-600 text-center">
                Medicine not found in database. Please consult with pharmacist.
              </Text>
            </View>
          </View>
        )}

        {/* Uncertainty Warning */}
        {medicine.uncertain && (
          <View className="mt-4 flex-row items-center bg-yellow-100 p-3 rounded-xl">
            <Ionicons name="warning" size={16} color="#f59e0b" />
            <Text className="ml-2 text-yellow-800 text-sm font-medium">
              This medication information is uncertain
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderResults = (): React.ReactNode => {
    if (!ocrResult) return null;

    return (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Overall Risk Assessment */}
        {prescriptionAnalysis && (
          <View
            className="border rounded-2xl p-5 mb-6 shadow-sm"
            style={{
              backgroundColor: getRiskBgColor(prescriptionAnalysis.overallRisk),
              borderColor: getRiskColor(prescriptionAnalysis.overallRisk)
            }}
          >
            <View className="flex-row items-center mb-3">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: getRiskColor(prescriptionAnalysis.overallRisk) + '20' }}
              >
                <Ionicons
                  name={prescriptionAnalysis.overallRisk === 'high' ? 'warning' :
                    prescriptionAnalysis.overallRisk === 'medium' ? 'alert-circle' : 'checkmark-circle'}
                  size={24}
                  color={getRiskColor(prescriptionAnalysis.overallRisk)}
                />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold" style={{ color: getRiskColor(prescriptionAnalysis.overallRisk) }}>
                  {prescriptionAnalysis.overallRisk.toUpperCase()} RISK PRESCRIPTION
                </Text>
                <Text className="text-sm mt-1" style={{ color: getRiskColor(prescriptionAnalysis.overallRisk) }}>
                  {prescriptionAnalysis.medicineAnalysis.length} medicines analyzed
                </Text>
              </View>
            </View>

            {/* Critical Warnings */}
            {prescriptionAnalysis.criticalWarnings && prescriptionAnalysis.criticalWarnings.length > 0 && (
              <View className="mt-4">
                <Text className="font-semibold mb-2" style={{ color: getRiskColor(prescriptionAnalysis.overallRisk) }}>
                  Critical Warnings:
                </Text>
                {prescriptionAnalysis.criticalWarnings.map((warning: string, idx: number) => (
                  <Text key={idx} className="text-sm mb-1" style={{ color: getRiskColor(prescriptionAnalysis.overallRisk) }}>
                    • {warning}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Validation Results */}
        {validationResults && !validationResults.isValid && (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="close-circle" size={24} color="#ef4444" />
              <Text className="text-lg font-bold text-red-600 ml-2">Validation Issues Found</Text>
            </View>

            {validationResults.allergyConflicts.length > 0 && (
              <View className="mb-3">
                <Text className="font-medium text-red-800 mb-1">Allergy Conflicts:</Text>
                {validationResults.allergyConflicts.map((conflict: string, idx: number) => (
                  <Text key={idx} className="text-sm text-red-700 mb-1">• {conflict}</Text>
                ))}
              </View>
            )}

            {validationResults.drugInteractions.length > 0 && (
              <View className="mb-3">
                <Text className="font-medium text-red-800 mb-1">Drug Interactions:</Text>
                {validationResults.drugInteractions.map((interaction: string, idx: number) => (
                  <Text key={idx} className="text-sm text-red-700 mb-1">• {interaction}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Success Header */}
        <View className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
          <View className="flex-row items-center">
            <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mr-4">
              <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-green-800 font-bold text-lg">Analysis Complete!</Text>
              <Text className="text-green-700 mt-1">
                {prescriptionAnalysis ?
                  `${prescriptionAnalysis.medicineAnalysis.length} medicines analyzed` :
                  'Prescription extracted successfully'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Doctor Information */}
        {ocrResult.doctor && (
          <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <LinearGradient
                colors={['#00ffc8', '#00e6b8']}
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
              >
                <Ionicons name="person" size={24} color="white" />
              </LinearGradient>
              <Text className="text-lg font-bold text-gray-900">Doctor Information</Text>
            </View>
            <View className="space-y-2">
              {renderInfoItem('Name', ocrResult.doctor.name)}
              {renderInfoItem('Qualifications', ocrResult.doctor.qualifications)}
              {renderInfoItem('Registration', ocrResult.doctor.registration_number)}
              {renderInfoItem('Clinic', ocrResult.doctor.clinic_name)}
              {renderInfoItem('Address', ocrResult.doctor.address)}
              {renderInfoItem('Phone', ocrResult.doctor.phone)}
            </View>
          </View>
        )}

        {/* Patient Information */}
        {ocrResult.patient && (
          <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
              >
                <Ionicons name="person-circle" size={24} color="white" />
              </LinearGradient>
              <Text className="text-lg font-bold text-gray-900">Patient Information</Text>
            </View>
            <View className="space-y-2">
              {renderInfoItem('Name', ocrResult.patient.name)}
              {renderInfoItem('Age', ocrResult.patient.age)}
              {renderInfoItem('Gender', ocrResult.patient.gender)}
              {renderInfoItem('Address', ocrResult.patient.address)}
              {renderInfoItem('Date', ocrResult.patient.prescription_date)}
            </View>
          </View>
        )}

        {/* Medicine Analysis */}
        {prescriptionAnalysis && prescriptionAnalysis.medicineAnalysis.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <LinearGradient
                colors={['#ff6b6b', '#ee5a24']}
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
              >
                <Ionicons name="medical" size={24} color="white" />
              </LinearGradient>
              <Text className="text-lg font-bold text-gray-900">
                Medicine Analysis ({prescriptionAnalysis.medicineAnalysis.length})
              </Text>
            </View>
            {prescriptionAnalysis.medicineAnalysis.map(renderMedicineAnalysis)}
          </View>
        )}

        {/* Additional Notes */}
        {ocrResult.additional_notes && (
          <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <LinearGradient
                colors={['#a8edea', '#fed6e3']}
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
              >
                <Ionicons name="document-text" size={24} color="#6b7280" />
              </LinearGradient>
              <Text className="text-lg font-bold text-gray-900">Additional Notes</Text>
            </View>
            <View className="space-y-2">
              {renderInfoItem('Special Instructions', ocrResult.additional_notes.special_instructions)}
              {renderInfoItem('Follow-up', ocrResult.additional_notes.follow_up)}
              {renderInfoItem('Warnings', ocrResult.additional_notes.warnings)}
            </View>
          </View>
        )}

        {/* Extraction Notes */}
        {ocrResult.extraction_notes && (
          <View className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="information-circle" size={20} color="#6b7280" />
              <Text className="text-lg font-bold text-gray-700 ml-2">Extraction Notes</Text>
            </View>
            <Text className="text-gray-800">{ocrResult.extraction_notes}</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const resetToStart = () => {
    setSelectedImage(null);
    setOcrResult(null);
    setOcrError(null);
    setPrescriptionAnalysis(null);
    setValidationResults(null);
    setCurrentStep('select');
  };

  const isLoading = ocrLoading || analysisLoading;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#00ffc8" />

      {/* Header */}
      <LinearGradient
        colors={['#00ffc8', '#80f7ed']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="border-b border-gray-200 shadow-sm"
      >
        <View className="px-6 py-6">
          <View className="flex-row items-center">
            {currentStep !== 'select' && (
              <TouchableOpacity
                onPress={resetToStart}
                className="mr-4 bg-white/20 w-10 h-10 rounded-full items-center justify-center"
              >
                <Ionicons name="arrow-back" size={20} color="#1f2937" />
              </TouchableOpacity>
            )}
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {currentStep === 'select' ? 'Scan Prescription' :
                  currentStep === 'preview' ? 'Review & Analyze' : 'Analysis Results'}
              </Text>
              <Text className="text-gray-700 mt-1">
                {currentStep === 'select' ? 'Upload your prescription to analyze medicines' :
                  currentStep === 'preview' ? 'Confirm your image and start analysis' : 'Complete prescription analysis with drug interactions'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View className="flex-1 px-6">
        {/* Selection Screen */}
        {currentStep === 'select' && (
          <View className="flex-1 justify-center">
            <View className="items-center mb-8">
              <LinearGradient
                colors={['#00ffc8', '#00e6b8']}
                className="w-32 h-32 items-center justify-center mb-6 shadow-lg"
                style={{ borderRadius: 900, elevation: 4 }}
              >
                <Ionicons name="scan" size={64} color="white" />
              </LinearGradient>
              <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
                Ready to Scan
              </Text>
              <Text className="text-gray-600 text-center px-4">
                Choose how you&apos;d like to upload your prescription
              </Text>
            </View>

            <View className="space-y-4">
              {scanOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-row items-center"
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
                    <Text className="text-gray-900 font-semibold text-lg">{option.title}</Text>
                    <Text className="text-gray-500 text-sm mt-1">{option.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Preview Screen */}
        {currentStep === 'preview' && selectedImage && (
          <View className="flex-1 py-6">
            <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-200">
              <Text className="text-lg font-semibold text-gray-900 mb-4">Preview Image</Text>
              <Image
                source={{ uri: selectedImage.uri }}
                className="w-full h-64 rounded-xl mb-4"
                resizeMode="contain"
              />
              <View className="flex-row justify-between">
                <Text className="text-gray-600">
                  Size: {selectedImage.fileSize ? formatFileSize(selectedImage.fileSize) : 'Unknown'}
                </Text>
                <Text className="text-gray-600">
                  {selectedImage.fileName || 'prescription.jpg'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="space-y-4">
              <TouchableOpacity
                className={`rounded-2xl p-4 ${isLoading ? 'opacity-50' : ''
                  }`}
                disabled={isLoading}
                onPress={extractPrescription}
              >
                <LinearGradient
                  colors={['#00ffc8', '#00e6b8']}
                  className="rounded-2xl p-4 flex-row items-center justify-center"
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="scan" size={24} color="white" />
                  )}
                  <Text className="text-white font-semibold text-lg ml-3">
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

            {/* Loading Status */}
            {isLoading && (
              <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-4">
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#3b82f6" />
                  <Text className="text-blue-800 ml-3">
                    {ocrLoading ? 'Extracting prescription data...' : 'Analyzing medicines...'}
                  </Text>
                </View>
                {ocrLoading && (
                  <Text className="text-blue-600 text-center mt-2 text-sm">
                    This may take up to 60 seconds
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Results Screen */}
        {currentStep === 'results' && renderResults()}
      </View>

      {/* Bottom Action Bar for Results */}
      {currentStep === 'results' && (
        <View className="px-6 py-4 bg-white border-t border-gray-200">
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 bg-gray-100 rounded-2xl p-4 flex-row items-center justify-center"
              onPress={resetToStart}
            >
              <Ionicons name="refresh" size={20} color="#6b7280" />
              <Text className="text-gray-700 font-medium ml-2">Scan New</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-2xl p-4"
              onPress={() => {
                // Save or share functionality
                Alert.alert('Feature Coming Soon', 'Save and share functionality will be available soon!');
              }}
            >
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                className="rounded-2xl p-4 flex-row items-center justify-center"
              >
                <Ionicons name="download" size={20} color="white" />
                <Text className="text-white font-medium ml-2">Save Report</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )
      }
    </SafeAreaView >
  );
}