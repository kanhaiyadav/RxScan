// app/(onboarding)/step2.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHealthProfile } from '@/context/HealthProfileContext';

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
  const { healthProfile, updateConditions, updateStep } = useHealthProfile();
  const [searchText, setSearchText] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>(healthProfile.conditions);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setSelectedConditions(healthProfile.conditions);
  }, [healthProfile.conditions]);

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
    updateConditions(selectedConditions);
    updateStep();
    router.push('/step3');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
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
            onChangeText={setSearchText}
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
          {showDropdown && (
            <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 max-h-48 z-10">
              <ScrollView>
                {filteredOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelectCondition(option)}
                    className="px-4 py-3 border-b border-gray-100 last:border-b-0"
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

      {/* Overlay to close dropdown */}
      {showDropdown && (
        <TouchableOpacity
          onPress={() => setShowDropdown(false)}
          className="absolute inset-0 bg-transparent z-5"
        />
      )}
    </SafeAreaView>
  );
}