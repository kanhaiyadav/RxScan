import { Pre } from "@expo/html-elements";
import { Stack } from "expo-router";
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



const PrescriptionLayout = () => {

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: 'transparent'
                }
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    animation: "ios_from_right",
                }}
            />
            <Stack.Screen
                name="details"
                options={{
                    headerShown: true,
                    animation: "ios_from_right",
                }}
            />
        </Stack>
    )
}

export default PrescriptionLayout;