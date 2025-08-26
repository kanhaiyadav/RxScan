import { MedicineInput } from "@/types/prescription";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MedicineReminder {
    id: string;
    medicine: MedicineInput;
    doctor: string;
    time: string; // HH:MM format
    frequency: "daily" | "alternate" | "custom"; // daily, every 2 days, custom interval
    customInterval?: number; // days interval for custom frequency
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    isActive: boolean;
    notificationIds: string[]; // Array of scheduled notification IDs
    createdAt: string;
    updatedAt: string;
}

export interface TakenMedicine {
    id: string;
    reminderId: string;
    takenAt: string; // ISO timestamp
    scheduledTime: string; // Original scheduled time
    status: "taken" | "skipped" | "missed";
    notes?: string;
}

export interface NotificationSettings {
    pushNotifications: boolean;
    soundAlerts: boolean;
    snoozeDuration: number; // minutes
    reminderAdvance: number; // minutes before scheduled time
}

interface NotificationState {
    reminders: MedicineReminder[];
    takenMedicines: TakenMedicine[];
    settings: NotificationSettings;
    loading: boolean;
    error: string | null;
}

const initialState: NotificationState = {
    reminders: [],
    takenMedicines: [],
    settings: {
        pushNotifications: true,
        soundAlerts: false,
        snoozeDuration: 5,
        reminderAdvance: 0,
    },
    loading: false,
    error: null,
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        addReminder: (
            state,
            action: PayloadAction<
                Omit<MedicineReminder, "id" | "createdAt" | "updatedAt">
            >
        ) => {
            const newReminder: MedicineReminder = {
                ...action.payload,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            state.reminders.push(newReminder);
        },

        updateReminder: (
            state,
            action: PayloadAction<Partial<MedicineReminder> & { id: string }>
        ) => {
            const index = state.reminders.findIndex(
                (r) => r.id === action.payload.id
            );
            if (index !== -1) {
                state.reminders[index] = {
                    ...state.reminders[index],
                    ...action.payload,
                    updatedAt: new Date().toISOString(),
                };
            }
        },

        deleteReminder: (state, action: PayloadAction<string>) => {
            state.reminders = state.reminders.filter(
                (r) => r.id !== action.payload
            );
        },

        toggleReminderActive: (state, action: PayloadAction<string>) => {
            const reminder = state.reminders.find(
                (r) => r.id === action.payload
            );
            if (reminder) {
                reminder.isActive = !reminder.isActive;
                reminder.updatedAt = new Date().toISOString();
            }
        },

        updateNotificationIds: (
            state,
            action: PayloadAction<{
                reminderId: string;
                notificationIds: string[];
            }>
        ) => {
            const reminder = state.reminders.find(
                (r) => r.id === action.payload.reminderId
            );
            if (reminder) {
                reminder.notificationIds = action.payload.notificationIds;
                reminder.updatedAt = new Date().toISOString();
            }
        },

        markMedicineTaken: (
            state,
            action: PayloadAction<{
                reminderId: string;
                scheduledTime: string;
                status: "taken" | "skipped";
                notes?: string;
            }>
        ) => {
            const takenMedicine: TakenMedicine = {
                id: Date.now().toString(),
                reminderId: action.payload.reminderId,
                takenAt: new Date().toISOString(),
                scheduledTime: action.payload.scheduledTime,
                status: action.payload.status,
                notes: action.payload.notes,
            };
            state.takenMedicines.push(takenMedicine);
        },

        markMedicineMissed: (
            state,
            action: PayloadAction<{ reminderId: string; scheduledTime: string }>
        ) => {
            const missedMedicine: TakenMedicine = {
                id: Date.now().toString(),
                reminderId: action.payload.reminderId,
                takenAt: new Date().toISOString(),
                scheduledTime: action.payload.scheduledTime,
                status: "missed",
            };
            state.takenMedicines.push(missedMedicine);
        },

        updateSettings: (
            state,
            action: PayloadAction<Partial<NotificationSettings>>
        ) => {
            state.settings = { ...state.settings, ...action.payload };
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },

        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminderActive,
    updateNotificationIds,
    markMedicineTaken,
    markMedicineMissed,
    updateSettings,
    setLoading,
    setError,
    clearError,
} = notificationSlice.actions;

export default notificationSlice.reducer;
