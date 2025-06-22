// app/(onboarding)/step2.tsx
import { useUserHealth } from '@/context/UserHealthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CONDITION_OPTIONS = [
  'Diabetes (Type 1)',
  'Diabetes (Type 2)',
  'Hypertension (High Blood Pressure)',
  'Asthma',
  'Kidney Disease',
  'Liver Disease',
  'Glaucoma',
  'Heart Disease',
  'Epilepsy/Seizure Disorder',
  'Thyroid Disorders',
  'Depression',
  'Anxiety',
  'Bipolar Disorder',
  'COPD',
  'Osteoporosis',
  'Arthritis',
  'Cancer',
  'HIV/AIDS',
  'Hepatitis',
  'Pregnancy',
  'Breastfeeding',
  'Gastroesophageal Reflux (GERD)',
  'Peptic Ulcer Disease',
  'Stroke History',
  'Blood Clotting Disorders'
];

export default function Step2() {
  const { healthProfile, updateMedicalConditions, updateStep } = useUserHealth();
  const [searchText, setSearchText] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>(healthProfile?.medicalConditions || []);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setSelectedConditions(healthProfile?.medicalConditions || []);
  }, [healthProfile?.medicalConditions]);

  const filteredOptions = CONDITION_OPTIONS.filter(option =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelectCondition = (condition: string) => {
    if (!selectedConditions.includes(condition)) {
      setSelectedConditions([...selectedConditions, condition]);
    }
    setSearchText('');
    setShowDropdown(false);
  };

  const handleRemoveCondition = (condition: string) => {
    setSelectedConditions(selectedConditions.filter(item => item !== condition));
  };

  const handleAddCustomCondition = () => {
    if (searchText.trim() && !selectedConditions.includes(searchText.trim())) {
      setSelectedConditions([...selectedConditions, searchText.trim()]);
      setSearchText('');
      setShowDropdown(false);
    }
  };

  const handleNext = () => {
    updateMedicalConditions(selectedConditions);
    updateStep();
    router.push('/step3');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-6"
        keyboardShouldPersistTaps="always"
      >
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">Medical Conditions</Text>
          <Text className="text-gray-600">
            Help us understand your current health conditions for better medication safety.
          </Text>
        </View>

        {/* Search Input */}
        <View className="relative mb-4">
          <TextInput
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search or type medical condition..."
            className="border border-gray-200 rounded-xl px-4 py-4 text-gray-800 bg-gray-50"
          />
          <Ionicons
            name="search"
            size={20}
            color="#9CA3AF"
            className="absolute right-4 top-4"
          />

          {/* Dropdown */}
          {showDropdown && (searchText.length > 0 || filteredOptions.length > 0) && (
            <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 max-h-48"
              style={{
                zIndex: 1001,
                maxHeight: 200,
                elevation: 1, // For Android shadow
                shadowColor: '#000', // For iOS shadow
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <ScrollView
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={true}
              >
                {filteredOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelectCondition(option)}
                    className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-800">{option}</Text>
                  </TouchableOpacity>
                ))}
                {searchText.trim() && !filteredOptions.some(option =>
                  option.toLowerCase() === searchText.toLowerCase()
                ) && (
                    <TouchableOpacity
                      onPress={handleAddCustomCondition}
                      className="px-4 py-3 bg-emerald-50"
                      activeOpacity={0.7}
                    >
                      <Text className="text-emerald-600">+ Add &quot;{searchText}&quot;</Text>
                    </TouchableOpacity>
                  )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Selected Conditions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Selected Conditions</Text>
          <View className="flex-row flex-wrap">
            {selectedConditions.map((condition, index) => (
              <View key={index} className="bg-blue-100 rounded-full px-4 py-2 mr-2 mb-2 flex-row items-center">
                <Text className="text-blue-700 mr-2">{condition}</Text>
                <TouchableOpacity onPress={() => handleRemoveCondition(condition)}>
                  <Ionicons name="close" size={16} color="#1D4ED8" />
                </TouchableOpacity>
              </View>
            ))}
            {selectedConditions.length === 0 && (
              <Text className="text-gray-500 italic">No conditions selected</Text>
            )}
          </View>
        </View>

        {/* Skip option */}
        <TouchableOpacity className="items-center mb-6">
          <Text className="text-emerald-500 font-medium">I don&apos;t have any medical conditions</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Button */}
      <View className="px-6 pb-6">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-emerald-400 rounded-xl py-4 items-center"
        >
          <Text className="text-white font-semibold text-lg">Continue</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}