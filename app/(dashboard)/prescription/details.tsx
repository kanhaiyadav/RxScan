import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MedicineDisplay from '@/components/scan/Result';
import { useSelector } from 'react-redux';
import { selectPrescriptionById } from '@/Store/slices/prescriptionSlice';
import { RootState } from '@/Store/store';

export default function PrescriptionDetails() {

    const router = useRouter();
    const { prescriptionId } = useLocalSearchParams();
    const data = useSelector((state: RootState) => selectPrescriptionById(state, Array.isArray(prescriptionId) ? prescriptionId[0] : prescriptionId));

    return (
        <SafeAreaView className="flex-1">

            <StatusBar barStyle="dark-content" backgroundColor="#00ffc8" />

            {/* Header */}
            <LinearGradient
                colors={['#00ffc8', '#80f7ed']} // teal-500 to teal-600
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ elevation: 3 }}
                className='border-b border-gray-200'
            >
                <View className="px-6 py-4">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            className="mr-4 bg-white/20 w-10 h-10 rounded-full items-center justify-center"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={26} color="#1f2937" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-2xl font-bold text-gray-900">Prescription Details</Text>
                            <Text className="text-sm text-gray-600">View and manage your prescription details</Text>
                        </View>
                    </View>

                </View>
            </LinearGradient>
            <MedicineDisplay
                ocrResult={data.ocrResult}
                result={data.searchResult}
                loading={false}
            />

        </SafeAreaView>
    );
}