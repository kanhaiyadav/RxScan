import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { addReminder, updateNotificationIds } from '../../../Store/slices/notificationSlice';
import { NotificationService } from '@/lib/notificationService';
import { useRouter } from 'expo-router';
import SelectCustom from '@/components/Select';
import { MedicineInput, Prescription } from '@/types/prescription';
import { SelectItem } from '@/components/ui/select';
import { selectActivePrescription } from '@/Store/slices/prescriptionSlice';
import { LinearGradient } from 'expo-linear-gradient';

const FREQUENCY_OPTIONS = [
    { value: 'daily', label: 'Daily', description: 'Every day' },
    { value: 'alternate', label: 'Alternate Days', description: 'Every 2 days' },
    { value: 'custom', label: 'Custom Interval', description: 'Custom days' },
];

export default function AddReminderForm() {
    const dispatch = useDispatch();
    const notificationService = NotificationService.getInstance();

    // Form state
    const [medicine, setMedicine] = useState<MedicineInput | null>(null);
    const [frequency, setFrequency] = useState<'daily' | 'alternate' | 'custom'>('daily');
    const [prescription, setPrescription] = useState<Prescription | null>(null);
    const [customInterval, setCustomInterval] = useState('1');

    // Time picker state
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Date picker state
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 30); // Default 30 days
        return date;
    });
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const activePrescriptions = useSelector(selectActivePrescription);

    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const resetForm = () => {
        setMedicine(null);
        setFrequency('daily');
        setCustomInterval('1');
        setSelectedTime(new Date());
        setStartDate(new Date());
        const defaultEndDate = new Date();
        defaultEndDate.setDate(defaultEndDate.getDate() + 30);
        setEndDate(defaultEndDate);
    };

    const handleSubmit = async () => {
        // Validation
        if (!medicine) {
            Alert.alert('Error', 'Please select a medicine');
            return;
        }
        if (endDate <= startDate) {
            Alert.alert('Error', 'End date must be after start date');
            return;
        }

        setLoading(true);

        try {
            const reminderData = {
                medicine: medicine,
                doctor: prescription?.ocrResult?.doctor?.name || prescription?.ocrResult.doctor?.clinic_name || 'Unknown Doctor',
                time: selectedTime.toTimeString().slice(0, 5), // HH:MM format
                frequency: frequency,
                customInterval: frequency === 'custom' ? parseInt(customInterval) : undefined,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                isActive: true,
                notificationIds: [],
            };

            // Add to Redux store first
            dispatch(addReminder(reminderData));
            const newReminderId = Date.now().toString();

            // Schedule notifications
            const notificationIds = await notificationService.scheduleReminderNotifications({
                ...reminderData,
                id: newReminderId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            // Update notification IDs in store
            dispatch(updateNotificationIds({
                reminderId: newReminderId,
                notificationIds
            }));

            Alert.alert(
                'Success!',
                `Reminder created for ${medicine?.name}. ${notificationIds.length} notifications scheduled.`,
                [{
                    text: 'OK', onPress: () => {
                        resetForm();
                        router.back();
                    }
                }]
            );

        } catch (error) {
            console.error('Error creating reminder:', error);
            Alert.alert('Error', 'Failed to create reminder. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <ScrollView>
            <View className="flex-1 bg-gray-50">
                {/* Header */}
                <LinearGradient
                    colors={['#00ffc8', '#80f7ed']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className='p-4 flex-row items-center gap-4 border-b-1 border-gray-200'
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                    >
                        <Ionicons name='arrow-back' size={24} />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-2xl font-bold text-typography-900">
                            Create Reminder
                        </Text>
                        <Text className="text-base text-typography-600">
                            Set a reminder for your medication
                        </Text>
                    </View>
                </LinearGradient>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="p-6">
                        {/* Medicine Information */}
                        <Text className="text-lg font-semibold text-typography-900 mb-2">Medicine Information</Text>
                        <View className="bg-background-0 rounded-2xl p-5 mb-4 shadow-sm border border-gray-200">


                            <View className="mb-4">
                                <Text className="text-typography-700 font-medium mb-2">Prescription*</Text>
                                <SelectCustom
                                    selectedValue={prescription ? `${prescription?.ocrResult.doctor?.name || prescription?.ocrResult.doctor?.clinic_name || ""} (${prescription.ocrResult.patient?.name || ""}) - ${prescription.ocrResult.patient?.prescription_date || prescription.$createdAt}` : "Select a prescription"}
                                    onValueChange={(value) => {
                                        const selectedPrescription = activePrescriptions.find(p => p.$id === value);
                                        setPrescription(selectedPrescription || null);
                                    }}
                                    isDisabled={loading}
                                    placeholder="Select Medicine"
                                >
                                    {activePrescriptions.map((prescription) => (
                                        <SelectItem key={prescription.$id} value={prescription.$id} label={`${prescription?.ocrResult.doctor?.name || prescription?.ocrResult.doctor?.clinic_name || ""} (${prescription.ocrResult.patient?.name || ""}) - ${prescription.ocrResult.patient?.prescription_date || prescription.$createdAt}`} />
                                    ))}
                                </SelectCustom>

                            </View>

                            <View className="mb-4">
                                <Text className="text-typography-700 font-medium mb-2">Medicine*</Text>
                                <SelectCustom
                                    selectedValue={medicine ? `${medicine?.name} (${medicine?.dosage})` : "Select Medicine"}
                                    onValueChange={(value) => {
                                        setMedicine(prescription?.ocrResult.medications?.find(med => med.name === value) || null);
                                    }}
                                    isDisabled={loading || !prescription}
                                    placeholder="Select Medicine"
                                >
                                    {prescription?.ocrResult.medications?.map((medication) => (
                                        <SelectItem key={medication.name} value={medication.name} label={`${medication.name} ${medication.dosage ? `(${medication.dosage})` : ''}`} />
                                    ))}
                                </SelectCustom>
                            </View>
                        </View>

                        {/* Schedule Settings */}
                        <Text className="text-lg font-semibold text-typography-900 mb-2">Schedule Settings</Text>
                        <View className="bg-background-0 rounded-2xl p-5 mb-4 shadow-sm border border-gray-200">

                            {/* Time Selection */}
                            <View className="mb-4">
                                <Text className="text-typography-700 font-medium mb-2">Reminder Time</Text>
                                <TouchableOpacity
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Text className="text-typography-900 text-base">{formatTime(selectedTime)}</Text>
                                    <Ionicons name="time-outline" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            {/* Frequency Selection */}
                            <View className="mb-4">
                                <Text className="text-typography-700 font-medium mb-3">Frequency</Text>
                                {FREQUENCY_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        className={`border rounded-xl p-4 mb-2 ${frequency === option.value
                                            ? 'border-teal-500 bg-teal-50'
                                            : 'border-gray-200 bg-gray-50'
                                            }`}
                                        onPress={() => setFrequency(option.value as any)}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View>
                                                <Text className="text-typography-900 font-medium">{option.label}</Text>
                                                <Text className="text-typography-500 text-sm">{option.description}</Text>
                                            </View>
                                            {frequency === option.value && (
                                                <Ionicons name="checkmark-circle" size={20} color="#14B8A6" />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Custom Interval Input */}
                            {frequency === 'custom' && (
                                <View className="mb-4">
                                    <Text className="text-typography-700 font-medium mb-2">Every X Days</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-typography-900"
                                        placeholder="Enter number of days"
                                        value={customInterval}
                                        onChangeText={setCustomInterval}
                                        keyboardType="numeric"
                                    />
                                </View>
                            )}

                            {/* Date Range */}
                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <Text className="text-typography-700 font-medium mb-2">Start Date</Text>
                                    <TouchableOpacity
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                                        onPress={() => setShowStartDatePicker(true)}
                                    >
                                        <Text className="text-typography-900 text-sm">{formatDate(startDate)}</Text>
                                        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-1">
                                    <Text className="text-typography-700 font-medium mb-2">End Date</Text>
                                    <TouchableOpacity
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                                        onPress={() => setShowEndDatePicker(true)}
                                    >
                                        <Text className="text-typography-900 text-sm">{formatDate(endDate)}</Text>
                                        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Action Buttons */}
                <View className="bg-background-0 border-t border-gray-200 p-6">
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 bg-gray-100 py-4 px-6 rounded-xl"
                            onPress={() => {
                                resetForm();
                                router.back();
                            }}
                        >
                            <Text className="text-typography-600 font-semibold text-center">Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`flex-1 py-4 px-6 rounded-xl ${loading ? 'bg-gray-400' : 'bg-teal-500'}`}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text className="text-white font-semibold text-center">
                                {loading ? 'Creating...' : 'Create Reminder'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date/Time Pickers */}
                {showTimePicker && (
                    <DateTimePicker
                        value={selectedTime}
                        mode="time"
                        is24Hour={false}
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowTimePicker(Platform.OS === 'ios');
                            if (selectedDate) {
                                setSelectedTime(selectedDate);
                            }
                        }}
                    />
                )}

                {showStartDatePicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                            setShowStartDatePicker(Platform.OS === 'ios');
                            if (selectedDate) {
                                setStartDate(selectedDate);
                                // Ensure end date is after start date
                                if (selectedDate >= endDate) {
                                    const newEndDate = new Date(selectedDate);
                                    newEndDate.setDate(newEndDate.getDate() + 7);
                                    setEndDate(newEndDate);
                                }
                            }
                        }}
                    />
                )}

                {showEndDatePicker && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display="default"
                        minimumDate={startDate}
                        onChange={(event, selectedDate) => {
                            setShowEndDatePicker(Platform.OS === 'ios');
                            if (selectedDate) {
                                setEndDate(selectedDate);
                            }
                        }}
                    />
                )}
            </View>
        </ScrollView>
    );
}