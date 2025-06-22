// app/(onboarding)/step3.tsx
import { useUserHealth } from '@/context/UserHealthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const MEDICATION_OPTIONS = [
  'Metformin', 'Atorvastatin', 'Amlodipine', 'Omeprazole', 'Levothyroxine',
  'Aspirin', 'Ibuprofen', 'Paracetamol', 'Amoxicillin', 'Ciprofloxacin',
  'Losartan', 'Hydrochlorothiazide', 'Simvastatin', 'Clopidogrel', 'Insulin',
  'Salbutamol', 'Prednisolone', 'Warfarin', 'Digoxin', 'Furosemide'
];

const DOSAGE_OPTIONS = [
  '5mg', '10mg', '25mg', '50mg', '100mg', '250mg', '500mg', '1000mg',
  '1mg', '2mg', '5ml', '10ml', '1 tablet', '2 tablets'
];

const FREQUENCY_OPTIONS = [
  'Once a day', 'Twice a day', 'Three times a day', 'Four times a day',
  'Every 12 hours', 'Every 8 hours', 'Every 6 hours', 'As needed',
  'Before meals', 'After meals', 'At bedtime', 'Weekly', 'Monthly'
];

interface MedicationLocal {
  name: string;
  dosage: string;
  frequency: string;
}

export default function Step3() {
  const { healthProfile, updateCurrentMedications, updateStep } = useUserHealth();
  const [medications, setMedications] = useState<MedicationLocal[]>(healthProfile?.currentMedications || []);
  const [showModal, setShowModal] = useState(false);
  const [currentMed, setCurrentMed] = useState({ name: '', dosage: '', frequency: '' });
  const [searchText, setSearchText] = useState('');
  const [dosageText, setDosageText] = useState('');
  const [frequencyText, setFrequencyText] = useState('');
  const [activeField, setActiveField] = useState<'name' | 'dosage' | 'frequency' | null>(null);

  useEffect(() => {
    setMedications(healthProfile?.currentMedications || []);
  }, [healthProfile?.currentMedications]);

  const filteredMedications = MEDICATION_OPTIONS.filter(med =>
    med.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredDosages = DOSAGE_OPTIONS.filter(dosage =>
    dosage.toLowerCase().includes(dosageText.toLowerCase())
  );

  const filteredFrequencies = FREQUENCY_OPTIONS.filter(freq =>
    freq.toLowerCase().includes(frequencyText.toLowerCase())
  );

  const handleAddMedication = () => {
    if (currentMed.name.trim()) {
      setMedications([...medications, {
        name: currentMed.name.trim(),
        dosage: currentMed.dosage.trim() || 'Not specified',
        frequency: currentMed.frequency.trim() || 'Not specified'
      }]);
      setCurrentMed({ name: '', dosage: '', frequency: '' });
      setSearchText('');
      setDosageText('');
      setFrequencyText('');
      setShowModal(false);
    }
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSelectOption = (field: 'name' | 'dosage' | 'frequency', value: string) => {
    if (field === 'name') {
      setCurrentMed({ ...currentMed, name: value });
      setSearchText(value);
    } else if (field === 'dosage') {
      setCurrentMed({ ...currentMed, dosage: value });
      setDosageText(value);
    } else if (field === 'frequency') {
      setCurrentMed({ ...currentMed, frequency: value });
      setFrequencyText(value);
    }
    setActiveField(null);
  };

  const handleNext = () => {
    updateCurrentMedications(medications);
    updateStep();
    router.push('/step4');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="always">
        {/* Header Section */}
        <View className="mt-4 mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center mr-4">
              <Ionicons name="medical" size={24} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 mb-1">Current Medications</Text>
              <View className="h-1 w-16 bg-emerald-400 rounded-full" />
            </View>
          </View>
          <View className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <Text className="text-blue-800 text-sm leading-5">
              Add your current medications to help us check for interactions and provide personalized health insights.
            </Text>
          </View>
        </View>

        {/* Add Medication Card */}
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="bg-white border-2 border-dashed border-emerald-300 rounded-2xl py-8 items-center mb-6 shadow-sm"
          style={{ elevation: 2 }}
        >
          <View className="w-16 h-16 bg-emerald-50 rounded-full items-center justify-center mb-3">
            <Ionicons name="add-circle" size={32} color="#10B981" />
          </View>
          <Text className="text-emerald-600 font-semibold text-lg">Add New Medication</Text>
          <Text className="text-emerald-500 text-sm mt-1">Tap to add prescription details</Text>
        </TouchableOpacity>

        {/* Medications List */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">My Medications</Text>
            {medications.length > 0 && (
              <View className="bg-emerald-100 px-3 py-1 rounded-full">
                <Text className="text-emerald-700 font-medium text-sm">{medications.length} item{medications.length !== 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
          
          {medications.map((med, index) => (
            <View key={index} className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100" style={{ elevation: 2 }}>
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center mb-2">
                    <View className="w-3 h-3 bg-purple-400 rounded-full mr-2" />
                    <Text className="text-gray-900 font-bold text-lg flex-1">{med.name}</Text>
                  </View>
                  <View className="ml-5">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="flask-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 ml-2 text-sm">
                        <Text className="font-medium">Dosage:</Text> {med.dosage}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 ml-2 text-sm">
                        <Text className="font-medium">Frequency:</Text> {med.frequency}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => handleRemoveMedication(index)}
                  className="w-9 h-9 bg-red-50 rounded-full items-center justify-center"
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {medications.length === 0 && (
            <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="medical-outline" size={28} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500 text-center font-medium">No medications added yet</Text>
              <Text className="text-gray-400 text-center text-sm mt-1">Your medication list will appear here</Text>
            </View>
          )}
        </View>

        {/* Skip Option */}
        <TouchableOpacity className="items-center mb-8">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
            <Text className="text-emerald-600 font-medium ml-2">I&apos;m not currently taking any medications</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Button */}
      <View className="px-6 pb-6 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-emerald-500 rounded-2xl py-4 items-center shadow-lg"
          style={{ elevation: 4 }}
        >
          <View className="flex-row items-center">
            <Text className="text-white font-bold text-lg mr-2">Continue to Next Step</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Enhanced Add Medication Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl max-h-4/5">
            {/* Modal Header */}
            <View className="p-6 border-b border-gray-100">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="add" size={20} color="#10B981" />
                  </View>
                  <Text className="text-xl font-bold text-gray-900">Add Medication</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowModal(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <Text className="text-gray-500 text-sm mt-2">Fill in the medication details below</Text>
            </View>

            <ScrollView className="p-6" keyboardShouldPersistTaps="always">
              {/* Medication Name */}
              <View className="mb-6">
                <Text className="text-gray-900 font-semibold mb-3 text-base">
                  Medication Name <Text className="text-red-500">*</Text>
                </Text>
                <View className="relative">
                  <TextInput
                    value={searchText}
                    onChangeText={(text) => {
                      setSearchText(text);
                      setCurrentMed({ ...currentMed, name: text });
                    }}
                    onFocus={() => setActiveField('name')}
                    placeholder="Search or enter medication name"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-base"
                    style={{ fontSize: 16 }}
                  />
                  <View className="absolute right-4 top-4">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                  </View>
                  {activeField === 'name' && (
                    <ScrollView
                      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 max-h-32 z-10 shadow-lg"
                      keyboardShouldPersistTaps="handled"
                      style={{ elevation: 5 }}
                    >
                      {filteredMedications.map((med, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleSelectOption('name', med)}
                          className="px-4 py-3 border-b border-gray-100"
                        >
                          <Text className="text-gray-800 text-base">{med}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>

              {/* Dosage */}
              <View className="mb-6">
                <Text className="text-gray-900 font-semibold mb-3 text-base">Dosage</Text>
                <View className="relative">
                  <TextInput
                    value={dosageText}
                    onChangeText={(text) => {
                      setDosageText(text);
                      setCurrentMed({ ...currentMed, dosage: text });
                    }}
                    onFocus={() => setActiveField('dosage')}
                    placeholder="e.g., 500mg, 1 tablet, 5ml"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-base"
                    style={{ fontSize: 16 }}
                  />
                  <View className="absolute right-4 top-4">
                    <Ionicons name="flask-outline" size={20} color="#9CA3AF" />
                  </View>
                  {activeField === 'dosage' && (
                    <ScrollView
                      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 max-h-32 z-10 shadow-lg"
                      keyboardShouldPersistTaps="handled"
                      style={{ elevation: 5 }}
                    >
                      {filteredDosages.map((dosage, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleSelectOption('dosage', dosage)}
                          className="px-4 py-3 border-b border-gray-100"
                        >
                          <Text className="text-gray-800 text-base">{dosage}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>

              {/* Frequency */}
              <View className="mb-8">
                <Text className="text-gray-900 font-semibold mb-3 text-base">Frequency</Text>
                <View className="relative">
                  <TextInput
                    value={frequencyText}
                    onChangeText={(text) => {
                      setFrequencyText(text);
                      setCurrentMed({ ...currentMed, frequency: text });
                    }}
                    onFocus={() => setActiveField('frequency')}
                    placeholder="e.g., Twice a day, Before meals"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-base"
                    style={{ fontSize: 16 }}
                  />
                  <View className="absolute right-4 top-4">
                    <Ionicons name="time-outline" size={20} color="#9CA3AF" />
                  </View>
                  {activeField === 'frequency' && (
                    <ScrollView
                      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 max-h-32 z-10 shadow-lg"
                      keyboardShouldPersistTaps="handled"
                      style={{ elevation: 5 }}
                    >
                      {filteredFrequencies.map((freq, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleSelectOption('frequency', freq)}
                          className="px-4 py-3 border-b border-gray-100"
                        >
                          <Text className="text-gray-800 text-base">{freq}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAddMedication}
                className={`rounded-xl py-4 items-center ${
                  currentMed.name.trim() 
                    ? 'bg-emerald-500 shadow-lg' 
                    : 'bg-gray-300'
                }`}
                disabled={!currentMed.name.trim()}
                style={{ elevation: currentMed.name.trim() ? 4 : 0 }}
              >
                <View className="flex-row items-center">
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={currentMed.name.trim() ? "white" : "#9CA3AF"} 
                  />
                  <Text className={`font-bold text-lg ml-2 ${
                    currentMed.name.trim() ? 'text-white' : 'text-gray-500'
                  }`}>
                    Add Medication
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}