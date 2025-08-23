import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
    ScrollView,
    Platform
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        // Modern approach - use these instead of deprecated shouldShowAlert
        shouldShowBanner: true,   // Shows notification banner at top of screen
        shouldShowList: true,     // Shows notification in notification list/center
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

interface ScheduledNotification {
    id: string;
    title: string;
    body: string;
    trigger: Date;
}

const LocalNotificationsDemo: React.FC = () => {
    const [expoPushToken, setExpoPushToken] = useState<string>('');
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);

    // Form inputs
    const [notificationTitle, setNotificationTitle] = useState<string>('Test Notification');
    const [notificationBody, setNotificationBody] = useState<string>('This is a test notification!');
    const [secondsDelay, setSecondsDelay] = useState<string>('5');

    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                setExpoPushToken(token);
            }
        });

        // Listener for notifications received while app is running
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
            console.log('Notification received:', notification);
        });

        // Listener for when user taps on notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification response:', response);
            Alert.alert('Notification Tapped!', `You tapped: ${response.notification.request.content.title}`);
        });

        // Load scheduled notifications
        loadScheduledNotifications();

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    const registerForPushNotificationsAsync = async (): Promise<string | null> => {
        let token = null;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                Alert.alert('Failed to get push token for push notification!');
                return null;
            }

            try {
                token = await Notifications.getExpoPushTokenAsync({
                    projectId: 'your-project-id', // Replace with your actual project ID
                });
                console.log('Expo Push Token:', token.data);
                return token.data;
            } catch (error) {
                console.log('Error getting push token:', error);
                return null;
            }
        } else {
            Alert.alert('Must use physical device for Push Notifications');
            return null;
        }
    };

    const scheduleNotification = async (): Promise<void> => {
        try {
            const delay = parseInt(secondsDelay) || 5;
            const triggerDate = new Date(Date.now() + delay * 1000);

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: notificationTitle,
                    body: notificationBody,
                    data: { customData: 'some data here' },
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: delay, // First notification in 10 seconds
                    repeats: true,
                },
            });

            console.log('Scheduled notification with ID:', notificationId);

            // Add to our local list
            const newNotification: ScheduledNotification = {
                id: notificationId,
                title: notificationTitle,
                body: notificationBody,
                trigger: triggerDate,
            };

            setScheduledNotifications(prev => [...prev, newNotification]);

            Alert.alert(
                'Notification Scheduled!',
                `Will appear in ${delay} seconds\nID: ${notificationId}`
            );
        } catch (error) {
            console.error('Error scheduling notification:', error);
            Alert.alert('Error', 'Failed to schedule notification');
        }
    };

    const scheduleRepeatingNotification = async (): Promise<void> => {
        try {
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Daily Reminder',
                    body: 'This is your daily notification!',
                    data: { type: 'daily-reminder' },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: 10, // First notification in 10 seconds
                    repeats: true,
                },
            });

            console.log('Scheduled repeating notification:', notificationId);
            Alert.alert('Repeating Notification Scheduled!', `ID: ${notificationId}`);
        } catch (error) {
            console.error('Error scheduling repeating notification:', error);
        }
    };

    const sendImmediateNotification = async (): Promise<void> => {
        try {
            // Use scheduleNotificationAsync with immediate trigger instead of presentNotificationAsync
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Immediate Notification',
                    body: 'This notification appears right now!',
                    data: { immediate: true },
                    sound: true,
                },
                trigger: null, // null trigger means immediate
            });
        } catch (error) {
            console.error('Error sending immediate notification:', error);
        }
    };

    const loadScheduledNotifications = async (): Promise<void> => {
        try {
            const scheduled = await Notifications.getAllScheduledNotificationsAsync();
            console.log('All scheduled notifications:', scheduled);

            const mappedNotifications: ScheduledNotification[] = scheduled.map(notif => ({
                id: notif.identifier,
                title: notif.content.title || 'No title',
                body: notif.content.body || 'No body',
                trigger: notif.trigger && 'date' in notif.trigger
                    ? new Date(notif.trigger.date as number)
                    : new Date(),
            }));

            setScheduledNotifications(mappedNotifications);
        } catch (error) {
            console.error('Error loading scheduled notifications:', error);
        }
    };

    const cancelNotification = async (notificationId: string): Promise<void> => {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            setScheduledNotifications(prev =>
                prev.filter(notif => notif.id !== notificationId)
            );
            Alert.alert('Cancelled', 'Notification cancelled successfully');
        } catch (error) {
            console.error('Error cancelling notification:', error);
        }
    };

    const cancelAllNotifications = async (): Promise<void> => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            setScheduledNotifications([]);
            Alert.alert('All Cancelled', 'All scheduled notifications cancelled');
        } catch (error) {
            console.error('Error cancelling all notifications:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Local Notifications Demo</Text>

            {expoPushToken && (
                <View style={styles.tokenContainer}>
                    <Text style={styles.tokenLabel}>Expo Push Token:</Text>
                    <Text style={styles.tokenText}>{expoPushToken.slice(0, 20)}...</Text>
                </View>
            )}

            <View style={styles.form}>
                <Text style={styles.sectionTitle}>Create Notification</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Notification Title"
                    value={notificationTitle}
                    onChangeText={setNotificationTitle}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Notification Body"
                    value={notificationBody}
                    onChangeText={setNotificationBody}
                    multiline
                />

                <TextInput
                    style={styles.input}
                    placeholder="Seconds delay"
                    value={secondsDelay}
                    onChangeText={setSecondsDelay}
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={scheduleNotification}>
                    <Text style={styles.buttonText}>Schedule Notification</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={sendImmediateNotification}>
                    <Text style={styles.buttonText}>Send Immediate</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={scheduleRepeatingNotification}>
                    <Text style={styles.buttonText}>Schedule Repeating</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.dangerButton]}
                    onPress={cancelAllNotifications}
                >
                    <Text style={styles.buttonText}>Cancel All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.scheduledSection}>
                <Text style={styles.sectionTitle}>Scheduled Notifications ({scheduledNotifications.length})</Text>

                <TouchableOpacity style={styles.refreshButton} onPress={loadScheduledNotifications}>
                    <Text style={styles.refreshButtonText}>Refresh List</Text>
                </TouchableOpacity>

                {scheduledNotifications.map((notif) => (
                    <View key={notif.id} style={styles.notificationItem}>
                        <View style={styles.notificationContent}>
                            <Text style={styles.notificationTitle}>{notif.title}</Text>
                            <Text style={styles.notificationBody}>{notif.body}</Text>
                            <Text style={styles.notificationTime}>
                                {notif.trigger.toLocaleString()}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => cancelNotification(notif.id)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            {notification && (
                <View style={styles.lastNotification}>
                    <Text style={styles.sectionTitle}>Last Received:</Text>
                    <Text>Title: {notification.request.content.title}</Text>
                    <Text>Body: {notification.request.content.body}</Text>
                    <Text>Data: {JSON.stringify(notification.request.content.data)}</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    tokenContainer: {
        backgroundColor: '#e3f2fd',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
    },
    tokenLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    tokenText: {
        fontSize: 14,
        fontFamily: 'monospace',
    },
    form: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 20,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        fontSize: 16,
    },
    buttonContainer: {
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#2196f3',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    dangerButton: {
        backgroundColor: '#f44336',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    scheduledSection: {
        marginTop: 20,
    },
    refreshButton: {
        backgroundColor: '#4caf50',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 15,
    },
    refreshButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    notificationItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    notificationBody: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    notificationTime: {
        fontSize: 12,
        color: '#999',
    },
    cancelButton: {
        backgroundColor: '#ff5722',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6,
    },
    cancelButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    lastNotification: {
        backgroundColor: '#fff3e0',
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
    },
});

export default LocalNotificationsDemo;