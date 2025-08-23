// app/(onboarding)/step4.tsx
import { useUserHealth } from '@/context/UserHealthContext';
import appwriteService from '@/lib/appwrite';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const { healthProfile, updateDietaryRestrictions, updateAdditionalNotes, setHealthProfile } = useUserHealth();
  const [searchText, setSearchText] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(healthProfile?.dietaryRestrictions || []);
  const [showDropdown, setShowDropdown] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState(healthProfile?.additionalNotes || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSelectedRestrictions(healthProfile?.dietaryRestrictions || []);
    setAdditionalNotes(healthProfile?.additionalNotes || '');
  }, [healthProfile?.dietaryRestrictions, healthProfile?.additionalNotes]);

  const filteredOptions = DIETARY_RESTRICTION_OPTIONS.filter(option =>
    option.toLowerCase().includes(searchText.toLowerCase()) &&
    !selectedRestrictions.includes(option)
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

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Update local state first
      await updateDietaryRestrictions(selectedRestrictions);
      await updateAdditionalNotes(additionalNotes?.trim() || '');

      // Create the complete health profile data
      const completeHealthData = {
        ...healthProfile,
        allergies: healthProfile?.allergies || [],
        medicalConditions: healthProfile?.medicalConditions || [],
        currentMedications: healthProfile?.currentMedications || [],
        dietaryRestrictions: selectedRestrictions,
        additionalNotes: additionalNotes?.trim() || ''
      };

      const currentUser = await appwriteService.getCurrentUser();
      
      if (!currentUser) { 
        Alert.alert(
          'Authentication Error',
          'Please log in to save your health profile.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to login screen
                router.replace('/signin');
              }
            }
          ]
        );
        return;
      }

      // Save to Appwrite database
      const savedProfile = await appwriteService.createOrUpdateHealthProfile(
        currentUser.$id,
        completeHealthData
      );

      console.log('Health profile saved to Appwrite:', savedProfile);

      // Update the context with the complete profile
      await setHealthProfile(completeHealthData);

      // Show success message
      Alert.alert(
        'Profile Complete!',
        'Your health profile has been successfully saved.',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigate to main app or dashboard - try different routes
              try {
                router.replace('/(dashboard)');
              } catch (error) {
                console.error('Navigation error:', error);
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error saving health profile:', error);
      
      // Show error message
      Alert.alert(
        'Error',
        'There was an error saving your health profile. Please try again.',
        [
          {
            text: 'Retry',
            onPress: handleComplete
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipRestrictions = async () => {
    setSelectedRestrictions([]);
    await updateDietaryRestrictions([]);
    // Don't auto-complete, let user decide
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header with Progress Indicator */}

      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
      <View className="pt-4 pb-2">
        <View className="flex-row items-center mb-2">
          <View className="bg-emerald-100 p-2 rounded-full mr-3">
            <Ionicons name="restaurant-outline" size={24} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 mb-1">Dietary Restrictions</Text>
            <Text className="text-gray-600 text-base leading-relaxed">
              Help us identify potential medication-food interactions
            </Text>
          </View>
        </View>
      </View>

        {/* Search Input with Enhanced Styling */}
        <View className="relative mb-6" style={{ zIndex: 1000 }}>
          <Text className="text-gray-900 font-semibold mb-3 text-base">Search Restrictions</Text>
          <View className="relative">
            <TextInput
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search or add your own restriction..."
              className="border-2 border-gray-200 rounded-2xl px-5 py-4 pr-14 text-gray-900 bg-white font-medium"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
              autoCorrect={false}
              autoCapitalize="words"
              placeholderTextColor="#9CA3AF"
            />
            <View className="absolute right-5 top-4">
              <Ionicons
                name="search"
                size={22}
                color="#6B7280"
              />
            </View>
          </View>

          {/* Enhanced Dropdown */}
          {showDropdown && (searchText.length > 0 || filteredOptions.length > 0) && (
            <View
              className="absolute top-full left-0 right-0 bg-white border-2 border-gray-100 rounded-2xl mt-2"
              style={{
                zIndex: 1001,
                maxHeight: 220,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <ScrollView
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
                className="py-2"
              >
                {filteredOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelectRestriction(option)}
                    className="px-5 py-3.5 mx-2 my-0.5 rounded-xl"
                    style={{ backgroundColor: 'transparent' }}
                    activeOpacity={0.6}
                  >
                    <Text className="text-gray-800 font-medium">{option}</Text>
                  </TouchableOpacity>
                ))}

                {/* Enhanced Custom restriction option */}
                {searchText.trim() &&
                  !filteredOptions.some(option =>
                    option.toLowerCase() === searchText.toLowerCase()
                  ) &&
                  !selectedRestrictions.some(restriction =>
                    restriction.toLowerCase() === searchText.toLowerCase()
                  ) && (
                    <TouchableOpacity
                      onPress={handleAddCustomRestriction}
                      className="px-5 py-3.5 mx-2 my-0.5 bg-orange-50 border border-orange-200 rounded-xl"
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="add-circle" size={18} color="#EA580C" />
                        <Text className="text-orange-700 font-semibold ml-2">Add &quot;{searchText}&quot;</Text>
                      </View>
                    </TouchableOpacity>
                  )}

                {filteredOptions.length === 0 && searchText.length > 0 && (
                  <View className="px-5 py-4">
                    <Text className="text-gray-500 text-center font-medium">No matching restrictions found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Selected Restrictions with Enhanced Design */}
        <View className="mb-6">
          <Text className="text-gray-900 font-semibold mb-4 text-base">Your Restrictions</Text>
          <View className="bg-white rounded-2xl p-4 border border-gray-200" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}>
            <View className="flex-row flex-wrap">
              {selectedRestrictions.map((restriction, index) => (
                <View key={index} className="bg-orange-100 border border-orange-200 rounded-full px-4 py-2.5 mr-2 mb-2.5 flex-row items-center">
                  <Text className="text-orange-800 font-medium mr-2">{restriction}</Text>
                  <TouchableOpacity onPress={() => handleRemoveRestriction(restriction)}>
                    <View className="bg-orange-200 rounded-full p-1">
                      <Ionicons name="close" size={14} color="#EA580C" />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
              {selectedRestrictions.length === 0 && (
                <View className="items-center justify-center w-full py-8">
                  <View className="bg-gray-100 p-4 rounded-full mb-3">
                    <Ionicons name="restaurant-outline" size={32} color="#9CA3AF" />
                  </View>
                  <Text className="text-gray-500 font-medium text-center">No restrictions selected yet</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">Tap above to search and add restrictions</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Enhanced Information Card */}
        <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start">
            <View className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-blue-900 font-semibold mb-1">Why This Matters</Text>
              <Text className="text-blue-800 text-sm leading-relaxed">
                Certain foods can affect how medications work or cause dangerous interactions. This helps us keep you safe.
              </Text>
            </View>
          </View>
        </View>

        {/* Enhanced Additional Notes */}
        <View className="mb-6">
          <Text className="text-gray-900 font-semibold mb-3 text-base">Additional Health Notes</Text>
          <Text className="text-gray-600 text-sm mb-3 leading-relaxed">
            Include any other relevant health information (pregnancy, breastfeeding, recent surgeries, etc.)
          </Text>
          <View className="bg-white rounded-2xl border-2 border-gray-200" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}>
            <TextInput
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              placeholder="e.g., Pregnant (3rd trimester), Recently had surgery, Taking supplements..."
              multiline
              numberOfLines={4}
              className="px-5 py-4 text-gray-900 font-medium"
              style={{ textAlignVertical: 'top', minHeight: 100 }}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Enhanced Skip option */}
        <TouchableOpacity 
          className="items-center mb-6 py-3" 
          onPress={handleSkipRestrictions}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle-outline" size={20} color="#F97316" />
            <Text className="text-orange-600 font-semibold ml-2">I don&#39;t have any dietary restrictions</Text>
          </View>
        </TouchableOpacity>

        {/* Enhanced Completion Message */}
        <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6" style={{
          shadowColor: '#10B981',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
          <View className="flex-row items-start">
            <View className="bg-emerald-100 p-2 rounded-full mr-4">
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-emerald-900 font-bold text-lg mb-2">Almost Complete!</Text>
              <Text className="text-emerald-800 leading-relaxed">
                Your personalized health profile will help RxScan provide tailored medication safety alerts and recommendations just for you.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing for scroll */}
        <View className="h-4" />
      </ScrollView>

      {/* Enhanced Bottom Button */}
      <View className="px-6 pb-6 pt-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleComplete}
          disabled={isLoading}
          className={`rounded-2xl py-4 items-center ${isLoading ? 'bg-gray-400' : 'bg-emerald-500'}`}
          style={{
            shadowColor: isLoading ? '#6B7280' : '#10B981',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
          activeOpacity={isLoading ? 1 : 0.8}
        >
          {isLoading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-bold text-lg ml-3">Saving Your Profile...</Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Complete Health Profile</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}