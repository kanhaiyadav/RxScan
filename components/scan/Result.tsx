import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    Dimensions,
    SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ActiveIngredient {
    name: string;
    strength: string;
    purpose: string;
}

interface SideEffects {
    common: string[];
    serious: string[];
    rare: string[];
}

interface Interactions {
    drugInteractions: string[];
    foodInteractions: string[];
    conditionInteractions: string[];
}

interface OverdoseMissedDose {
    overdose: string;
    missedDose: string;
}

interface ApproximatePrice {
    currency: string;
    priceRange: string;
    unit: string;
    lastUpdated: string;
}

interface Medicine {
    name: string;
    imageUrl: string;
    uses: string[];
    sideEffects: SideEffects;
    warningsAndPrecautions: string[];
    interactions: Interactions;
    overdoseMissedDose: OverdoseMissedDose;
    approximatePrice: ApproximatePrice;
    manufacturer: string[];
    activeIngredients: ActiveIngredient[];
    dosageForm: string;
    prescriptionRequired: boolean;
    genericAvailable: boolean;
    fdaApproved: boolean;
    lastUpdated: string;
}

interface MedicineData {
    medicines: Medicine[];
}

interface Props {
    result: MedicineData;
    resetToStart: () => void;
}

const MedicineDisplay: React.FC<Props> = ({ result, resetToStart }) => {
    const [selectedMedicine, setSelectedMedicine] = useState(0);
    const [activeSection, setActiveSection] = useState<string>('overview');

    const currentMedicine = result.medicines[selectedMedicine];

    const sections = [
        { id: 'overview', title: 'Overview', icon: 'information-circle' },
        { id: 'ingredients', title: 'Ingredients', icon: 'flask' },
        { id: 'sideEffects', title: 'Side Effects', icon: 'warning' },
        { id: 'interactions', title: 'Interactions', icon: 'link' },
        { id: 'precautions', title: 'Precautions', icon: 'shield-checkmark' },
        { id: 'dosage', title: 'Dosage Info', icon: 'medical' },
    ];

    const renderMedicineSelector = () => (
        <View className="px-4 py-3 bg-gray-50">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3">
                    {result.medicines.map((medicine, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedMedicine(index)}
                            className={`px-4 py-2 rounded-full ${selectedMedicine === index
                                    ? 'bg-[#00ffc8]'
                                    : 'bg-white border border-gray-200'
                                }`}
                        >
                            <Text className={`font-medium ${selectedMedicine === index ? 'text-black' : 'text-gray-600'
                                }`}>
                                {medicine.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    const renderSectionTabs = () => (
        <View className="px-4 py-3 bg-white border-b border-gray-100">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                    {sections.map((section) => (
                        <TouchableOpacity
                            key={section.id}
                            onPress={() => setActiveSection(section.id)}
                            className={`flex-row items-center px-4 py-2 rounded-xl ${activeSection === section.id
                                    ? 'bg-[#00ffc8]'
                                    : 'bg-gray-100'
                                }`}
                        >
                            <Ionicons
                                name={section.icon as any}
                                size={16}
                                color={activeSection === section.id ? '#000' : '#666'}
                            />
                            <Text className={`ml-2 font-medium text-sm ${activeSection === section.id ? 'text-black' : 'text-gray-600'
                                }`}>
                                {section.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    const renderOverview = () => (
        <View className="p-4 space-y-4">
            {/* Medicine Header */}
            <View className="bg-gradient-to-r from-[#00ffc8] to-[#00e6b8] rounded-2xl p-5">
                <Text className="text-2xl font-bold text-black mb-2">
                    {currentMedicine.name}
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-3">
                    <View className="bg-black/10 rounded-full px-3 py-1">
                        <Text className="text-black font-medium text-xs">
                            {currentMedicine.dosageForm}
                        </Text>
                    </View>
                    {currentMedicine.prescriptionRequired && (
                        <View className="bg-black/10 rounded-full px-3 py-1">
                            <Text className="text-black font-medium text-xs">Prescription Required</Text>
                        </View>
                    )}
                    {currentMedicine.fdaApproved && (
                        <View className="bg-black/10 rounded-full px-3 py-1">
                            <Text className="text-black font-medium text-xs">FDA Approved</Text>
                        </View>
                    )}
                </View>
                <Text className="text-black/80 text-base leading-6">
                    Primary uses: {currentMedicine.uses.slice(0, 3).join(', ')}
                    {currentMedicine.uses.length > 3 && '...'}
                </Text>
            </View>

            {/* Quick Stats */}
            <View className="flex-row gap-3">
                <View className="flex-1 bg-blue-50 rounded-xl p-4">
                    <Ionicons name="medical" size={24} color="#3b82f6" />
                    <Text className="text-blue-600 font-semibold mt-2">{currentMedicine.uses.length}</Text>
                    <Text className="text-blue-600 text-sm">Uses</Text>
                </View>
                <View className="flex-1 bg-orange-50 rounded-xl p-4">
                    <Ionicons name="warning" size={24} color="#f97316" />
                    <Text className="text-orange-600 font-semibold mt-2">
                        {currentMedicine.sideEffects.common.length + currentMedicine.sideEffects.serious.length}
                    </Text>
                    <Text className="text-orange-600 text-sm">Side Effects</Text>
                </View>
                <View className="flex-1 bg-green-50 rounded-xl p-4">
                    <Ionicons name="business" size={24} color="#10b981" />
                    <Text className="text-green-600 font-semibold mt-2">{currentMedicine.manufacturer.length}</Text>
                    <Text className="text-green-600 text-sm">Manufacturers</Text>
                </View>
            </View>

            {/* Price Info */}
            <View className="bg-white border border-gray-200 rounded-xl p-4">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-lg font-bold text-gray-900">
                            {currentMedicine.approximatePrice.priceRange}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                            {currentMedicine.approximatePrice.unit}
                        </Text>
                    </View>
                    <View className="bg-[#00ffc8] rounded-full p-2">
                        <Ionicons name="pricetag" size={20} color="#000" />
                    </View>
                </View>
            </View>
        </View>
    );

    const renderIngredients = () => (
        <View className="p-4 space-y-3">
            {currentMedicine.activeIngredients.map((ingredient, index) => (
                <View key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-lg font-semibold text-gray-900">
                            {ingredient.name}
                        </Text>
                        <Text className="text-[#00ffc8] font-bold">
                            {ingredient.strength}
                        </Text>
                    </View>
                    <Text className="text-gray-600 leading-5">
                        {ingredient.purpose}
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderSideEffects = () => (
        <View className="p-4 space-y-4">
            {currentMedicine.sideEffects.common.length > 0 && (
                <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="information-circle" size={20} color="#3b82f6" />
                        <Text className="text-blue-700 font-semibold ml-2">Common Side Effects</Text>
                    </View>
                    {currentMedicine.sideEffects.common.map((effect, index) => (
                        <Text key={index} className="text-blue-700 mb-1">• {effect}</Text>
                    ))}
                </View>
            )}

            {currentMedicine.sideEffects.serious.length > 0 && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="warning" size={20} color="#ef4444" />
                        <Text className="text-red-700 font-semibold ml-2">Serious Side Effects</Text>
                    </View>
                    {currentMedicine.sideEffects.serious.map((effect, index) => (
                        <Text key={index} className="text-red-700 mb-1 leading-5">• {effect}</Text>
                    ))}
                </View>
            )}
        </View>
    );

    const renderInteractions = () => (
        <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
            <View className="space-y-4">
                {/* Drug Interactions */}
                {currentMedicine.interactions.drugInteractions.length > 0 && (
                    <View className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="medical" size={20} color="#f97316" />
                            <Text className="text-orange-700 font-semibold ml-2">Drug Interactions</Text>
                        </View>
                        {currentMedicine.interactions.drugInteractions.map((interaction, index) => (
                            <Text key={index} className="text-orange-700 mb-2 leading-5">• {interaction}</Text>
                        ))}
                    </View>
                )}

                {/* Food Interactions */}
                {currentMedicine.interactions.foodInteractions.length > 0 && (
                    <View className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="restaurant" size={20} color="#10b981" />
                            <Text className="text-green-700 font-semibold ml-2">Food Interactions</Text>
                        </View>
                        {currentMedicine.interactions.foodInteractions.map((interaction, index) => (
                            <Text key={index} className="text-green-700 mb-2 leading-5">• {interaction}</Text>
                        ))}
                    </View>
                )}

                {/* Condition Interactions */}
                {currentMedicine.interactions.conditionInteractions.length > 0 && (
                    <View className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="fitness" size={20} color="#8b5cf6" />
                            <Text className="text-purple-700 font-semibold ml-2">Medical Conditions</Text>
                        </View>
                        {currentMedicine.interactions.conditionInteractions.map((condition, index) => (
                            <Text key={index} className="text-purple-700 mb-2 leading-5">• {condition}</Text>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );

    const renderPrecautions = () => (
        <View className="p-4 space-y-3">
            {currentMedicine.warningsAndPrecautions.map((precaution, index) => (
                <View key={index} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <View className="flex-row items-start">
                        <Ionicons name="shield-checkmark" size={20} color="#f59e0b" className="mt-0.5 mr-3" />
                        <Text className="text-yellow-800 leading-6 flex-1">
                            {precaution}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );

    const renderDosageInfo = () => (
        <View className="p-4 space-y-4">
            {/* Overdose Info */}
            <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                <View className="flex-row items-center mb-3">
                    <Ionicons name="alert-circle" size={20} color="#ef4444" />
                    <Text className="text-red-700 font-semibold ml-2">Overdose Information</Text>
                </View>
                <Text className="text-red-700 leading-6">
                    {currentMedicine.overdoseMissedDose.overdose}
                </Text>
            </View>

            {/* Missed Dose Info */}
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <View className="flex-row items-center mb-3">
                    <Ionicons name="time" size={20} color="#3b82f6" />
                    <Text className="text-blue-700 font-semibold ml-2">Missed Dose</Text>
                </View>
                <Text className="text-blue-700 leading-6">
                    {currentMedicine.overdoseMissedDose.missedDose}
                </Text>
            </View>

            {/* Manufacturers */}
            <View className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <View className="flex-row items-center mb-3">
                    <Ionicons name="business" size={20} color="#6b7280" />
                    <Text className="text-gray-700 font-semibold ml-2">Manufacturers</Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                    {currentMedicine.manufacturer.map((manufacturer, index) => (
                        <View key={index} className="bg-white rounded-full px-3 py-1 border border-gray-200">
                            <Text className="text-gray-700 text-sm">{manufacturer}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return renderOverview();
            case 'ingredients':
                return renderIngredients();
            case 'sideEffects':
                return renderSideEffects();
            case 'interactions':
                return renderInteractions();
            case 'precautions':
                return renderPrecautions();
            case 'dosage':
                return renderDosageInfo();
            default:
                return renderOverview();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Medicine Selector */}
            {result.medicines.length > 1 && renderMedicineSelector()}

            {/* Section Tabs */}
            {renderSectionTabs()}

            {/* Content */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {renderContent()}
                <View className="h-24" />
            </ScrollView>

            {/* Bottom Actions */}
            <View className="px-6 py-4 bg-white border-t border-gray-200">
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        className="flex-1 bg-gray-100 rounded-2xl p-4 flex-row items-center justify-center"
                        onPress={resetToStart}
                    >
                        <Ionicons name="refresh" size={20} color="#6b7280" />
                        <Text className="text-gray-700 font-medium ml-2">Scan New</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 rounded-2xl overflow-hidden"
                        onPress={() => {
                            Alert.alert('Feature Coming Soon', 'Save and share functionality will be available soon!');
                        }}
                    >
                        <LinearGradient
                            colors={['#00ffc8', '#00e6b8']}
                            className="flex-row p-4 items-center justify-center"
                        >
                            <Feather name="download" size={20} color="#000" />
                            <Text className="text-black font-medium ml-2">Save Report</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default MedicineDisplay;