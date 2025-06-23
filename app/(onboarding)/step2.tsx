// app/(onboarding)/step2.tsx
import { useUserHealth } from '@/context/UserHealthContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
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

  // 🔥 ENHANCEMENT: Added filter to exclude already selected conditions
  const filteredOptions = CONDITION_OPTIONS.filter(option =>
    option.toLowerCase().includes(searchText.toLowerCase()) &&
    !selectedConditions.includes(option)
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

  const handleSkipConditions = () => {
    setSelectedConditions([]);
    updateMedicalConditions([]);
    updateStep();
    router.push('/step3');
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setShowDropdown(text.length > 0 || filteredOptions.length > 0);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 px-6"
        keyboardShouldPersistTaps="handled" 
      >
        <View className="mb-8 pt-4">
          <View className="flex-row items-center mb-4">
            <View className="bg-primary-100 rounded-full p-3 mr-4">
              <FontAwesome5 name="heartbeat" size={24} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 mb-1">Medical Conditions</Text>
              <Text className="text-gray-600 text-base leading-relaxed">
                Share your health conditions for safer medication recommendations
              </Text>
            </View>
          </View>
        </View>

        <View className="relative mb-6" style={{ zIndex: 1000 }}>
          <Text className="text-gray-700 font-medium mb-3">Search for medical conditions</Text>
          <View className="relative">
            <TextInput
              value={searchText}
              onChangeText={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              placeholder="Type to search conditions like diabetes, asthma, etc..."
              className="border-2 border-gray-200 rounded-2xl px-4 py-4 pr-12 text-gray-800 bg-white text-base"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
              autoCorrect={false}
              autoCapitalize="words"
            />
            <View className="absolute right-4 top-4">
              <Ionicons
                name="search"
                size={20}
                color="#6B7280"
              />
            </View>
          </View>

          {showDropdown && (searchText.length > 0 || filteredOptions.length > 0) && (
            <View
              className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-2xl mt-2"
              style={{
                zIndex: 1001,
                maxHeight: 200,
                elevation: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
              }}
            >
              <ScrollView
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                {filteredOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelectCondition(option)}
                    className="px-4 py-4 border-b border-gray-100 flex-row items-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle-outline" size={18} color="#2563EB" className="mr-3" />
                    <Text className="text-gray-800 text-base">{option}</Text>
                  </TouchableOpacity>
                ))}

                {searchText.trim() && !filteredOptions.some(option =>
                  option.toLowerCase() === searchText.toLowerCase()
                ) && !selectedConditions.some(condition =>
                  condition.toLowerCase() === searchText.toLowerCase()
                ) && (
                    <TouchableOpacity
                      onPress={handleAddCustomCondition}
                      className="px-4 py-4 bg-blue-50 border-b border-blue-100 flex-row items-center"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add-circle" size={18} color="#2563EB" className="mr-3" />
                      <Text className="text-blue-700 font-medium text-base">Add &quot;{searchText}&quot;</Text>
                    </TouchableOpacity>
                  )}

                {filteredOptions.length === 0 && searchText.length > 0 && (
                  <View className="px-4 py-6 items-center">
                    <Ionicons name="search" size={24} color="#9CA3AF" className="mb-2" />
                    <Text className="text-gray-500 text-center text-base">No matching conditions found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">Your Medical Conditions</Text>
            {selectedConditions.length > 0 && (
              <View className="bg-blue-100 rounded-full px-3 py-1">
                <Text className="text-blue-700 text-sm font-medium">
                  {selectedConditions.length} selected
                </Text>
              </View>
            )}
          </View>
          
          {selectedConditions.length > 0 ? (
            <View className="bg-white rounded-2xl p-4 border border-gray-200"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="flex-row flex-wrap">
                {selectedConditions.map((condition, index) => (
                  <View key={index} className="bg-blue-50 border border-blue-200 rounded-full px-4 py-3 mr-2 mb-2 flex-row items-center">
                    <Ionicons name="medical-outline" size={14} color="#2563EB" className="mr-2" />
                    <Text className="text-blue-700 font-medium text-sm mr-2">{condition}</Text>
                    <TouchableOpacity onPress={() => handleRemoveCondition(condition)}>
                      <Ionicons name="close-circle" size={18} color="#2563EB" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View className="bg-white rounded-2xl p-6 border border-gray-200 items-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Ionicons name="medical-outline" size={32} color="#9CA3AF" className="mb-2" />
              <Text className="text-gray-500 text-center text-base">No medical conditions added yet</Text>
              <Text className="text-gray-400 text-center text-sm mt-1">
                Search above to add your current health conditions
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          className="items-center mb-6 bg-gray-100 rounded-xl py-4 px-6" 
          onPress={handleSkipConditions}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle-outline" size={20} color="#059669" className="mr-2" />
            <Text className="text-emerald-600 font-medium text-base">I don&#39;t have any medical conditions</Text>
          </View>
        </TouchableOpacity>
        <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex-row items-start mb-[150px]">
          <Ionicons name="information-circle" size={20} color="#F59E0B" className="mr-3 mt-0.5" />
          <Text className="text-amber-700 text-sm flex-1 leading-relaxed">
            Your medical history helps us identify potential drug interactions and contraindications
          </Text>
        </View>
      </ScrollView>

      <View className="px-6 pb-6 pt-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-emerald-500 rounded-2xl py-4 px-6 items-center flex-row justify-center"
          style={{
            shadowColor: '#059669',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
          activeOpacity={0.9}
        >
          <Text className="text-white font-semibold text-lg mr-2">Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}