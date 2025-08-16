import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    TextInput,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import appwriteService from '@/lib/appwrite';
import { MedicineSearchResult, PrescriptionData } from '@/types/prescription';
import LottieView from 'lottie-react-native';
import searchingPrescriptionsAnimation from '@/assets/lottie/searching_prescriptions.json';
import notFoundAnimation from '@/assets/lottie/not_found.json';
import { useRouter } from 'expo-router';

interface Prescription {
    $id: string;
    image: string;
    key: string;
    ocrResult: PrescriptionData;
    searchResult: MedicineSearchResult;
    createdAt: string;
    updatedAt: string;
}

export default function PrescriptionsScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    const filters = ['All', 'Recent', 'Active', 'Completed'];

    const router = useRouter();


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Completed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    useEffect(() => {
        (async () => {
            const currentUser = await appwriteService.getCurrentUser();
            if (currentUser) {
                const res = await appwriteService.getPrescriptions(currentUser.$id);
                setLoading(false);
                //@ts-ignore
                setPrescriptions(res)
                // setPrescriptions(res);
            }
        })();
    }, [])

    const getWarning = (prescription: Prescription) => {
        return prescription.searchResult.medicines.reduce((acc, medicine) => {
            return acc + medicine.medicalInfo.healthProfileInteraction.interactions.length;
        }, 0);
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
                className='border-b border-gray-200'
            >
                <View className="px-6 py-4">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-2xl font-bold text-gray-900">Prescriptions</Text>
                        <TouchableOpacity className="bg-white p-3 rounded-full elevation-sm">
                            <Ionicons name="add" size={24} color="#14B8A6" />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View className="mt-4 bg-gray-50 rounded-xl flex-row items-center px-4 py-3 elevation">
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-3 text-gray-900"
                            placeholder="Search prescriptions..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>
            </LinearGradient>

            {/* Filter Tabs */}
            <View className="bg-white px-6 py-4 border-b border-black/15">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2 pb-1">
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                className={`px-4 py-2 rounded-full elevation-sm ${activeFilter === filter
                                    ? 'bg-teal-500'
                                    : 'bg-gray-100'
                                    }`}
                                onPress={() => setActiveFilter(filter)}
                            >
                                <Text className={`font-medium ${activeFilter === filter
                                    ? 'text-white'
                                    : 'text-gray-600'
                                    }`}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {loading ? (
                <View className='w-full flex-1 items-center bg-white'>
                    <LottieView
                        source={searchingPrescriptionsAnimation}
                        autoPlay
                        loop
                        style={{ width: 350, height: 300 }}
                    />
                </View>
            ) : prescriptions.length === 0 ? (
                <View className='w-full flex-1 items-center bg-white'>
                    <LottieView
                        source={notFoundAnimation}
                        autoPlay
                        loop={false}
                        style={{ width: 250, height: 300 }}
                    />
                </View>
            ) :
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="mx-6 mt-6">
                        {prescriptions.map((prescription) => (
                            <View
                                key={prescription.$id}
                                className="bg-white p-5 mb-4 overflow-hidden"
                                style={{ borderRadius: 16, elevation: 1 }}
                            >
                                <TouchableOpacity activeOpacity={0.7}>
                                    <Image
                                        source={{ uri: prescription.image }}
                                        className="w-full h-40 rounded-lg mb-4"
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                                {/* Header */}
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-gray-900">
                                            {prescription.ocrResult.doctor?.name || prescription.ocrResult.doctor?.clinic_name}
                                        </Text>
                                        {
                                            prescription.ocrResult.doctor?.name &&
                                            <Text className="text-gray-500 text-sm mt-1">
                                                {prescription.ocrResult.doctor?.clinic_name}
                                            </Text>
                                        }
                                    </View>
                                    <View className={`px-3 py-1 rounded-full ${getStatusColor('Active')}`}>
                                        <Text className="text-xs font-medium">{'Active'}</Text>
                                    </View>
                                </View>

                                {/* Date and Warnings */}
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className="flex-row items-center">
                                        <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                                        <Text className="text-gray-500 ml-2">{prescription.ocrResult.patient?.prescription_date || prescription.createdAt}</Text>
                                    </View>
                                    {prescription.searchResult.overallHealthAnalysis.riskLevel && (
                                        <View className="flex-row items-center bg-orange-50 px-3 py-1 rounded-full">
                                            <Ionicons name="warning" size={14} color="#F97316" />
                                            <Text className="text-orange-600 text-xs ml-1 font-medium">
                                                {getWarning(prescription)} warnings
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Medicines */}
                                <View className="bg-gray-50 rounded-xl p-3">
                                    <Text className="text-gray-700 font-medium mb-2">Medicines:</Text>
                                    {prescription.ocrResult.medications?.map((medicine, index) => (
                                        <View key={index} className="flex-row items-center mb-1">
                                            <View className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2" />
                                            <Text className="text-gray-600 text-sm">{medicine.name}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Actions */}
                                <View className="flex-row mt-4 gap-3">
                                    <TouchableOpacity className="flex-1 bg-teal-50 py-3 px-4 rounded-xl flex-row items-center justify-center"
                                        onPress={() => router.push(`/prescription/details`)}
                                    >
                                        <Ionicons name="eye-outline" size={16} color="#14B8A6" />
                                        <Text className="text-teal-600 font-medium ml-2">View Details</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity className="bg-gray-100 py-3 px-4 rounded-xl">
                                        <Ionicons name="share-outline" size={16} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                    <View className="h-20" />
                </ScrollView>
            }


        </SafeAreaView>
    );
}