import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
    FLUSH,
    PAUSE,
    PERSIST,
    persistReducer,
    persistStore,
    PURGE,
    REGISTER,
    REHYDRATE,
} from "redux-persist";

import reactotron from "../lib/reactotron";
import modalSlice from "./slices/modalSlice";
import prescriptionSlice from "./slices/prescriptionSlice";
import healthProfileSlice from "./slices/healthProfileSlice";

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

const healthProfilePersistConfig = {
    key: "healthProfile",
    storage: AsyncStorage,
    blacklist: ["isLoading", "error"],
};

const rootReducer = combineReducers({
    prescription: persistReducer(prescriptionPersistConfig, prescriptionSlice),
    modal: modalSlice,
    healthProfile: persistReducer(healthProfilePersistConfig, healthProfileSlice),
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const createEnhancers = (getDefaultEnhancers: any) => {
    if (__DEV__) {
        return getDefaultEnhancers().concat(reactotron.createEnhancer());
    } else {
        return getDefaultEnhancers();
    }
};

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
    enhancers: createEnhancers,
    devTools: __DEV__,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
