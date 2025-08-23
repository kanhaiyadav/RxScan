import React from 'react';
import { View } from 'react-native';
import TranslationComponent from '@/components/ocr';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <TranslationComponent
        serverUrl="https://3744-14-194-180-252.ngrok-free.app"
      />
    </View>
  );
}