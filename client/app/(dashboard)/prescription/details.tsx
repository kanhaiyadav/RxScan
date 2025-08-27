import MedicineDisplay from '@/components/scan/Result';
import { selectPrescriptionById } from '@/Store/slices/prescriptionSlice';
import { RootState } from '@/Store/store';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    SafeAreaView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';

export default function PrescriptionDetails() {
    const { t } = useTranslation();
    const router = useRouter();
    const { prescriptionId } = useLocalSearchParams();
    const data = useSelector((state: RootState) => selectPrescriptionById(state, Array.isArray(prescriptionId) ? prescriptionId[0] : prescriptionId));

    const moveTotts = () => {
        router.push({
            pathname: '/(dashboard)/prescription/tts',
            params: { prescriptionId: prescriptionId }
        });
    }

    return (
        <SafeAreaView className="flex-1">

            <StatusBar barStyle="dark-content" backgroundColor="#00ffc8" />

            {/* Header */}
            <LinearGradient
                colors={['#00ffc8', '#80f7ed']} // teal-500 to teal-600
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ elevation: 3 }}
                className="border-b border-gray-200 dark:border-outline-0"
            >
                <View className="px-6 py-4">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            className="mr-4 w-10 h-10 rounded-full items-center justify-center"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={26} color="#1f2937" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-2xl font-bold text-gray-900">{t('prescription.details.title')}</Text>
                            <Text className="text-sm text-gray-500">{t('prescription.details.subtitle')}</Text>
                        </View>
                        <TouchableOpacity
                            className="ml-auto h-[50px] w-[50px] bg-background-0 rounded-full items-center justify-center elevation"
                            onPress={moveTotts}
                        >
                            <Ionicons name="volume-high" size={26} color="teal" />
                        </TouchableOpacity>
                    </View>

                </View>
            </LinearGradient>
            <MedicineDisplay
                ocrResult={data.ocrResult}
                result={data.searchResult}
                loading={false}
                prescriptionId={Array.isArray(prescriptionId) ? prescriptionId[0] : prescriptionId}
            />

        </SafeAreaView>
    );
}