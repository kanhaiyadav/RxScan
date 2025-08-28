import { Stack } from "expo-router";
import React from 'react';
import { useTranslation } from 'react-i18next';


const PrescriptionLayout = () => {
    const { t } = useTranslation();

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
                    title: t('prescription.screens.index'),
                    animation: "ios_from_right",
                }}
            />
        </Stack>
    )
}

export default PrescriptionLayout;