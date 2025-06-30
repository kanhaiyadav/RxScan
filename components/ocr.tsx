import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

// Types
interface TranslationResponse {
  success: boolean;
  original_text?: string;
  translated_text?: string;
  target_language?: string;
  context_info?: string;
  translation_date?: string;
  error?: string;
}

interface TranslationComponentProps {
  serverUrl?: string;
}

const TranslationComponent: React.FC<TranslationComponentProps> = ({
  serverUrl = 'http://localhost:5000'
}) => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Hindi');
  const [contextInfo, setContextInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const languages = [
    'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi',
    'Gujarati', 'Punjabi', 'Kannada', 'Malayalam',
    'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic'
  ];

  // Request permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to use this feature.');
      return false;
    }

    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to use this feature.');
      return false;
    }

    return true;
  };

  // Take photo from camera
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        processImageForOCR(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Choose from gallery
  const chooseFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        processImageForOCR(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  // Choose text file
  const chooseTextFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        setInputText(fileContent);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read file');
    }
  };

  // Process image for OCR (you'd need to implement OCR extraction first)
  const processImageForOCR = async (imageUri: string) => {
    setLoading(true);
    try {
      // Create form data for image upload
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'prescription.jpg',
      } as any);

      const response = await fetch(`${serverUrl}/api/extract`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Extract text from prescription data for translation
        let extractedText = '';
        if (result.data.medications) {
          extractedText += 'Medications:\n';
          result.data.medications.forEach((med: any, index: number) => {
            extractedText += `${index + 1}. ${med.name || 'Unknown'} - ${med.dosage || ''}\n`;
            extractedText += `   Frequency: ${med.frequency || 'Not specified'}\n`;
            extractedText += `   Duration: ${med.duration || 'Not specified'}\n`;
            if (med.instructions) {
              extractedText += `   Instructions: ${med.instructions}\n`;
            }
            extractedText += '\n';
          });
        }

        if (result.data.additional_notes?.special_instructions) {
          extractedText += `Special Instructions: ${result.data.additional_notes.special_instructions}\n`;
        }

        setInputText(extractedText);
        setContextInfo('medical prescription');
      } else {
        Alert.alert('Error', result.error || 'Failed to extract text from image');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  // Translate text
  const translateText = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter text to translate');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${serverUrl}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          target_language: selectedLanguage,
          context_info: contextInfo,
        }),
      });

      const result: TranslationResponse = await response.json();

      console.log("**************************", result);

      if (result.success && result.translated_text) {
        setTranslatedText(result.translated_text);
      } else {
        Alert.alert('Error', result.error || 'Translation failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Convert markdown to HTML for PDF
  const markdownToHtml = (markdown: string): string => {
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  };

  // Generate and download PDF
  const generatePDF = async () => {
    if (!translatedText) {
      Alert.alert('Error', 'No translated text to export');
      return;
    }

    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                line-height: 1.6;
                color: #333;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #007AFF;
                padding-bottom: 10px;
              }
              .section { 
                margin: 20px 0; 
              }
              .label { 
                font-weight: bold; 
                color: #007AFF;
                margin-bottom: 5px;
              }
              .content { 
                background-color: #f8f9fa; 
                padding: 15px; 
                border-radius: 8px;
                border-left: 4px solid #007AFF;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Translation Report</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="section">
              <div class="label">Target Language:</div>
              <div>${selectedLanguage}</div>
            </div>
            
            ${contextInfo ? `
            <div class="section">
              <div class="label">Context:</div>
              <div>${contextInfo}</div>
            </div>
            ` : ''}
            
            <div class="section">
              <div class="label">Original Text:</div>
              <div class="content">${markdownToHtml(inputText)}</div>
            </div>
            
            <div class="section">
              <div class="label">Translated Text:</div>
              <div class="content">${markdownToHtml(translatedText)}</div>
            </div>
            
            <div class="footer">
              <p>Generated by Translation App</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  // Show image picker options
  const showImagePicker = () => {
    Alert.alert(
      'Select Source',
      'Choose how you want to add text',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: chooseFromGallery },
        { text: 'Select Text File', onPress: chooseTextFile },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
            Text Translator
          </Text>
          <Text className="text-gray-600 text-center">
            Translate text with AI-powered accuracy
          </Text>
        </View>

        {/* Language Selection */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Target Language
          </Text>
          <TouchableOpacity
            className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
            onPress={() => setShowLanguagePicker(true)}
          >
            <Text className="text-gray-800">{selectedLanguage}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Context Input */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Context (Optional)
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-gray-800"
            placeholder="e.g., medical document, technical manual"
            value={contextInfo}
            onChangeText={setContextInfo}
          />
        </View>

        {/* Input Section */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-800">
              Input Text
            </Text>
            <TouchableOpacity
              className="bg-blue-500 rounded-lg px-3 py-2 flex-row items-center"
              onPress={showImagePicker}
            >
              <Ionicons name="add" size={16} color="white" />
              <Text className="text-white ml-1 font-medium">Add</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-gray-800 min-h-32"
            placeholder="Enter text to translate or use the Add button to capture/import text"
            value={inputText}
            onChangeText={setInputText}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Translate Button */}
        <TouchableOpacity
          className={`rounded-lg p-4 mb-4 ${loading ? 'bg-blue-300' : 'bg-blue-500'}`}
          onPress={translateText}
          disabled={loading}
        >
          {loading ? (
            <View className="flex-row justify-center items-center">
              <ActivityIndicator color="white" size="small" />
              <Text className="text-white font-semibold ml-2">Translating...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-center text-lg">
              Translate
            </Text>
          )}
        </TouchableOpacity>

        {/* Output Section */}
        {translatedText ? (
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-gray-800">
                Translated Text
              </Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  className="bg-green-500 rounded-lg px-3 py-2 flex-row items-center"
                  onPress={() => setShowPreview(true)}
                >
                  <Ionicons name="eye" size={16} color="white" />
                  <Text className="text-white ml-1 font-medium">Preview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-red-500 rounded-lg px-3 py-2 flex-row items-center"
                  onPress={generatePDF}
                >
                  <Ionicons name="download" size={16} color="white" />
                  <Text className="text-white ml-1 font-medium">PDF</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="max-h-64 border border-gray-300 rounded-lg p-3">
              <Text className="text-gray-800 leading-6">{translatedText}</Text>
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      {/* Language Picker Modal */}
      <Modal
        visible={showLanguagePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-lg">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguagePicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView className="max-h-64">
              {languages.map((language) => (
                <TouchableOpacity
                  key={language}
                  className="p-4 border-b border-gray-100"
                  onPress={() => {
                    setSelectedLanguage(language);
                    setShowLanguagePicker(false);
                  }}
                >
                  <Text className={`text-base ${selectedLanguage === language ? 'text-blue-500 font-semibold' : 'text-gray-800'
                    }`}>
                    {language}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">Translation Preview</Text>
            <TouchableOpacity onPress={() => setShowPreview(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-600 mb-2">
                Target Language: {selectedLanguage}
              </Text>
              {contextInfo ? (
                <Text className="text-sm font-medium text-gray-600 mb-2">
                  Context: {contextInfo}
                </Text>
              ) : null}
              <Text className="text-sm text-gray-500">
                Generated on {new Date().toLocaleDateString()}
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold text-blue-600 mb-3">
                Original Text
              </Text>
              <View className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                <Text className="text-gray-800 leading-6">{inputText}</Text>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold text-green-600 mb-3">
                Translated Text
              </Text>
              <View className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                <Text className="text-gray-800 leading-6">{translatedText}</Text>
              </View>
            </View>
          </ScrollView>

          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              className="bg-red-500 rounded-lg p-4 flex-row justify-center items-center"
              onPress={generatePDF}
            >
              <Ionicons name="download" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Download PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TranslationComponent;