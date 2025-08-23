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
                    animation: "ios_from_right",
                }}
            />
            <Stack.Screen
                name="details"
                options={{
                    headerShown: false,
                    animation: "ios_from_right",
                }}
            />
        </Stack>
    )
}

export default PrescriptionLayout;