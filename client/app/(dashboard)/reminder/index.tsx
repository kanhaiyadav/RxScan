import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Switch,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import * as Notifications from 'expo-notifications';

import { NotificationService } from '@/lib/notificationService';
import {
    updateSettings,
    markMedicineTaken,
    markMedicineMissed,
    toggleReminderActive,
    updateNotificationIds,
    deleteReminder,
} from '../../../Store/slices/notificationSlice';
import { useRouter } from 'expo-router';

// Types for Redux state (adjust based on your store structure)
interface RootState {
    notifications: {
        reminders: any[];
        takenMedicines: any[];
        settings: any;
        loading: boolean;
        error: string | null;
    };
}

export default function RemindersScreen() {
    const dispatch = useDispatch();
    const { reminders, takenMedicines, settings, loading } = useSelector(
        (state: RootState) => state.notifications
    );

    const [activeTab, setActiveTab] = useState('Today');
    const [refreshing, setRefreshing] = useState(false);
    const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);

    const notificationService = NotificationService.getInstance();
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    const router = useRouter();

    const tabs = ['Today', 'Upcoming', 'All'];

    useEffect(() => {
        // Initialize notification service
        initializeNotifications();

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    const initializeNotifications = async () => {
        try {
            await notificationService.requestPermissions();

            // Listen for notifications when app is running
            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                setLastNotification(notification);
                console.log('Notification received:', notification);
            });

            // Listen for notification taps
            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                const notificationData = response.notification.request.content.data as any;

                if (notificationData?.type === 'medicine-reminder') {
                    handleNotificationTap(notificationData);
                }
            });

        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    };

    const handleNotificationTap = (data: any) => {
        Alert.alert(
            'Medicine Reminder',
            `Time to take ${data.medicineName} (${data.dosage})`,
            [
                { text: 'Skip', onPress: () => handleSkipMedicine(data.reminderId, data.scheduledTime) },
                { text: 'Snooze', onPress: () => handleSnoozeMedicine(data.reminderId) },
                { text: 'Mark as Taken', onPress: () => handleTakeMedicine(data.reminderId, data.scheduledTime) },
            ]
        );
    };

    const getTodaysReminders = () => {
        return notificationService.getTodaysReminders(reminders, takenMedicines);
    };

    const getUpcomingReminders = () => {
        const today = new Date().toISOString().split('T')[0];
        return reminders.filter(reminder =>
            reminder.isActive &&
            new Date(reminder.endDate) > new Date() &&
            reminder.startDate > today
        );
    };

    const getAllReminders = () => {
        return reminders.filter(reminder => reminder.isActive);
    };

    const getFilteredReminders = () => {
        switch (activeTab) {
            case 'Today':
                return getTodaysReminders();
            case 'Upcoming':
                return getUpcomingReminders();
            case 'All':
                return getAllReminders();
            default:
                return getTodaysReminders();
        }
    };

    const handleTakeMedicine = async (reminderId: string, scheduledTime: string) => {
        dispatch(markMedicineTaken({
            reminderId,
            scheduledTime,
            status: 'taken',
        }));
        Alert.alert('Success', 'Medicine marked as taken!');
    };

    const handleSkipMedicine = async (reminderId: string, scheduledTime: string) => {
        dispatch(markMedicineTaken({
            reminderId,
            scheduledTime,
            status: 'skipped',
        }));
        Alert.alert('Skipped', 'Medicine marked as skipped');
    };

    const handleSnoozeMedicine = async (reminderId: string) => {
        const notificationId = await notificationService.scheduleSnoozeNotification(
            reminderId,
            settings.snoozeDuration
        );

        if (notificationId) {
            Alert.alert('Snoozed', `Reminder snoozed for ${settings.snoozeDuration} minutes`);
        }
    };

    const handleToggleReminder = async (reminderId: string) => {
        const reminder = reminders.find(r => r.id === reminderId);
        if (!reminder) return;

        if (reminder.isActive) {
            // Deactivating - cancel notifications
            await notificationService.cancelReminderNotifications(reminder.notificationIds);
            dispatch(updateNotificationIds({ reminderId, notificationIds: [] }));
        } else {
            // Activating - schedule notifications
            const notificationIds = await notificationService.scheduleReminderNotifications(reminder);
            dispatch(updateNotificationIds({ reminderId, notificationIds }));
        }

        dispatch(toggleReminderActive(reminderId));
    };

    const handleDeleteReminder = async (reminderId: string) => {
        const reminder = reminders.find(r => r.id === reminderId);
        if (!reminder) return;

        Alert.alert(
            'Delete Reminder',
            `Are you sure you want to delete the reminder for ${reminder.medicineName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        // Cancel all notifications for this reminder
                        await notificationService.cancelReminderNotifications(reminder.notificationIds);
                        dispatch(deleteReminder(reminderId));
                        Alert.alert('Deleted', 'Reminder deleted successfully');
                    },
                },
            ]
        );
    };

    const handleRescheduleReminder = async (reminderId: string) => {
        // This would typically open a modal to select new time
        Alert.alert('Reschedule', 'Reschedule functionality - would open time picker');
    };

    const onRefresh = async () => {
        setRefreshing(true);
        // Refresh notification status and sync with system
        try {
            const scheduledNotifications = await notificationService.getScheduledNotifications();
            console.log('Current scheduled notifications:', scheduledNotifications.length);
        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'taken':
                return { icon: 'checkmark-circle', color: '#10B981' };
            case 'pending':
                return { icon: 'time', color: '#F59E0B' };
            case 'missed':
                return { icon: 'close-circle', color: '#EF4444' };
            case 'skipped':
                return { icon: 'remove-circle', color: '#6B7280' };
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
            case 'skipped':
                return 'Skipped';
            default:
                return 'Unknown';
        }
    };

    const filteredReminders = getFilteredReminders();
    const todaysReminders = getTodaysReminders();
    const takenToday = todaysReminders.filter(r => r.status === 'taken').length;
    const pendingToday = todaysReminders.filter(r => r.status === 'pending').length;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#00ffc8" />

            {/* Header */}
            <LinearGradient
                colors={['#00ffc8', '#80f7ed']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ elevation: 3 }}
                className="border-b border-gray-200"
            >
                <View className="px-6 py-4">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-2xl font-bold text-typography-900">Medicine Reminders</Text>
                            <Text className="text-typography-600">Stay on top of your medications</Text>
                        </View>
                        <TouchableOpacity
                            className="bg-background-0 p-3 rounded-full elevation"
                            onPress={() => {
                                router.push('/reminder/new');
                            }}
                        >
                            <Ionicons name="add" size={24} color="#14B8A6" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            {/* Stats Cards */}
            <View className="flex-row mx-6 mt-6 gap-4">
                <View className="flex-1 bg-background-0 rounded-2xl p-4 shadow-sm border border-gray-100">
                    <View className="flex-row items-center">
                        <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center">
                            <Ionicons name="checkmark" size={20} color="#10B981" />
                        </View>
                        <View className="ml-3">
                            <Text className="text-2xl font-bold text-typography-900">{takenToday}</Text>
                            <Text className="text-typography-500 text-sm">Taken Today</Text>
                        </View>
                    </View>
                </View>

                <View className="flex-1 bg-background-0 rounded-2xl p-4 shadow-sm border border-gray-100">
                    <View className="flex-row items-center">
                        <View className="bg-orange-100 w-10 h-10 rounded-full items-center justify-center">
                            <Ionicons name="time" size={20} color="#F59E0B" />
                        </View>
                        <View className="ml-3">
                            <Text className="text-2xl font-bold text-typography-900">{pendingToday}</Text>
                            <Text className="text-typography-500 text-sm">Pending</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Filter Tabs */}
            <View className="bg-background-0 mx-6 mt-6 rounded-2xl p-1 shadow-sm border border-gray-100">
                <View className="flex-row">
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            className={`flex-1 py-3 px-4 rounded-xl ${activeTab === tab ? 'bg-teal-500' : 'bg-transparent'
                                }`}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text className={`text-center font-medium ${activeTab === tab ? 'text-white' : 'text-typography-600'
                                }`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Reminders List */}
            <ScrollView
                className="flex-1 mt-6"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View className="mx-6">
                    {filteredReminders.length === 0 ? (
                        <View className="bg-background-0 rounded-2xl p-8 items-center">
                            <Ionicons name="medical-outline" size={48} color="#9CA3AF" />
                            <Text className="text-typography-500 text-center mt-4">
                                {activeTab === 'Today'
                                    ? 'No reminders for today'
                                    : `No ${activeTab.toLowerCase()} reminders`}
                            </Text>
                            <TouchableOpacity
                                className="bg-teal-500 px-6 py-3 rounded-xl mt-4"
                                onPress={() => { router.push('/reminder/new'); }}
                            >
                                <Text className="text-white font-medium">Add First Reminder</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        filteredReminders.map((reminder) => {
                            const statusInfo = getStatusIcon(reminder.status);
                            const isToday = activeTab === 'Today';

                            return (
                                <View
                                    key={reminder.id}
                                    className="bg-background-0 rounded-2xl p-5 mb-4 shadow-sm border border-gray-200"
                                >
                                    <View className="flex-row items-center justify-between mb-3">
                                        <View className="flex-row items-center flex-1">
                                            <View className="flex-1">
                                                <Text className="text-lg font-semibold text-typography-900">
                                                    {reminder.medicine.name}
                                                </Text>
                                                <Text className="text-typography-500 text-sm">
                                                    {reminder.medicine.instructions} • {reminder.doctor}
                                                </Text>
                                                {!isToday && (
                                                    <Text className="text-typography-400 text-xs mt-1">
                                                        {reminder.frequency === 'daily' ? 'Daily' :
                                                            reminder.frequency === 'alternate' ? 'Every 2 days' :
                                                                `Every ${reminder.customInterval} days`} •
                                                        Until {new Date(reminder.endDate).toLocaleDateString()}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>

                                        <View className="items-end">
                                            <Text className="text-xl font-bold text-typography-900">
                                                {reminder.time}
                                            </Text>
                                            {isToday && (
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
                                            )}
                                        </View>
                                    </View>

                                    {/* Action Buttons for Today's reminders */}
                                    {isToday && reminder.status === 'pending' && (
                                        <View className="flex-row gap-3 mt-4">
                                            <TouchableOpacity
                                                className="flex-1 bg-gray-100 py-3 px-4 rounded-xl flex-row items-center justify-center"
                                                onPress={() => handleSkipMedicine(reminder.id, reminder.scheduledDateTime)}
                                            >
                                                <Ionicons name="close-outline" size={16} color="#6B7280" />
                                                <Text className="text-typography-600 font-medium ml-2">Skip</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                className="flex-1 bg-orange-100 py-3 px-4 rounded-xl flex-row items-center justify-center"
                                                onPress={() => handleSnoozeMedicine(reminder.id)}
                                            >
                                                <Ionicons name="time-outline" size={16} color="#F59E0B" />
                                                <Text className="text-orange-600 font-medium ml-2">Snooze</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                className="flex-1 bg-teal-500 py-3 px-4 rounded-xl flex-row items-center justify-center"
                                                onPress={() => handleTakeMedicine(reminder.id, reminder.scheduledDateTime)}
                                            >
                                                <Ionicons name="checkmark" size={16} color="white" />
                                                <Text className="text-white font-medium ml-2">Taken</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {/* Action Buttons for missed reminders */}
                                    {isToday && reminder.status === 'missed' && (
                                        <View className="flex-row gap-3 mt-4">
                                            <TouchableOpacity
                                                className="flex-1 bg-red-50 py-3 px-4 rounded-xl flex-row items-center justify-center"
                                                onPress={() => handleRescheduleReminder(reminder.id)}
                                            >
                                                <Ionicons name="refresh" size={16} color="#EF4444" />
                                                <Text className="text-red-600 font-medium ml-2">Reschedule</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                className="flex-1 bg-teal-500 py-3 px-4 rounded-xl flex-row items-center justify-center"
                                                onPress={() => handleTakeMedicine(reminder.id, new Date().toISOString())}
                                            >
                                                <Ionicons name="checkmark" size={16} color="white" />
                                                <Text className="text-white font-medium ml-2">Take Now</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {/* Management Actions for All/Upcoming tabs */}
                                    {!isToday && (
                                        <View className="flex-row gap-3 mt-4">
                                            <TouchableOpacity
                                                className="flex-1 bg-gray-100 py-3 px-4 rounded-xl flex-row items-center justify-center"
                                                onPress={() => handleToggleReminder(reminder.id)}
                                            >
                                                <Ionicons
                                                    name={reminder.isActive ? "pause" : "play"}
                                                    size={16}
                                                    color="#6B7280"
                                                />
                                                <Text className="text-typography-600 font-medium ml-2">
                                                    {reminder.isActive ? 'Pause' : 'Resume'}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                className="flex-1 bg-red-50 py-3 px-4 rounded-xl flex-row items-center justify-center"
                                                onPress={() => handleDeleteReminder(reminder.id)}
                                            >
                                                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                                <Text className="text-red-600 font-medium ml-2">Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {/* Active indicator */}
                                    <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                        <Text className="text-typography-500 text-sm">
                                            {reminder.isActive ? 'Active' : 'Paused'} •
                                            {reminder.notificationIds.length} notifications scheduled
                                        </Text>
                                        <Switch
                                            value={reminder.isActive}
                                            onValueChange={() => handleToggleReminder(reminder.id)}
                                            trackColor={{ false: '#E5E7EB', true: '#14B8A6' }}
                                            thumbColor="#FFFFFF"
                                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                                        />
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                {/* Settings Section */}
                <View className="mx-6 mt-6 mb-8">
                    <Text className="text-lg font-semibold text-typography-900 mb-4">Notification Settings</Text>

                    <View className="bg-background-0 rounded-2xl shadow-sm border border-gray-200">
                        <View className="p-5 border-b border-gray-200">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text className="text-typography-900 font-medium">Push Notifications</Text>
                                    <Text className="text-typography-500 text-sm mt-1">
                                        Get notified when it&apos;s time to take medicine
                                    </Text>
                                </View>
                                <Switch
                                    value={settings.pushNotifications}
                                    onValueChange={(value) => { dispatch(updateSettings({ pushNotifications: value })); }}
                                    trackColor={{ false: '#E5E7EB', true: '#14B8A6' }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>
                        </View>

                        <View className="p-5 border-b border-gray-200">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text className="text-typography-900 font-medium">Sound Alerts</Text>
                                    <Text className="text-typography-500 text-sm mt-1">Play sound with notifications</Text>
                                </View>
                                <Switch
                                    value={settings.soundAlerts}
                                    onValueChange={(value) => { dispatch(updateSettings({ soundAlerts: value })); }}
                                    trackColor={{ false: '#E5E7EB', true: '#14B8A6' }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>
                        </View>

                        <TouchableOpacity className="p-5 flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="text-typography-900 font-medium">Snooze Duration</Text>
                                <Text className="text-typography-500 text-sm mt-1">{settings.snoozeDuration} minutes</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Last Notification Debug Info */}
                {lastNotification && __DEV__ && (
                    <View className="mx-6 mb-8 bg-blue-50 rounded-2xl p-4 border border-blue-200">
                        <Text className="text-blue-900 font-medium mb-2">Last Notification (Debug)</Text>
                        <Text className="text-blue-700 text-sm">
                            {lastNotification.request.content.title}
                        </Text>
                        <Text className="text-blue-600 text-xs mt-1">
                            {lastNotification.request.content.body}
                        </Text>
                    </View>
                )}
            </ScrollView>

        </SafeAreaView>
    );
}