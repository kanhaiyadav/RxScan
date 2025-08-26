import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/Store/store";

export const useReminderStats = () => {
    const { reminders, takenMedicines } = useSelector(
        (state: RootState) => state.notifications
    );

    return useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        const now = new Date();

        // Get today's active reminders
        const todaysReminders = reminders.filter((reminder) => {
            if (!reminder.isActive) return false;

            const startDate = new Date(reminder.startDate);
            const endDate = new Date(reminder.endDate);
            const todayDate = new Date(today);

            return todayDate >= startDate && todayDate <= endDate;
        });

        // Calculate stats
        const totalToday = todaysReminders.length;
        const takenToday = takenMedicines.filter(
            (taken) =>
                taken.takenAt.startsWith(today) && taken.status === "taken"
        ).length;

        const skippedToday = takenMedicines.filter(
            (taken) =>
                taken.takenAt.startsWith(today) && taken.status === "skipped"
        ).length;

        // Calculate missed (scheduled time passed but not taken/skipped)
        const missedToday = todaysReminders.filter((reminder) => {
            const [hours, minutes] = reminder.time.split(":").map(Number);
            const scheduledTime = new Date();
            scheduledTime.setHours(hours, minutes, 0, 0);

            const wasTaken = takenMedicines.some(
                (taken) =>
                    taken.reminderId === reminder.id &&
                    taken.takenAt.startsWith(today)
            );

            return scheduledTime < now && !wasTaken;
        }).length;

        const pendingToday =
            totalToday - takenToday - skippedToday - missedToday;

        // Weekly stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weeklyTaken = takenMedicines.filter(
            (taken) =>
                new Date(taken.takenAt) >= weekAgo && taken.status === "taken"
        ).length;

        // Adherence rate (last 7 days)
        const weeklyTotal = reminders.reduce((total, reminder) => {
            if (!reminder.isActive) return total;

            const reminderStart = new Date(reminder.startDate);
            const reminderEnd = new Date(reminder.endDate);
            const checkStart = new Date(
                Math.max(weekAgo.getTime(), reminderStart.getTime())
            );
            const checkEnd = new Date(
                Math.min(new Date().getTime(), reminderEnd.getTime())
            );

            if (checkStart >= checkEnd) return total;

            const days = Math.ceil(
                (checkEnd.getTime() - checkStart.getTime()) /
                    (1000 * 60 * 60 * 24)
            );

            if (reminder.frequency === "daily") {
                return total + days;
            } else if (reminder.frequency === "alternate") {
                return total + Math.ceil(days / 2);
            } else if (
                reminder.frequency === "custom" &&
                reminder.customInterval
            ) {
                return total + Math.ceil(days / reminder.customInterval);
            }

            return total;
        }, 0);

        const adherenceRate =
            weeklyTotal > 0 ? Math.round((weeklyTaken / weeklyTotal) * 100) : 0;

        return {
            today: {
                total: totalToday,
                taken: takenToday,
                pending: pendingToday,
                missed: missedToday,
                skipped: skippedToday,
            },
            weekly: {
                taken: weeklyTaken,
                total: weeklyTotal,
                adherenceRate,
            },
            todaysReminders,
        };
    }, [reminders, takenMedicines]);
};
