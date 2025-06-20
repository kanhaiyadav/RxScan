// app/(onboarding)/step4.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHealthProfile } from '@/context/HealthProfileContext';

const DIETARY_RESTRICTION_OPTIONS = [
  'Alcohol Avoidance',
  'Grapefruit',
  'Caffeine',
  'Dairy Products',
  'High-fat meals',
  'High-sodium foods',
  'Tyramine-rich foods',
  'Vitamin K-rich foods',
  'Iron supplements',
  'Calcium supplements',
  'Antacids',
  'Green leafy vegetables',
  'Citrus fruits',
  'Chocolate',
  'Aged cheeses',
  'Fermented foods',
  'Shellfish',
  'Nuts',
  'Soy products',
  'Gluten'
];

export default function Step4() {
  const { healthProfile, updateDietaryRestrictions, updateAdditionalNotes } = useHealthProfile();
  const [searchText, setSearchText] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(healthProfile.dietaryRestrictions);
  const [showDropdown, setShowDropdown] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState(healthProfile.additionalNotes);

  useEffect(() => {
    setSelectedRestrictions(healthProfile.dietaryRestrictions);
    setAdditionalNotes(healthProfile.additionalNotes);
    
  }, [healthProfile.dietaryRestrictions, healthProfile.additionalNotes]);

  const filteredOptions = DIETARY_RESTRICTION_OPTIONS.filter(option =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelectRestriction = (restriction: string) => {
    if (!selectedRestrictions.includes(restriction)) {
      setSelectedRestrictions([...selectedRestrictions, restriction]);
    }
    setSearchText('');
    setShowDropdown(false);
  };

  const handleRemoveRestriction = (restriction: string) => {
    setSelectedRestrictions(selectedRestrictions.filter(item => item !== restriction));
  };

  const handleAddCustomRestriction = () => {
    if (searchText.trim() && !selectedRestrictions.includes(searchText.trim())) {
      setSelectedRestrictions([...selectedRestrictions, searchText.trim()]);
      setSearchText('');
      setShowDropdown(false);
    }
  };

  const handleComplete = () => {
    // Update the context with final data
    updateDietaryRestrictions(selectedRestrictions);
    updateAdditionalNotes(additionalNotes.trim());

    // The complete health profile data
    const completeHealthData = {
      ...healthProfile,
      dietaryRestrictions: selectedRestrictions,
      additionalNotes: additionalNotes.trim()
    };

    console.log('Complete Health Profile Data:', completeHealthData);

    // Here you would typically save to AsyncStorage or send to your backend
    // await AsyncStorage.setItem('healthProfile', JSON.stringify(completeHealthData));

    // Navigate to main app or dashboard
    router.replace('/(dashboard)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">Dietary Restrictions</Text>
          <Text className="text-gray-600">
            Let us know about any dietary restrictions or foods you need to avoid with medications.
          </Text>
        </View>

        {/* Search Input */}
        <View className="relative mb-4">
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search or type dietary restriction..."
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
                    onPress={() => handleSelectRestriction(option)}
                    className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <Text className="text-gray-800">{option}</Text>
                  </TouchableOpacity>
                ))}
                {searchText.trim() && !filteredOptions.some(option =>
                  option.toLowerCase() === searchText.toLowerCase()
                ) && (
                    <TouchableOpacity
                      onPress={handleAddCustomRestriction}
                      className="px-4 py-3 bg-emerald-50"
                    >
                    <Text className="text-emerald-600">+ Add &quot;{searchText}&quot;</Text>
                    </TouchableOpacity>
                  )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Selected Restrictions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Selected Restrictions</Text>
          <View className="flex-row flex-wrap">
            {selectedRestrictions.map((restriction, index) => (
              <View key={index} className="bg-orange-100 rounded-full px-4 py-2 mr-2 mb-2 flex-row items-center">
                <Text className="text-orange-700 mr-2">{restriction}</Text>
                <TouchableOpacity onPress={() => handleRemoveRestriction(restriction)}>
                  <Ionicons name="close" size={16} color="#C2410C" />
                </TouchableOpacity>
              </View>
            ))}
            {selectedRestrictions.length === 0 && (
              <Text className="text-gray-500 italic">No restrictions selected</Text>
            )}
          </View>
        </View>

        {/* Additional Notes */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Additional Notes</Text>
          <Text className="text-gray-600 text-sm mb-2">
            Any other health information that might be relevant (pregnancy, breastfeeding, etc.)
          </Text>
          <TextInput
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            placeholder="e.g., Pregnant - 3rd trimester, Recently had surgery, etc."
            multiline
            numberOfLines={4}
            className="border border-gray-200 rounded-xl px-4 py-4 text-gray-800 bg-gray-50"
            style={{ textAlignVertical: 'top' }}
          />
        </View>

        {/* Skip option */}
        <TouchableOpacity className="items-center mb-6">
          <Text className="text-emerald-500 font-medium">I don&apos;t have any dietary restrictions</Text>
        </TouchableOpacity>

        {/* Completion Message */}
        <View className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-200">
          <View className="flex-row items-center mb-2">
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text className="text-emerald-800 font-semibold ml-2">Almost Done!</Text>
          </View>
          <Text className="text-emerald-700">
            Your health profile will help us provide personalized medication safety alerts and recommendations.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="px-6 pb-6">
        <TouchableOpacity
          onPress={handleComplete}
          className="bg-emerald-400 rounded-xl py-4 items-center"
        >
          <Text className="text-white font-semibold text-lg">Complete Profile</Text>
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