// store/storeExpo.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import prescriptionSlice from "./slices/prescriptionSlice"

// Check if we're in Expo development environment
const isExpoDev = __DEV__ && typeof window !== "undefined";

// Redux DevTools Extension configuration
const reduxDevToolsExtension =
    isExpoDev && (window as any).__REDUX_DEVTOOLS_EXTENSION__;

const persistConfig = {
    key: "root",
    storage: AsyncStorage,
    whitelist: [],
};

const prescriptionPersistConfig = {
    key: "prescription",
    storage: AsyncStorage,
    blacklist: ["isLoading", "error"],
};

const rootReducer = combineReducers({
    prescription: persistReducer(prescriptionPersistConfig, prescriptionSlice),
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }),
    devTools: reduxDevToolsExtension
        ? {
              name: "MyApp (Expo)",
              trace: true,
              traceLimit: 25,
          }
        : false,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Development helpers
if (__DEV__) {
    // Make store accessible globally for debugging
    (global as any).store = store;

    // Log store changes in development
    store.subscribe(() => {
        if (console.group) {
            console.group("Redux State Changed");
            console.log("Current State:", store.getState());
            console.groupEnd();
        }
    });
}
