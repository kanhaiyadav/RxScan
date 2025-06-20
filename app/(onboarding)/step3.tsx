// app/(onboarding)/step3.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Modal } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHealthProfile, Medication } from '@/context/HealthProfileContext';

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
  const { healthProfile, updateMedications, updateStep } = useHealthProfile();
  const [medications, setMedications] = useState<MedicationLocal[]>(healthProfile.currentMedications);
  const [showModal, setShowModal] = useState(false);
  const [currentMed, setCurrentMed] = useState({ name: '', dosage: '', frequency: '' });
  const [searchText, setSearchText] = useState('');
  const [dosageText, setDosageText] = useState('');
  const [frequencyText, setFrequencyText] = useState('');
  const [activeField, setActiveField] = useState<'name' | 'dosage' | 'frequency' | null>(null);

  useEffect(() => {
    setMedications(healthProfile.currentMedications);
  }, [healthProfile.currentMedications]);

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
    updateMedications(medications);
    updateStep();
    router.push('/step4');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">Current Medications</Text>
          <Text className="text-gray-600">
            Add any medications you&apos;re currently taking to check for interactions.
          </Text>
        </View>

        {/* Add Medication Button */}
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="border-2 border-dashed border-emerald-300 rounded-xl py-6 items-center mb-6"
        >
          <Ionicons name="add-circle" size={32} color="#10B981" />
          <Text className="text-emerald-600 font-medium mt-2">Add Medication</Text>
        </TouchableOpacity>

        {/* Current Medications List */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Current Medications</Text>
          {medications.map((med, index) => (
            <View key={index} className="bg-purple-50 rounded-xl p-4 mb-3 border border-purple-200">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-purple-800 font-semibold text-lg">{med.name}</Text>
                  <Text className="text-purple-600 mt-1">Dosage: {med.dosage}</Text>
                  <Text className="text-purple-600">Frequency: {med.frequency}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveMedication(index)}>
                  <Ionicons name="close-circle" size={24} color="#7C3AED" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {medications.length === 0 && (
            <Text className="text-gray-500 italic text-center py-4">No medications added yet</Text>
          )}
        </View>

        {/* Skip option */}
        <TouchableOpacity className="items-center mb-6">
          <Text className="text-emerald-500 font-medium">I&apos;m not taking any medications</Text>
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

      {/* Add Medication Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-4/5">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Add Medication</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Medication Name */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Medication Name *</Text>
                <View className="relative">
                  <TextInput
                    value={searchText}
                    onChangeText={(text) => {
                      setSearchText(text);
                      setCurrentMed({ ...currentMed, name: text });
                    }}
                    onFocus={() => setActiveField('name')}
                    placeholder="Enter medication name"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  />
                  {activeField === 'name' && (
                    <ScrollView className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 max-h-32 z-10">
                      {filteredMedications.map((med, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleSelectOption('name', med)}
                          className="px-4 py-3 border-b border-gray-100"
                        >
                          <Text className="text-gray-800">{med}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>

              {/* Dosage */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Dosage</Text>
                <View className="relative">
                  <TextInput
                    value={dosageText}
                    onChangeText={(text) => {
                      setDosageText(text);
                      setCurrentMed({ ...currentMed, dosage: text });
                    }}
                    onFocus={() => setActiveField('dosage')}
                    placeholder="e.g., 500mg, 1 tablet"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  />
                  {activeField === 'dosage' && (
                    <ScrollView className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 max-h-32 z-10">
                      {filteredDosages.map((dosage, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleSelectOption('dosage', dosage)}
                          className="px-4 py-3 border-b border-gray-100"
                        >
                          <Text className="text-gray-800">{dosage}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>

              {/* Frequency */}
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">Frequency</Text>
                <View className="relative">
                  <TextInput
                    value={frequencyText}
                    onChangeText={(text) => {
                      setFrequencyText(text);
                      setCurrentMed({ ...currentMed, frequency: text });
                    }}
                    onFocus={() => setActiveField('frequency')}
                    placeholder="e.g., Twice a day, Before meals"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  />
                  {activeField === 'frequency' && (
                    <ScrollView className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 max-h-32 z-10">
                      {filteredFrequencies.map((freq, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleSelectOption('frequency', freq)}
                          className="px-4 py-3 border-b border-gray-100"
                        >
                          <Text className="text-gray-800">{freq}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAddMedication}
                className="bg-emerald-400 rounded-xl py-4 items-center"
                disabled={!currentMed.name.trim()}
              >
                <Text className="text-white font-semibold text-lg">Add Medication</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}