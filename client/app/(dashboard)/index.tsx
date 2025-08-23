import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as NavigationBar from 'expo-navigation-bar';
import { persistor } from "../../Store/store"
import { useSelector } from 'react-redux';
import { selectActivePrescription, selectAllPrescriptions } from '@/Store/slices/prescriptionSlice';
import { useRouter } from 'expo-router';

export default function HomeScreen() {

    const router = useRouter();

    const activePrescriptions = useSelector(selectActivePrescription);
    const prescriptions = useSelector(selectAllPrescriptions);
    const [stats, setStats] = React.useState<{
        totalPrescriptions: number;
        activeCount: number;
        warnings: number;
        meds: number;
    }>({
        totalPrescriptions: 0,
        activeCount: 0,
        warnings: 0,
        meds: 0
    });

    const reminders = [
        {
            id: 2,
            medicine: 'Paracetamol 650mg',
            time: '02:00 PM',
            status: 'pending',
            frequency: 'After lunch',
            color: 'bg-blue-500',
            doctor: 'Dr. Sarah Johnson'
        },
        {
            id: 3,
            medicine: 'Metformin 500mg',
            time: '08:00 PM',
            status: 'pending',
            frequency: 'After dinner',
            color: 'bg-purple-500',
            doctor: 'Dr. Michael Chen'
        }
    ];
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'taken':
                return { icon: 'checkmark-circle', color: '#10B981' };
            case 'pending':
                return { icon: 'time', color: '#F59E0B' };
            case 'missed':
                return { icon: 'close-circle', color: '#EF4444' };
            default:
                return { icon: 'time', color: '#6B7280' };
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'taken':
                return 'Taken';
            case 'pending':
                return 'Pending';
            case 'missed':
                return 'Missed';
            default:
                return 'Unknown';
        }
    };

    useEffect(() => {
        // Calculate health stats based on prescriptions
        const totalPrescriptions = prescriptions?.length;
        const activeCount = activePrescriptions?.length;
        const warnings = activePrescriptions?.reduce((acc, prescription) => {
            return acc + prescription.searchResult.medicines?.reduce((medAcc, medicine) => {
                return medAcc + medicine.medicalInfo.healthProfileInteraction.interactions?.length
            }, 0)
        }, 0)
        const meds = activePrescriptions?.reduce((acc, prescription) => {
            return acc + prescription.searchResult.medicines?.length
        }, 0)

        setStats({
            totalPrescriptions,
            activeCount,
            warnings,
            meds
        });
    }, [prescriptions, activePrescriptions]);

    const quickActions = [
        {
            id: 1,
            title: 'Scan Prescription',
            subtitle: 'Upload & analyze prescription',
            icon: 'camera',
            color: 'bg-teal-500',
            route: '/scan'
        },
        {
            id: 2,
            title: 'View Prescriptions',
            subtitle: 'See your prescription history',
            icon: 'document-text',
            color: 'bg-blue-500',
            route: '/prescriptions'
        },
        {
            id: 3,
            title: 'Medicine Reminders',
            subtitle: 'Set medication alerts',
            icon: 'alarm',
            color: 'bg-purple-500',
            route: '/reminders'
        },
        {
            id: 4,
            title: 'Health Profile',
            subtitle: 'Update your health info',
            icon: 'person',
            color: 'bg-green-500',
            route: '/profile'
        }
    ];

    const recentAlerts = [
        {
            id: 1,
            type: 'warning',
            title: 'Drug Interaction Alert',
            message: 'Avoid alcohol with your current medication',
            time: '2 hours ago'
        },
        {
            id: 2,
            type: 'info',
            title: 'Prescription Scanned',
            message: 'Successfully analyzed your prescription',
            time: '1 day ago'
        }
    ];

    useEffect(() => {
        NavigationBar.setVisibilityAsync("hidden"); // or 'light'
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#00ffc8" />

            {/* Header */}
            <LinearGradient
                colors={['#00ffc8', '#80f7ed']} // teal-500 to teal-600
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ elevation: 3 }}
                className='border-b border-gray-200'
            >
                <View className="bg-transparent px-6 py-4 ">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-2xl font-bold text-gray-900">Welcome back!</Text>
                            <Text className="text-gray-600 mt-1">Let&apos;s keep you healthy today</Text>
                        </View>
                        <TouchableOpacity className="bg-white p-3 rounded-full elevation-sm">
                            <Ionicons name="notifications" size={24} color="#14B8A6" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Health Stats Card */}
                <View className="mx-6 bg-transparent py-3 pb-4">
                    <Text className="text-lg font-bold text-gray-600 mb-4">Health Summary</Text>
                    <View className="flex-row justify-between gap-4">
                        <View className="items-center flex-1 bg-white py-4 elevation rounded-xl">
                            <View className="bg-teal-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                                <Ionicons name="document-text" size={24} color="#14B8A6" />
                            </View>
                            <Text className="text-2xl font-bold text-gray-900">{stats.totalPrescriptions}</Text>
                            <Text className="text-gray-500 text-sm">Prescriptions</Text>
                        </View>
                        <View className="items-center flex-1 bg-white py-4 elevation rounded-xl">
                            <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                                <Ionicons name="medical" size={24} color="#3B82F6" />
                            </View>
                            <Text className="text-2xl font-bold text-gray-900">{stats.meds}</Text>
                            <Text className="text-gray-500 text-sm">Active Meds</Text>
                        </View>
                        <View className="items-center flex-1 bg-white py-4 elevation rounded-xl">
                            <View className="bg-orange-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                                <Ionicons name="warning" size={24} color="#F97316" />
                            </View>
                            <Text className="text-2xl font-bold text-gray-900">{stats.warnings}</Text>
                            <Text className="text-gray-500 text-sm">Warnings</Text>
                        </View>
                    </View>
                </View>

                {/* Active Perscriptions */}
                {
                    activePrescriptions.length > 0 &&
                    <View className="mx-6 mt-2">
                            <View className='flex-row w-full justify-between items-center'>
                                <Text className="text-lg font-bold text-gray-600 mb-2 mt-2">Active Prescriptions</Text>
                                <TouchableOpacity onPress={() => {
                                    router.push('/(dashboard)/prescription');
                                }} className='flex-row items-center'>
                                    <Text className='font-bold text-teal-600 text-lg'>more</Text>
                                    <Ionicons name="chevron-forward" size={16} color="teal" className='mb-[-3px] ml-1' />
                                </TouchableOpacity>
                            </View>
                        <View className="flex-col w-full gap-2">
                            {activePrescriptions.map((prescription) => (
                                <TouchableOpacity
                                    key={prescription.$id}
                                    className="w-full bg-white rounded-xl p-2 border border-gray-100 elevation-sm flex-row gap-2 items-center"
                                    onPress={() => {
                                        router.push({
                                            pathname: '/(dashboard)/prescription/details',
                                            params: { prescriptionId: prescription.$id }
                                        })
                                    }}
                                >
                                    <Image source={{ uri: prescription.image }} className='w-[64px] h-[64px] rounded-md' />
                                    <View className='h-full'>
                                        <Text className="text-gray-900 font-semibold text-base">{prescription.ocrResult.doctor?.name || prescription.ocrResult.doctor?.clinic_name}</Text>
                                        <View className='flex-row gap-3'>
                                            <Text className="text-gray-500 text-sm mt-1">{prescription.ocrResult.patient?.prescription_date || prescription.$createdAt.split('T')[0]}</Text>
                                            <Text className="text-gray-500 text-sm mt-1">{prescription.ocrResult.medications?.length} medications</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={24} color="#6B7280" className="ml-auto" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                }

                <View className="mx-6">
                    <View className='flex-row w-full justify-between items-center'>
                        <Text className="text-lg font-bold text-gray-600 mb-2 mt-6">Upcoming Reminders</Text>
                        <TouchableOpacity onPress={() => {
                            router.push('/(dashboard)/reminder');
                        }} className='flex-row items-center mb-[-10px]'>
                            <Text className='font-bold text-teal-600 text-lg'>more</Text>
                            <Ionicons name="chevron-forward" size={16} color="teal" className='mb-[-3px] ml-1' />
                        </TouchableOpacity>
                    </View>

                    {reminders.map((reminder) => {
                        const statusInfo = getStatusIcon(reminder.status);
                        return (
                            <View
                                key={reminder.id}
                                className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-200"
                            >
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-row items-center flex-1">
                                        <View className={`${reminder.color} w-4 h-12 rounded-full mr-4`} />
                                        <View className="flex-1">
                                            <Text className="text-lg font-semibold text-gray-900">
                                                {reminder.medicine}
                                            </Text>
                                            <Text className="text-gray-500 text-sm">
                                                {reminder.frequency} • {reminder.doctor}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-xl font-bold text-gray-900">
                                            {reminder.time}
                                        </Text>
                                        <View className="flex-row items-center mt-1">
                                            <Ionicons
                                                name={statusInfo.icon as any}
                                                size={16}
                                                color={statusInfo.color}
                                            />
                                            <Text className="text-sm ml-1" style={{ color: statusInfo.color }}>
                                                {getStatusText(reminder.status)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Actions */}
                                {reminder.status === 'pending' && (
                                    <View className="flex-row gap-3 mt-4">
                                        <TouchableOpacity className="flex-1 bg-gray-100 py-3 px-4 rounded-xl flex-row items-center justify-center elevation-sm">
                                            <Ionicons name="time-outline" size={16} color="#6B7280" />
                                            <Text className="text-gray-600 font-medium ml-2">Skip</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="flex-1 bg-teal-500 py-3 px-4 rounded-xl flex-row items-center justify-center elevation-sm">
                                            <Ionicons name="checkmark" size={16} color="white" />
                                            <Text className="text-white font-medium ml-2">Mark as Taken</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {reminder.status === 'missed' && (
                                    <View className="flex-row gap-3 mt-4">
                                        <TouchableOpacity className="flex-1 bg-red-50 py-3 px-4 rounded-xl flex-row items-center justify-center">
                                            <Ionicons name="refresh" size={16} color="#EF4444" />
                                            <Text className="text-red-600 font-medium ml-2">Reschedule</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="flex-1 bg-teal-500 py-3 px-4 rounded-xl flex-row items-center justify-center">
                                            <Ionicons name="checkmark" size={16} color="white" />
                                            <Text className="text-white font-medium ml-2">Take Now</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Quick Actions */}
                <View className="mx-6 mt-8">
                    <Text className="text-lg font-bold text-gray-600 mb-4">Quick Actions</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {quickActions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                className="bg-white rounded-2xl p-4 w-[48%] mb-4 border border-gray-100 elevation-sm"
                                onPress={() => {
                                    persistor.purge();
                                }}
                            >
                                <View className={`${action.color} w-12 h-12 rounded-xl items-center justify-center mb-3`}>
                                    <Ionicons name={action.icon as any} size={24} color="white" />
                                </View>
                                <Text className="text-gray-900 font-semibold text-base">{action.title}</Text>
                                <Text className="text-gray-500 text-sm mt-1">{action.subtitle}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}