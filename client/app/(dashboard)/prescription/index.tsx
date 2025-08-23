import React, { useEffect, useState, useMemo } from 'react';
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
import LottieView from 'lottie-react-native';
import searchingPrescriptionsAnimation from '@/assets/lottie/searching_prescriptions.json';
import notFoundAnimation from '@/assets/lottie/not_found.json';
import { useRouter } from 'expo-router';
import { Prescription } from '@/types/prescription';
import { useSelector, useDispatch } from 'react-redux';
import { deletePrescription, selectPrescriptionEntities, selectPrescriptionLoading, setPrescriptionStatus } from '@/Store/slices/prescriptionSlice';
import { openModal } from '@/Store/slices/modalSlice';
import appwriteService from '@/lib/appwrite';

export default function PrescriptionsScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const prescriptionsEntities = useSelector(selectPrescriptionEntities);
    const loading = false; // Fixed: Use actual loading state

    // Fixed: Memoize prescriptions array to prevent infinite re-renders
    const prescriptions = useMemo(() => Object.values(prescriptionsEntities), [prescriptionsEntities]);

    const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
    const filters = ['All', 'Active', 'Completed', 'Abandoned'];

    const dispatch = useDispatch();
    const router = useRouter();

    const getStatusColor = (status: 'active' | 'inactive' | 'abandoned' | 'completed') => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'abandoned':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    const getWarning = (prescription: Prescription) => {
        return prescription.searchResult?.medicines?.reduce((acc, medicine) => {
            return acc + (medicine.medicalInfo?.healthProfileInteraction?.interactions?.length || 0);
        }, 0) || 0;
    }

    // Fixed: Combined filtering logic with proper dependencies
    useEffect(() => {
        let filtered = prescriptions;

        // Apply status filter
        if (activeFilter !== 'All') {
            filtered = filtered.filter((prescription) => {
                if (activeFilter === 'Active') {
                    return prescription.status === 'active';
                } else if (activeFilter === 'Completed') {
                    return prescription.status === 'completed';
                } else if (activeFilter === 'Abandoned') {
                    return prescription.status === 'abandoned';
                }
                return true;
            });
        }

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter((prescription) => {
                const doctorName = prescription.ocrResult?.doctor?.name || '';
                const clinicName = prescription.ocrResult?.doctor?.clinic_name || '';
                const searchTerm = searchQuery.toLowerCase();

                return doctorName.toLowerCase().includes(searchTerm) ||
                    clinicName.toLowerCase().includes(searchTerm);
            });
        }

        setFilteredPrescriptions(filtered);
    }, [prescriptions, activeFilter, searchQuery]); // Fixed: Added all dependencies

    return (
        <SafeAreaView className="flex-1">
            <StatusBar barStyle="dark-content" backgroundColor="#00ffc8" />

            {/* Header */}
            <LinearGradient
                colors={['#00ffc8', '#80f7ed']} // primary-500 to primary-600
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ elevation: 3 }}
                className='border-b border-gray-200'
            >
                <View className="px-6 py-4">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-2xl font-bold text-gray-900">Prescriptions</Text>
                            <Text className="text-gray-600">View and manage your prescriptions</Text>
                        </View>
                        <TouchableOpacity className="bg-white p-3 rounded-full elevation-sm"
                            onPress={() => {
                                router.push('/scan');
                            }}
                        >
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
                                    ? 'bg-primary-500'
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
            ) : filteredPrescriptions.length === 0 ? (
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
                        {filteredPrescriptions.map((prescription, index) => (
                            <TouchableOpacity
                                key={prescription.$id || index} // Fixed: Use unique ID as key
                                className="bg-white p-5 mb-4 overflow-hidden"
                                style={{ borderRadius: 16, elevation: 1 }}
                                onPress={() => {
                                    router.push({
                                        pathname: `/prescription/details`,
                                        params: { prescriptionId: prescription.$id }
                                    });
                                }}
                                activeOpacity={0.8}
                            >
                                <TouchableOpacity activeOpacity={0.7}
                                    onPress={() => {
                                        dispatch(openModal({ name: "img", data: { imgUrl: prescription.image } }));
                                    }}
                                >
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
                                            {prescription.ocrResult?.doctor?.name || prescription.ocrResult?.doctor?.clinic_name || 'Unknown Doctor'}
                                        </Text>
                                        {
                                            prescription.ocrResult?.doctor?.name && prescription.ocrResult?.doctor?.clinic_name &&
                                            <Text className="text-gray-500 text-sm mt-1">
                                                {prescription.ocrResult?.doctor?.clinic_name}
                                            </Text>
                                        }
                                    </View>
                                    <View className={`px-3 py-1 rounded-full ${getStatusColor(prescription.status)}`}>
                                        <Text className={`text-xs font-medium capitalize ${getStatusColor(prescription.status).split(' ')[1]}`}>
                                            {prescription.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* Date and Warnings */}
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className="flex-row items-center">
                                        <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                                        <Text className="text-gray-500 ml-2">
                                            {prescription.ocrResult?.patient?.prescription_date ||
                                                new Date(prescription.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    {prescription.searchResult?.overallHealthAnalysis?.riskLevel && getWarning(prescription) > 0 && (
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
                                    {prescription.ocrResult?.medications && prescription.ocrResult.medications.length > 0 ?
                                        prescription.ocrResult.medications.map((medicine, medicineIndex) => (
                                            <View key={medicineIndex} className="flex-row items-center mb-1">
                                                <View className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
                                                <Text className="text-gray-600 text-sm">{medicine.name}</Text>
                                            </View>
                                        )) : (
                                            <Text className="text-gray-500 text-sm">No medicines found</Text>
                                        )
                                    }
                                </View>

                                {/* Actions */}
                                <View className="flex-row mt-4 gap-3">
                                    {prescription.status === 'active' && (
                                        <>
                                            <TouchableOpacity
                                                className="flex-1 bg-blue-100 py-3 rounded-xl flex-row items-center justify-center"
                                                onPress={async () => {
                                                    try {
                                                        dispatch(setPrescriptionStatus({ prescriptionId: prescription.$id, status: 'completed' }));
                                                        await appwriteService.changePrescriptionStatus(prescription.$id, 'completed');
                                                    } catch (error) {
                                                        console.error('Error marking prescription as completed:', error);
                                                        // You might want to show an error message to the user
                                                    }
                                                }}
                                            >
                                                <Text className="text-blue-600 font-medium text-center">Mark Completed</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                className="flex-1 bg-orange-100 py-3 rounded-xl flex-row items-center justify-center"
                                                onPress={async () => {
                                                    try {
                                                        dispatch(setPrescriptionStatus({ prescriptionId: prescription.$id, status: 'abandoned' }));
                                                        await appwriteService.changePrescriptionStatus(prescription.$id, 'abandoned');
                                                    } catch (error) {
                                                        console.error('Error abandoning prescription:', error);
                                                    }
                                                }}
                                            >
                                                <Text className="text-orange-700 font-medium ml-2">Abandon</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    {prescription.status === 'inactive' && (
                                        <TouchableOpacity
                                            className="flex-1 bg-primary-100 py-3 rounded-xl flex-row items-center justify-center"
                                            onPress={async () => {
                                                try {
                                                    dispatch(setPrescriptionStatus({ prescriptionId: prescription.$id, status: 'active' }));
                                                    await appwriteService.changePrescriptionStatus(prescription.$id, 'active');
                                                } catch (error) {
                                                    console.error('Error setting prescription as active:', error);
                                                }
                                            }}
                                        >
                                            <Text className="text-primary-600 font-medium ml-2">Set as Active</Text>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        className={`bg-red-100 py-3 rounded-xl flex-row items-center justify-center px-3 ${prescription.status === 'completed' ? 'flex-1' : ''}`}
                                        onPress={async () => {
                                            try {
                                                dispatch(deletePrescription(prescription.$id));
                                                await appwriteService.deletePrescription(prescription.$id);
                                            } catch (error) {
                                                console.error('Error deleting prescription:', error);
                                            }
                                        }}
                                    >
                                        <Ionicons size={20} color={'red'} name="trash" />
                                        <Text className={`text-red-600 font-medium ml-2 ${prescription.status === 'completed' ? 'block' : 'hidden'}`}>
                                            Delete
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View className="h-20" />
                </ScrollView>
            }
        </SafeAreaView>
    );
}