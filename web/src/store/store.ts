import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import healthProfileReducer from "./slices/healthProfileSlice";
import prescriptionsReducer from "./slices/prescriptionsSlice";
import remindersReducer from "./slices/remindersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    healthProfile: healthProfileReducer,
    prescriptions: prescriptionsReducer,
    reminders: remindersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
