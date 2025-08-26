import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, Alert } from "react-native";
import { MedicineReminder } from "../Store/slices/notificationSlice";

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export class NotificationService {
    private static instance: NotificationService;

    private constructor() {}

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    async requestPermissions(): Promise<boolean> {
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync(
                "medicine-reminders",
                {
                    name: "Medicine Reminders",
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: "#14B8A6",
                    sound: "reminder.wav",
                }
            );
        }

        if (!Device.isDevice) {
            Alert.alert("Must use physical device for Push Notifications");
            return false;
        }

        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            Alert.alert("Failed to get notification permissions!");
            return false;
        }

        return true;
    }

    private calculateScheduleDates(reminder: MedicineReminder): Date[] {
        const scheduleDates: Date[] = [];
        const startDate = new Date(reminder.startDate);
        const endDate = new Date(reminder.endDate);
        const now = new Date();

        // Parse time (HH:MM format)
        const [hours, minutes] = reminder.time.split(":").map(Number);

        let currentDate = new Date(
            Math.max(startDate.getTime(), now.getTime())
        );
        currentDate.setHours(hours, minutes, 0, 0);

        // If today's time has already passed, start from tomorrow
        if (currentDate.getTime() <= now.getTime()) {
            currentDate.setDate(currentDate.getDate() + 1);
        }

        let dayInterval = 1; // Default daily
        if (reminder.frequency === "alternate") {
            dayInterval = 2;
        } else if (reminder.frequency === "custom" && reminder.customInterval) {
            dayInterval = reminder.customInterval;
        }

        while (currentDate <= endDate) {
            scheduleDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + dayInterval);
        }

        return scheduleDates;
    }

    async scheduleReminderNotifications(
        reminder: MedicineReminder
    ): Promise<string[]> {
        try {
            const hasPermissions = await this.requestPermissions();
            if (!hasPermissions) return [];

            // Cancel existing notifications for this reminder
            if (reminder.notificationIds.length > 0) {
                await this.cancelReminderNotifications(
                    reminder.notificationIds
                );
            }

            const scheduleDates = this.calculateScheduleDates(reminder);
            const notificationIds: string[] = [];

            for (const date of scheduleDates) {
                const notificationId =
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: `💊 Medicine Reminder`,
                            body: `Time to take ${reminder.medicine.name} ${reminder.medicine.dosage ? `(${reminder.medicine.dosage})` : ''})\n${reminder.medicine.instructions}`,
                            data: {
                                reminderId: reminder.id,
                                medicine: reminder.medicine,
                                scheduledTime: date.toISOString(),
                                type: "medicine-reminder",
                            },
                            sound: true,
                            badge: 1,
                        },
                        trigger: {
                            type: Notifications.SchedulableTriggerInputTypes
                                .DATE,
                            date: date,
                        },
                    });

                notificationIds.push(notificationId);
            }

            console.log(
                `Scheduled ${notificationIds.length} notifications for ${reminder.medicine.name}`
            );
            return notificationIds;
        } catch (error) {
            console.error("Error scheduling notifications:", error);
            return [];
        }
    }

    async cancelReminderNotifications(
        notificationIds: string[]
    ): Promise<void> {
        try {
            for (const id of notificationIds) {
                await Notifications.cancelScheduledNotificationAsync(id);
            }
            console.log(`Cancelled ${notificationIds.length} notifications`);
        } catch (error) {
            console.error("Error cancelling notifications:", error);
        }
    }

    async cancelAllNotifications(): Promise<void> {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log("Cancelled all scheduled notifications");
        } catch (error) {
            console.error("Error cancelling all notifications:", error);
        }
    }

    async getScheduledNotifications(): Promise<
        Notifications.NotificationRequest[]
    > {
        try {
            const scheduled =
                await Notifications.getAllScheduledNotificationsAsync();
            return scheduled;
        } catch (error) {
            console.error("Error getting scheduled notifications:", error);
            return [];
        }
    }

    async rescheduleNotification(
        reminderId: string,
        originalTime: Date,
        newTime: Date
    ): Promise<string | null> {
        try {
            // Get reminder data (in real app, this would come from Redux store)
            const reminder = {
                /* get from store */
            };

            const notificationId =
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `💊 Rescheduled: Medicine Reminder`,
                        body: `Time to take your medicine (Rescheduled)`,
                        data: {
                            reminderId,
                            scheduledTime: newTime.toISOString(),
                            type: "medicine-reminder-rescheduled",
                            originalTime: originalTime.toISOString(),
                        },
                        sound: true,
                        badge: 1,
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: newTime,
                    },
                });

            return notificationId;
        } catch (error) {
            console.error("Error rescheduling notification:", error);
            return null;
        }
    }

    async scheduleSnoozeNotification(
        reminderId: string,
        snoozeDuration: number // minutes
    ): Promise<string | null> {
        try {
            const snoozeTime = new Date(
                Date.now() + snoozeDuration * 60 * 1000
            );

            const notificationId =
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `💊 Snoozed: Medicine Reminder`,
                        body: `Don't forget to take your medicine!`,
                        data: {
                            reminderId,
                            scheduledTime: snoozeTime.toISOString(),
                            type: "medicine-reminder-snooze",
                        },
                        sound: true,
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: snoozeTime,
                    },
                });

            return notificationId;
        } catch (error) {
            console.error("Error scheduling snooze notification:", error);
            return null;
        }
    }

    // Get today's reminders with status
    getTodaysReminders(
        reminders: MedicineReminder[],
        takenMedicines: any[]
    ): any[] {
        const today = new Date().toISOString().split("T")[0];
        const now = new Date();

        return reminders
            .filter((reminder) => reminder.isActive)
            .map((reminder) => {
                const [hours, minutes] = reminder.time.split(":").map(Number);
                const scheduledDateTime = new Date();
                scheduledDateTime.setHours(hours, minutes, 0, 0);

                // Check if medicine was taken today
                const takenToday = takenMedicines.find(
                    (taken) =>
                        taken.reminderId === reminder.id &&
                        taken.takenAt.startsWith(today)
                );

                let status: "taken" | "pending" | "missed" = "pending";

                if (takenToday) {
                    status = takenToday.status;
                } else if (scheduledDateTime < now) {
                    status = "missed";
                }

                return {
                    ...reminder,
                    status,
                    scheduledDateTime: scheduledDateTime.toISOString(),
                };
            })
            .sort((a, b) => a.time.localeCompare(b.time));
    }
}
