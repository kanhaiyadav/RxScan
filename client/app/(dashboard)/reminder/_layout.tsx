import { Stack } from "expo-router";
import React from 'react';


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
                    title: 'Reminders',
                    animation: "ios_from_right",
                }}
            />
            <Stack.Screen
                name="new"
                options={{
                    headerShown: false,
                    title: 'New Reminder',
                    animation: "ios_from_right",
                }}
            />
        </Stack>
    )
}

export default PrescriptionLayout;