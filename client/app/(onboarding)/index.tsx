// app/(onboarding)/step1.tsx
import { useUserHealth } from '@/context/UserHealthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
    const { healthProfile, updateAllergies, setHealthProfile, updateStep } = useUserHealth();
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
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar backgroundColor="transparent" />
            <ScrollView className="flex-1 px-6 pb-[100px]" keyboardShouldPersistTaps="handled">

                <View className="mb-8 pt-4">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-emerald-100 rounded-full p-3 mr-4">
                            <Ionicons name="shield-checkmark" size={24} color="#059669" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-typography-900 mb-1">Drug Allergies</Text>
                            <Text className="text-typography-600 text-base leading-relaxed">
                                Help us keep you safe by sharing your known allergies
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="relative mb-6" style={{ zIndex: 1000 }}>
                    <Text className="text-typography-700 font-medium mb-3">Search for allergies</Text>
                    <View className="relative">
                        <TextInput
                            value={searchText}
                            onChangeText={handleSearchChange}
                            onFocus={() => setShowDropdown(true)}
                            placeholder="Type to search medications, foods, or substances..."
                            className="border-2 border-gray-200 rounded-2xl px-4 py-4 pr-12 text-typography-800 bg-background-0 text-base"
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

                    {/* 🔥 ENHANCED: Dropdown with Better Styling */}
                    {showDropdown && (searchText.length > 0 || filteredOptions.length > 0) && (
                        <View
                            className="absolute top-full left-0 right-0 bg-background-0 border-2 border-gray-200 rounded-2xl mt-2"
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
                                        onPress={() => {
                                            handleSelectAllergy(option)
                                            setShowDropdown(false);
                                        }}
                                        className="px-4 py-4 border-b border-gray-100 flex-row items-center"
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="add-circle-outline" size={18} color="#059669" className="mr-3" />
                                        <Text className="text-typography-800 text-base">{option}</Text>
                                    </TouchableOpacity>
                                ))}

                                {/* 🔥 ENHANCED: Custom allergy option with better styling */}
                                {searchText.trim() &&
                                    !filteredOptions.some(option =>
                                        option.toLowerCase() === searchText.toLowerCase()
                                    ) &&
                                    !selectedAllergies.some(allergy =>
                                        allergy.toLowerCase() === searchText.toLowerCase()
                                    ) && (
                                        <TouchableOpacity
                                            onPress={handleAddCustomAllergy}
                                            className="px-4 py-4 bg-emerald-50 border-b border-emerald-100 flex-row items-center"
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="add-circle" size={18} color="#059669" className="mr-3" />
                                            <Text className="text-emerald-700 font-medium text-base">Add &quot;{searchText}&quot;</Text>
                                        </TouchableOpacity>
                                    )}

                                {filteredOptions.length === 0 && searchText.length > 0 && (
                                    <View className="px-4 py-6 items-center">
                                        <Ionicons name="search" size={24} color="#9CA3AF" className="mb-2" />
                                        <Text className="text-typography-500 text-center text-base">No matching allergies found</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    )}
                </View>

                <View className="mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-semibold text-typography-900">Your Allergies</Text>
                        {selectedAllergies.length > 0 && (
                            <View className="bg-emerald-100 rounded-full px-3 py-1">
                                <Text className="text-emerald-700 text-sm font-medium">
                                    {selectedAllergies.length} selected
                                </Text>
                            </View>
                        )}
                    </View>

                    {selectedAllergies.length > 0 ? (
                        <View className="bg-background-0 rounded-2xl p-4 border border-gray-200"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            <View className="flex-row flex-wrap">
                                {selectedAllergies.map((allergy, index) => (
                                    <View key={index} className="bg-red-50 border border-red-200 rounded-full px-4 py-3 mr-2 mb-2 flex-row items-center">
                                        <Ionicons name="warning" size={14} color="#DC2626" className="mr-2" />
                                        <Text className="text-red-700 font-medium text-sm mr-2">{allergy}</Text>
                                        <TouchableOpacity onPress={() => handleRemoveAllergy(allergy)}>
                                            <Ionicons name="close-circle" size={18} color="#DC2626" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View className="bg-background-0 rounded-2xl p-6 border border-gray-200 items-center"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            <Ionicons name="shield-checkmark-outline" size={32} color="#9CA3AF" className="mb-2" />
                            <Text className="text-typography-500 text-center text-base">No allergies added yet</Text>
                            <Text className="text-typography-400 text-center text-sm mt-1">
                                Search above to add your known allergies
                            </Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    className="items-center mb-6 bg-gray-100 rounded-xl py-4 px-6"
                    onPress={handleSkipAllergies}
                    activeOpacity={0.7}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="checkmark-circle-outline" size={20} color="#059669" className="mr-2" />
                        <Text className="text-emerald-600 font-medium text-base">I don&#39;t have any known allergies</Text>
                    </View>
                </TouchableOpacity>

                {/* Health Tip Card */}
                <View className="mb-2">
                    <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                        <View className="flex-row items-center">
                            <View className="bg-blue-100 rounded-full p-2 mr-3">
                                <Ionicons name="bulb" size={16} color="#3B82F6" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-blue-900 font-semibold text-sm">Quick Tip</Text>
                                <Text className="text-blue-800 text-xs mt-0.5 leading-relaxed">
                                    Accurate health information helps us provide better medication safety alerts.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-row items-start mb-[50px]">
                    <Ionicons name="information-circle" size={20} color="#3B82F6" className="mr-3 mt-0.5" />
                    <Text className="text-blue-700 text-sm flex-1 leading-relaxed">
                        This information helps healthcare providers make safer medication decisions for you
                    </Text>
                </View>

            </ScrollView>


            <View className="px-6 pb-6 pt-4 bg-background-0 border-t border-gray-100">
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