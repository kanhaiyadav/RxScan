// app/(onboarding)/step1.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { UserHealthProfile, useUserHealth } from '@/context/UserHealthContext';

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
  const { healthProfile, updateAllergies,setHealthProfile, updateStep } = useUserHealth();
  const [searchText, setSearchText] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(healthProfile?.allergies || []);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setSelectedAllergies(healthProfile?.allergies || []);
  }, [healthProfile?.allergies]);

  // Filter options based on search text and exclude already selected allergies
  const filteredOptions = ALLERGY_OPTIONS.filter(option =>
    option.toLowerCase().includes(searchText.toLowerCase()) &&
    !selectedAllergies.includes(option)
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

  const handleNext = async () => {
    console.log('Selected Allergies:', selectedAllergies);
    await updateAllergies(selectedAllergies);
    // Now healthProfile should be available in the next render
    console.log(healthProfile);
    updateStep();
    router.push('/step2');
  };

  const handleSkipAllergies = () => {
    setSelectedAllergies([]);
    updateAllergies([]);
    updateStep();
    router.push('/step2');
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setShowDropdown(text.length > 0 || filteredOptions.length > 0);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">Drug Allergies</Text>
          <Text className="text-gray-600">
            Let us know about any drug allergies you have to keep you safe.
          </Text>
        </View>

        {/* Search Input */}
        <View className="relative mb-4" style={{ zIndex: 1000 }}>
          <View className="relative">
            <TextInput
              value={searchText}
              onChangeText={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search or type allergy..."
              className="border border-gray-200 rounded-xl px-4 py-4 pr-12 text-gray-800 bg-gray-50"
              autoCorrect={false}
              autoCapitalize="none"
            />
            <View className="absolute right-4 top-4">
              <Ionicons
                name="search"
                size={20}
                color="#9CA3AF"
              />
            </View>
          </View>

          {/* Dropdown */}
          {showDropdown && (searchText.length > 0 || filteredOptions.length > 0) && (
            <View
              className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg"
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
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                {filteredOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      handleSelectAllergy(option)
                      setShowDropdown(false);
                    }}
                    className="px-4 py-3 border-b border-gray-100"
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-800">{option}</Text>
                  </TouchableOpacity>
                ))}

                {/* Custom allergy option */}
                {searchText.trim() &&
                  !filteredOptions.some(option =>
                    option.toLowerCase() === searchText.toLowerCase()
                  ) &&
                  !selectedAllergies.some(allergy =>
                    allergy.toLowerCase() === searchText.toLowerCase()
                  ) && (
                    <TouchableOpacity
                      onPress={handleAddCustomAllergy}
                      className="px-4 py-3 bg-emerald-50 border-b border-gray-100"
                      activeOpacity={0.7}
                    >
                      <Text className="text-emerald-600">+ Add &quot;{searchText}&quot;</Text>
                    </TouchableOpacity>
                  )}

                {filteredOptions.length === 0 && searchText.length > 0 && (
                  <View className="px-4 py-3">
                    <Text className="text-gray-500 text-center">No matching allergies found</Text>
                  </View>
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
        <TouchableOpacity className="items-center mb-6" onPress={handleSkipAllergies}>
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

      {/* Backdrop to close dropdown */}
      {/* {showDropdown && (
        <TouchableOpacity
          // onPress={() => setShowDropdown(false)}
          className="absolute inset-0"
          style={{ zIndex: 999 }}
          activeOpacity={1}
        />
      )} */}
    </SafeAreaView>
  );
}