// app/(onboarding)/step1.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHealthProfile } from '@/context/HealthProfileContext';

const ALLERGY_OPTIONS = [
  'Penicillin',
  'Sulfa Drugs (Sulfonamides)',
  'Aspirin/NSAIDs',
  'Cephalosporins',
  'Codeine',
  'Morphine',
  'Latex',
  'Iodine',
  'Tetracycline',
  'Erythromycin',
  'Vancomycin',
  'Quinolones',
  'Beta-blockers',
  'ACE Inhibitors',
  'Local Anesthetics',
  'Contrast Dyes',
  'Shellfish',
  'Eggs',
  'Soy',
  'Nuts'
];

export default function Step1() {
  const { healthProfile, updateAllergies, updateStep } = useHealthProfile();
  const [searchText, setSearchText] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(healthProfile.allergies);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setSelectedAllergies(healthProfile.allergies);
  }, [healthProfile.allergies]);

  const filteredOptions = ALLERGY_OPTIONS.filter(option =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelectAllergy = (allergy: string) => {
    if (!selectedAllergies.includes(allergy)) {
      setSelectedAllergies([...selectedAllergies, allergy]);
    }
    setSearchText('');
    setShowDropdown(false);
  };

  const handleRemoveAllergy = (allergy: string) => {
    setSelectedAllergies(selectedAllergies.filter(item => item !== allergy));
  };

  const handleAddCustomAllergy = () => {
    if (searchText.trim() && !selectedAllergies.includes(searchText.trim())) {
      setSelectedAllergies([...selectedAllergies, searchText.trim()]);
      setSearchText('');
      setShowDropdown(false);
    }
  };

  const handleNext = () => {
    updateAllergies(selectedAllergies);
    updateStep();
    router.push('/step2');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with gradient background */}
      <ScrollView className="flex-1 px-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">Drug Allergies</Text>
          <Text className="text-gray-600">
            Let us know about any drug allergies you have to keep you safe.
          </Text>
        </View>

        {/* Search Input */}
        <View className="relative mb-4">
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search or type allergy..."
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
                    onPress={() => handleSelectAllergy(option)}
                    className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <Text className="text-gray-800">{option}</Text>
                  </TouchableOpacity>
                ))}
                {searchText.trim() && !filteredOptions.some(option =>
                  option.toLowerCase() === searchText.toLowerCase()
                ) && (
                    <TouchableOpacity
                      onPress={handleAddCustomAllergy}
                      className="px-4 py-3 bg-emerald-50"
                    >
                      <Text className="text-emerald-600">+ Add &quot;{searchText}&quot;</Text>
                    </TouchableOpacity>
                  )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Selected Allergies */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Selected Allergies</Text>
          <View className="flex-row flex-wrap">
            {selectedAllergies.map((allergy, index) => (
              <View key={index} className="bg-emerald-100 rounded-full px-4 py-2 mr-2 mb-2 flex-row items-center">
                <Text className="text-emerald-700 mr-2">{allergy}</Text>
                <TouchableOpacity onPress={() => handleRemoveAllergy(allergy)}>
                  <Ionicons name="close" size={16} color="#059669" />
                </TouchableOpacity>
              </View>
            ))}
            {selectedAllergies.length === 0 && (
              <Text className="text-gray-500 italic">No allergies selected</Text>
            )}
          </View>
        </View>

        {/* Skip option */}
        <TouchableOpacity className="items-center mb-6">
          <Text className="text-emerald-500 font-medium">I don&apos;t have any known allergies</Text>
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