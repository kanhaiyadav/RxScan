import "@/app/globals.css";
import "@/app/i18n"; // Import i18n configuration
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { AuthProvider } from "@/context/AuthContext";
import { UserHealthProvider } from "@/context/UserHealthContext";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store, persistor } from "@/Store/store";
import { PersistGate } from "redux-persist/integration/react";
import ModalManager from "@/components/modal/ModalManager";

if (__DEV__) {
    import('../lib/reactotron').then(() => console.log('Reactotron Configured'))
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <UserHealthProvider>
                            <StatusBar
                                barStyle="dark-content"
                                backgroundColor="transparent"
                                hidden={true}
                            // translucent={true}
                            />
                            <GluestackUIProvider mode="light">
                                <Stack initialRouteName="index">
                                    <Stack.Screen
                                        name="index"
                                        options={{
                                            headerShown: false,
                                            // Hide this screen from stack navigation
                                            presentation: 'transparentModal'
                                        }}
                                    />
                                    <Stack.Screen
                                        name="(welcome)"
                                        options={{
                                            headerShown: false,
                                            animation: "ios_from_right",
                                        }}
                                    />
                                    <Stack.Screen
                                        name="(auth)"
                                        options={{
                                            headerShown: false,
                                            animation: "ios_from_right",
                                        }}
                                    />
                                    <Stack.Screen
                                        name="(dashboard)"
                                        options={{
                                            headerShown: false,
                                            animation: "fade",
                                        }}
                                    />
                                    <Stack.Screen
                                        name="(onboarding)"
                                        options={{
                                            headerShown: false,
                                            animation: "ios_from_right",
                                        }}
                                    />
                                </Stack>
                                <ModalManager />
                            </GluestackUIProvider>
                        </UserHealthProvider>
                    </PersistGate>
                </Provider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}