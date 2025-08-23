import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useMedicineSearch } from '@/hooks/useMedicineSearch';
import MedicineDisplay from '@/components/scan/Result';
import { dummyMedicineSearchResult } from '@/constants/staticData';
import Preview from '@/components/scan/Preview';
import Select from '@/components/scan/Select';
import { useHealthProfile } from '@/context/HealthProfileContext';
import { useUserHealth } from '@/context/UserHealthContext';
import appwriteService from '@/lib/appwrite';
import { ApiResponse, MedicineSearchResult, Prescription, PrescriptionData, SelectedImage } from '@/types/prescription';
import s3Service from '@/lib/AWSS3Service';
import { openModal } from '@/Store/slices/modalSlice';
import { useDispatch } from 'react-redux';
import { addPrescription } from '@/Store/slices/prescriptionSlice';


export default function EnhancedPrescriptionOCR() {
    const { healthProfile } = useUserHealth();
    const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
    const [ocrLoading, setOcrLoading] = useState<boolean>(false);
    const [ocrResult, setOcrResult] = useState<PrescriptionData | null>(null);
    const [ocrError, setOcrError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<'select' | 'preview' | 'results'>('select');
    const { searchMedicines, loading, error, reset } = useMedicineSearch(process.env.EXPO_PUBLIC_GEMINI_API_KEY as string);
    const [result, setResult] = useState<MedicineSearchResult | null>(dummyMedicineSearchResult);

    const dispatch = useDispatch();

    // Replace with your actual API base URL
    const API_BASE_URL = process.env.EXPO_PUBLIC_FLASK_API_URL;

    const parseRawResponse = (rawResponse: string): PrescriptionData | null => {
        try {
            const cleanedResponse = rawResponse.replace(/```json\s*|\s*```/g, '').trim();
            const parsedData = JSON.parse(cleanedResponse);
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
    };

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
                setCurrentStep('results');

                if (processedResult.medications) {
                    reset();
                    const res = await searchMedicines({ prescription_medications: processedResult.medications, health_profile: healthProfile });
                    console.log(JSON.stringify(res, null, 2));
                    setResult(res);
                }
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

    const savePrescription = async () => {

        if (!ocrResult) {
            dispatch(openModal({ name: "status", data: { type: "error" }, title: "No Result", description: "Please extract prescription data first" }));
            return;
        }

        if (!result) {
            dispatch(openModal({ name: "status", data: { type: "error" }, title: "No Search Result", description: "Please do search for prescription data first" }));
            return;
        }

        if (!selectedImage?.uri) {
            dispatch(openModal({ name: "status", data: { type: "error" }, title: "No Image", description: "Please select an image first" }));
            return;
        }

        const currentUser = await appwriteService.getCurrentUser();

        if (!currentUser) {
            dispatch(openModal({ name: "status", data: { type: "error" }, title: "error", description: "Please log in to save prescriptions" }));
            return;
        }
        
        try {

            const res = await s3Service.uploadViaBackend(selectedImage.uri, selectedImage.fileName);
            console.log('Upload result:', res);

            // Save prescription data to Appwrite with S3 URL
            const doc = await appwriteService.createPrescription(currentUser.$id, ocrResult, result, res.fileUrl || "", res.key || "");
            //@ts-ignore
            dispatch(addPrescription({
                ...doc,
                ocrResult: ocrResult,
                searchResult: result,
            } as Prescription));

            dispatch(openModal({ name: "status", data: { type: "success" }, title: "Success", description: "Prescription saved successfully!" }));
            resetResults();
            setCurrentStep('select');
        } catch (error) {
            dispatch(openModal({ name: "status", data: { type: "error" }, title: "Upload Failed", description: `Failed to upload prescription: ${error instanceof Error ? JSON.stringify(error.message) : 'Unknown error'}` }));
            console.error('Upload error:', error);
        }
    }


    const resetToStart = () => {
        reset();
        setSelectedImage(null);
        setOcrResult(null);
        setOcrError(null);
        setCurrentStep('select');
    };

    const isLoading = ocrLoading;

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
                                <Ionicons name="arrow-back" size={26} color="#1f2937" />
                            </TouchableOpacity>
                        )}
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-gray-900">
                                {currentStep === 'select' ? 'Scan Prescription' :
                                    currentStep === 'preview' ? 'Review & Analyze' : 'Analysis Results'}
                            </Text>
                            <Text className="text-gray-700">
                                {currentStep === 'select' ? 'Upload your prescription to analyze medicines' :
                                    currentStep === 'preview' ? 'Confirm your image and start analysis' : 'Prescription analysis with drug interactions'}
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <View className="flex-1">
                {/* Selection Screen */}
                {currentStep === 'select' && (
                    <Select handleScanAction={handleScanAction} />
                )}

                {/* Preview Screen */}
                {currentStep === 'preview' && selectedImage && (
                    <Preview
                        selectedImage={selectedImage}
                        isLoading={isLoading}
                        extractPrescription={extractPrescription}
                        ocrError={ocrError}
                        ocrLoading={ocrLoading}
                        setCurrentStep={setCurrentStep}
                    />
                )}

                {/* Results Screen */}
                {currentStep === 'results' && ocrResult && result && (
                    <MedicineDisplay ocrResult={ocrResult} result={result} resetToStart={resetToStart} loading={loading} savePrescription={savePrescription} />
                )}

            </View>

        </SafeAreaView >
    );
}