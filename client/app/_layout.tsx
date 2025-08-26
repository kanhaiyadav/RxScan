import "@/app/globals.css";
import "@/app/i18n"; // Import i18n configuration
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { AuthProvider } from "@/context/AuthContext";
import { UserHealthProvider } from "@/context/UserHealthContext";
import { Stack } from "expo-router";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store, persistor } from "@/Store/store";
import { PersistGate } from "redux-persist/integration/react";
import ModalManager from "@/components/modal/ModalManager";
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from "react";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

if (__DEV__) {
    import('../lib/reactotron').then(() => console.log('Reactotron Configured'))
}

const RootLayoutContent = () => {

    const { isDark, isLoading } = useTheme();

    useEffect(() => {
        NavigationBar.setVisibilityAsync("hidden");
    }, []);

    if (isLoading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-background-500'}`}>
                <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#000000'} />
            </View>
        );
    }

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
                            <GluestackUIProvider mode={isDark ? "dark" : "light"}>
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

export default function RootLayout() {
    return (
        <ThemeProvider>
            <RootLayoutContent />
        </ThemeProvider>
    );
}
