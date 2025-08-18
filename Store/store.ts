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
import modalSlice from "./slices/modalSlice";
import reactotron from "../lib/reactotron";

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
    modal: modalSlice
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const createEnhancers = (getDefaultEnhancers:any) => {
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
