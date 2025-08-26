import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { RootState } from "@/Store/store";
import {
    markMedicineMissed,
    markMedicineTaken,
    updateNotificationIds,
} from "../Store/slices/notificationSlice";
import { NotificationService } from "@/lib/notificationService";

export const useNotifications = () => {
    const dispatch = useDispatch();
    const { reminders, settings } = useSelector(
        (state: RootState) => state.notifications
    );
    const notificationService = NotificationService.getInstance();

    const notificationListener = useRef<Notifications.EventSubscription | null>(
        null
    );
    const responseListener = useRef<Notifications.EventSubscription | null>(
        null
    );

    useEffect(() => {
        if (!settings.pushNotifications) return;

        // Set up notification listeners
        notificationListener.current =
            Notifications.addNotificationReceivedListener((notification) => {
                console.log("Notification received:", notification);
            });

        responseListener.current =
            Notifications.addNotificationResponseReceivedListener(
                (response) => {
                    const data = response.notification.request.content
                        .data as any;

                    if (data?.type === "medicine-reminder") {
                        handleMedicineReminderTap(data);
                    }
                }
            );

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, [settings.pushNotifications]);

    const handleMedicineReminderTap = (data: any) => {
        const reminder = reminders.find((r) => r.id === data.reminderId);
        if (!reminder) return;

        Alert.alert(
            "💊 Medicine Reminder",
            `Time to take ${data.medicineName} (${data.dosage})\n\n${data.instructions}`,
            [
                {
                    text: "Skip",
                    style: "cancel",
                    onPress: () => {
                        dispatch(
                            markMedicineTaken({
                                reminderId: data.reminderId,
                                scheduledTime: data.scheduledTime,
                                status: "skipped",
                            })
                        );
                    },
                },
                {
                    text: `Snooze (${settings.snoozeDuration}m)`,
                    onPress: () => {
                        notificationService.scheduleSnoozeNotification(
                            data.reminderId,
                            settings.snoozeDuration
                        );
                    },
                },
                {
                    text: "Mark as Taken",
                    onPress: () => {
                        dispatch(
                            markMedicineTaken({
                                reminderId: data.reminderId,
                                scheduledTime: data.scheduledTime,
                                status: "taken",
                            })
                        );
                    },
                },
            ]
        );
    };

    return {
        scheduleReminder:
            notificationService.scheduleReminderNotifications.bind(
                notificationService
            ),
        cancelReminder:
            notificationService.cancelReminderNotifications.bind(
                notificationService
            ),
        cancelAllNotifications:
            notificationService.cancelAllNotifications.bind(
                notificationService
            ),
        getScheduledNotifications:
            notificationService.getScheduledNotifications.bind(
                notificationService
            ),
    };
};
