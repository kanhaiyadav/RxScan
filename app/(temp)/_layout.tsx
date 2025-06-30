import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="ocr"
        options={{
          headerShown: false,
          animation: "ios_from_right",
        }}
      />
      <Stack.Screen
        name="ocr2"
        options={{
          headerShown: false,
          animation: "ios_from_right",
        }}
      />
    </Stack>
  )
}

export default _layout