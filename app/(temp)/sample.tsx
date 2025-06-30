import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { usePrescriptionScanner } from '@/hooks/usePrescriptionScanner';
import { useUserHealth } from '@/context/UserHealthContext';

const PrescriptionScanScreen: React.FC = () => {
  const [scanResult, setScanResult] = useState<any>(null);
  const { analyzePrescription, validatePrescription, loading } = usePrescriptionScanner();
  const { healthProfile, isOnboardingComplete } = useUserHealth();

  console.log('Health Profile:', healthProfile);

  const handleScanPrescription = async () => {
    // This would typically come from your OCR service
    const mockOcrText = `
      Dr. Sharma
      City Hospital
      Date: 15/06/2025
      
      Patient: John Doe
      
      1. Paracetamol 500mg 3 times daily
      2. Amoxicillin 250mg twice daily for 7 days
      3. Omeprazole 20mg once daily before breakfast
      
      Follow up after 1 week
    `;

    try {
      const analysis = await analyzePrescription(mockOcrText);
      const validation = await validatePrescription(analysis);

      setScanResult({ analysis, validation });

      if (!validation.isValid) {
        Alert.alert(
          'Prescription Warnings',
          'Critical warnings detected. Please review before taking medications.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze prescription');
    }
  };

  if (!isOnboardingComplete) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-center mb-4">
          Please complete your health profile to use prescription scanning
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={() => {/* Navigate to onboarding */ }}
        >
          <Text className="text-white font-semibold">Complete Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-6">Prescription Scanner</Text>

        {/* Health Profile Summary */}
        <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
          <Text className="text-lg font-semibold mb-2">Your Health Profile</Text>
          <Text className="text-gray-600">
            Allergies: {healthProfile?.allergies.join(', ') || 'None'}
          </Text>
          <Text className="text-gray-600">
            Conditions: {healthProfile?.medicalConditions.join(', ') || 'None'}
          </Text>
          <Text className="text-gray-600">
            Current Meds: {healthProfile?.currentMedications.join(', ') || 'None'}
          </Text>
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg mb-4"
          onPress={handleScanPrescription}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">
              Scan Prescription (Demo)
            </Text>
          )}
        </TouchableOpacity>

        {/* Results */}
        {scanResult && (
          <View className="space-y-4">
            {/* Prescription Info */}
            <View className="bg-white p-4 rounded-lg shadow-sm">
              <Text className="text-lg font-semibold mb-2">Prescription Details</Text>
              <Text>Doctor: {scanResult.analysis.prescription.doctorName}</Text>
              <Text>Hospital: {scanResult.analysis.prescription.hospitalName}</Text>
              <Text>Date: {scanResult.analysis.prescription.prescriptionDate}</Text>
              <Text>Medicines Found: {scanResult.analysis.prescription.medicines.length}</Text>
            </View>

            {/* Overall Risk */}
            <View className={`p-4 rounded-lg ${scanResult.analysis.overallRisk === 'high' ? 'bg-red-100' :
                scanResult.analysis.overallRisk === 'medium' ? 'bg-yellow-100' :
                  'bg-green-100'
              }`}>
              <Text className="text-lg font-semibold mb-2">
                Risk Level: {scanResult.analysis.overallRisk.toUpperCase()}
              </Text>
              {scanResult.analysis.criticalWarnings.map((warning: string, index: number) => (
                <Text key={index} className="text-red-700 mb-1">⚠️ {warning}</Text>
              ))}
            </View>

            {/* Medicine Analysis */}
            {scanResult.analysis.medicineAnalysis.map((item: any, index: number) => (
              <View key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <Text className="text-lg font-semibold">{item.medicine.name}</Text>
                {item.medicine.dosage && <Text>Dosage: {item.medicine.dosage}</Text>}
                {item.medicine.frequency && <Text>Frequency: {item.medicine.frequency}</Text>}

                {item.analysis && (
                  <View className="mt-3">
                    <Text className="font-semibold">Interactions:</Text>
                    {item.analysis.interactions.map((interaction: any, i: number) => (
                      <Text key={i} className={`mt-1 ${interaction.severity === 'contraindicated' || interaction.severity === 'major'
                          ? 'text-red-600'
                          : interaction.severity === 'moderate'
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }`}>
                        • {interaction.description}
                      </Text>
                    ))}

                    {item.analysis.foodInteractions.length > 0 && (
                      <View className="mt-2">
                        <Text className="font-semibold">Food Interactions:</Text>
                        {item.analysis.foodInteractions.map((food: string, i: number) => (
                          <Text key={i} className="text-orange-600">• {food}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}

            {/* Validation Summary */}
            <View className="bg-white p-4 rounded-lg shadow-sm">
              <Text className="text-lg font-semibold mb-2">Validation Summary</Text>
              <Text className={`font-semibold ${scanResult.validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {scanResult.validation.isValid ? '✅ Prescription is safe' : '⚠️ Warnings detected'}
              </Text>

              {scanResult.validation.allergyConflicts.length > 0 && (
                <View className="mt-2">
                  <Text className="font-semibold text-red-600">Allergy Conflicts:</Text>
                  {scanResult.validation.allergyConflicts.map((conflict: string, i: number) => (
                    <Text key={i} className="text-red-600">• {conflict}</Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default PrescriptionScanScreen;