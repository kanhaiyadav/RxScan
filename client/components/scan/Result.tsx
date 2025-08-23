import {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    ActionsheetScrollView
} from "@/components/ui/actionsheet";
import { Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Skeleton, SkeletonText } from "@/components/ui/skeleton"
import { HStack } from "../ui/hstack";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getSeverityColor, getSeverityTextColor } from "@/lib/utils";
import { MedicineSearchResult, PrescriptionData } from "@/types/prescription";
import { useRouter } from "expo-router";

interface Props {
    ocrResult: PrescriptionData;
    result: MedicineSearchResult;
    resetToStart?: () => void;
    loading?: boolean;
    savePrescription?: () => void;
    prescriptionId?: string;
}

const MedicineDisplay: React.FC<Props> = ({ ocrResult, result, resetToStart, loading, savePrescription, prescriptionId }) => {
    console.log(JSON.stringify(ocrResult, null, 2));

    const router = useRouter();

    const [selectedMedicine, setSelectedMedicine] = useState(0);
    const [activeSection, setActiveSection] = useState<string>('overview');

    const currentMedicine = result.medicines[selectedMedicine];

    const [showActionsheet, setShowActionsheet] = React.useState(false)
    const handleClose = () => setShowActionsheet(false)

    const getMedicineData = useMemo(() => {
        return (name: string, index: number) => {
            let medicine = result.medicines.find(m => m.medicalInfo.name.toLowerCase() === name.toLowerCase());
            return medicine || result.medicines[index];
        };
    }, [result.medicines]);

    const sections = [
        { id: 'overview', title: 'Overview', icon: 'information-circle' },
        { id: 'healthConflicts', title: 'Health Conflicts', icon: 'warning' },
        { id: 'ingredients', title: 'Ingredients', icon: 'flask' },
        { id: 'sideEffects', title: 'Side Effects', icon: 'warning' },
        { id: 'interactions', title: 'Interactions', icon: 'link' },
        { id: 'precautions', title: 'Precautions', icon: 'shield-checkmark' },
        { id: 'dosage', title: 'Dosage Info', icon: 'medical' },
    ];

    const renderInfoItem = (label: string, value?: string): React.ReactNode => {
        if (!value || value === 'null') return null;

        return (
            <View className="flex-row mb-3 px-1">
                <Text className="font-semibold text-gray-700 min-w-[100px] mr-3">{label}:</Text>
                <Text className="text-gray-900 flex-1 font-medium">{value}</Text>
            </View>
        );
    };

    const renderMedicineSelector = () => {
        const getMedSeverityColor = (name: string) => {
            const medicine = result.medicines.find(m => m.medicalInfo.name.toLowerCase() === name.toLowerCase());
            if (!medicine) return 'bg-green-100 border-green-400';

            if (medicine.medicalInfo.healthProfileInteraction.hasInteractions) {
                if (medicine.medicalInfo.healthProfileInteraction.overallRisk === 'critical') {
                    return 'bg-red-200 border-red-600 border-2';
                } else if (medicine.medicalInfo.healthProfileInteraction.overallRisk === 'high') {
                    return 'bg-red-100 border-red-400';
                } else if (medicine.medicalInfo.healthProfileInteraction.overallRisk === 'moderate') {
                    return 'bg-orange-200 border-orange-600';
                } else if (medicine.medicalInfo.healthProfileInteraction.overallRisk === 'low') {
                    return 'bg-yellow-100 border-yellow-400';
                }
            }

            return 'bg-green-100 border-green-400';
        };

        return (
            <View className="py-3 gap-2 px-1">
                {ocrResult.medications?.map((medicine: {
                    name: string;
                    uncertain?: boolean;
                    duration?: string;
                    instructions?: string;
                    frequency?: string;
                }, index: number) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => {
                            setSelectedMedicine(index)
                            setShowActionsheet(true)
                        }}
                        className={`p-4 rounded-xl ${medicine.uncertain ? 'bg-red-100 border-red-400' : getMedSeverityColor(medicine.name)} border border-gray-200`}
                    >
                        <Text className="font-medium text-black">
                            {medicine.name}
                        </Text>
                        <View className='flex-row mt-1'>
                            {medicine.uncertain && (
                                <View className="flex-row gap-1">
                                    <Text className='text-red-500 text-sm'>Uncertain</Text>
                                    <Text className='text-sm'>|</Text>
                                </View>
                            )}
                            {medicine.duration && (
                                <Text className='text-gray-500 text-sm'>Duration: {medicine.duration}</Text>
                            )}
                            {medicine.instructions && (
                                <Text className='text-gray-500 text-sm'> | {medicine.instructions}</Text>
                            )}
                        </View>

                        {medicine.frequency && (
                            <Text className='text-gray-500 text-sm'>{medicine.frequency}</Text>
                        )}

                        {getMedicineData(medicine.name, index).medicalInfo.healthProfileInteraction.overallRisk !== 'minimal' && (
                            <Text className="mt-2 text-gray-600">Health Profile Conflicts:</Text>
                        )}

                        <HStack className="gap-1 mt-1">
                            {getMedicineData(medicine.name, index).medicalInfo.healthProfileInteraction.criticalCount > 0 && (
                                <TouchableOpacity className="flex-row items-center px-3 py-1 rounded-xl bg-red-500">
                                    <Text className="text-white">{getMedicineData(medicine.name, index).medicalInfo.healthProfileInteraction.criticalCount}</Text>
                                    <Text className="ml-2 font-medium text-sm text-white">
                                        critical
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {getMedicineData(medicine.name, index).medicalInfo.healthProfileInteraction.highCount > 0 && (
                                <TouchableOpacity className="flex-row items-center px-3 py-1 rounded-xl bg-orange-500">
                                    <Text className="text-white">{getMedicineData(medicine.name, index).medicalInfo.healthProfileInteraction.highCount}</Text>
                                    <Text className="ml-2 font-medium text-sm text-white">
                                        high
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {getMedicineData(medicine.name, index).medicalInfo.healthProfileInteraction.moderateCount > 0 && (
                                <TouchableOpacity className="flex-row items-center px-3 py-1 rounded-xl bg-yellow-500">
                                    <Text className="text-white">{getMedicineData(medicine.name, index).medicalInfo.healthProfileInteraction.moderateCount}</Text>
                                    <Text className="ml-2 font-medium text-sm text-white">
                                        moderate
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {getMedicineData(medicine.name, index).medicalInfo.healthProfileInteraction.lowCount > 0 && (
                                <TouchableOpacity className="flex-row items-center px-3 py-1 rounded-xl bg-cyan-500">
                                    <Text className="text-white">{getMedicineData(medicine.name, index).medicalInfo.healthProfileInteraction.lowCount}</Text>
                                    <Text className="ml-2 font-medium text-sm text-white">
                                        low
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </HStack>
                    </TouchableOpacity>
                ))}
            </View>
        )
    };

    const renderSectionTabs = () => (
        <View className="py-3 bg-white border-b border-gray-100">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                    {sections.map((section) => (
                        <TouchableOpacity
                            key={section.id}
                            onPress={() => {
                                if (loading) return;
                                setActiveSection(section.id)
                            }}
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
                            <Text className={`ml-2 font-medium text-sm ${activeSection === section.id ? 'text-black' : 'text-gray-600'}`}>
                                {section.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    const renderOverview = () => (
        <View className="pb-4 gap-4">
            {/* Medicine Header */}
            <View className="bg-gradient-to-r from-[#00ffc8] to-[#00e6b8] rounded-2xl p-4">
                {loading ? (
                    <SkeletonText _lines={1} className="h-[25px] mb-2 w-[60%] rounded-lg" speed={4} />
                ) : (
                    <Text className="text-2xl font-bold text-black mb-2">
                        {currentMedicine.medicalInfo.name}
                    </Text>
                )}
                {loading ? (
                    <View className="flex-row flex-wrap gap-2 mb-3">
                        <Skeleton className="h-[20px] w-[120px] rounded-full" speed={4} />
                        <Skeleton className="h-[20px] w-[140px] rounded-full" speed={4} />
                        <Skeleton className="h-[20px] w-[90px] rounded-full" speed={4} />
                    </View>
                ) : (
                    <View className="flex-row flex-wrap gap-2 mb-3">
                        <View className="bg-black/10 rounded-full px-3 py-1">
                            <Text className="text-black font-medium text-xs">
                                {currentMedicine.medicalInfo.dosageForm}
                            </Text>
                        </View>
                        {currentMedicine.medicalInfo.prescriptionRequired && (
                            <View className="bg-black/10 rounded-full px-3 py-1">
                                <Text className="text-black font-medium text-xs">Prescription Required</Text>
                            </View>
                        )}
                        {currentMedicine.medicalInfo.fdaApproved && (
                            <View className="bg-black/10 rounded-full px-3 py-1">
                                <Text className="text-black font-medium text-xs">FDA Approved</Text>
                            </View>
                        )}
                    </View>
                )}
                {loading ? (
                    <SkeletonText _lines={3} className="h-[18px] mb-[-1] w-full rounded-lg" speed={4} />
                ) : (
                    <Text className="text-black/80 text-base leading-6">
                        <Text className="font-bold">Primary uses:</Text>
                        <Text> {currentMedicine.medicalInfo.uses.join(', ')}</Text>
                    </Text>
                )}
            </View>

            {/* Quick Stats */}
            {loading ? (
                <View className="flex-row gap-3">
                    <Skeleton className="h-[90px] flex-1 rounded-lg" speed={4} />
                    <Skeleton className="h-[90px] flex-1 rounded-lg" speed={4} />
                    <Skeleton className="h-[90px] flex-1 rounded-lg" speed={4} />
                </View>
            ) : (
                <View className="flex-row gap-3">
                    <View className="flex-1 bg-red-100 rounded-xl p-4">
                        <MaterialIcons name="report-gmailerrorred" size={24} color="red" />
                        <Text className="text-red-600 font-semibold m-auto text-4xl">{currentMedicine.medicalInfo.healthProfileInteraction.criticalCount + currentMedicine.medicalInfo.healthProfileInteraction.moderateCount + currentMedicine.medicalInfo.healthProfileInteraction.highCount}</Text>
                        <Text className="text-red-600 text-sm">Health Conflicts</Text>
                    </View>
                    <View className="flex-1 bg-orange-50 rounded-xl p-4">
                        <Ionicons name="warning" size={24} color="#f97316" />
                        <Text className="text-orange-600 font-semibold m-auto text-4xl">
                            {currentMedicine.medicalInfo.sideEffects.common.length + currentMedicine.medicalInfo.sideEffects.serious.length}
                        </Text>
                        <Text className="text-orange-600 text-sm text-center">Side Effects</Text>
                    </View>
                    <View className="flex-1 bg-green-50 rounded-xl p-4">
                        <Ionicons name="business" size={24} color="#10b981" />
                        <Text className="text-green-600 font-semibold m-auto text-4xl">{currentMedicine.medicalInfo.manufacturer.length}</Text>
                        <Text className="text-green-600 text-sm text-center">Manufacturers</Text>
                    </View>
                </View>
            )}

            {/* Price Info */}
            {loading ? (
                <Skeleton className="h-[80px] rounded-lg" />
            ) : (
                currentMedicine.medicalInfo.approximatePrice &&
                <View className="bg-white border border-gray-200 rounded-xl p-4">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-lg font-bold text-gray-900">
                                {currentMedicine.medicalInfo.approximatePrice.priceRange}
                            </Text>
                            <Text className="text-gray-600 text-sm">
                                {currentMedicine.medicalInfo.approximatePrice.unit}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Manufacturers */}
            {loading ? (
                <Skeleton className="h-[80px] rounded-lg" />
            ) : (
                currentMedicine.medicalInfo.manufacturer.length > 0 &&
                <View className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="business" size={20} color="#6b7280" />
                        <Text className="text-gray-700 font-semibold ml-2">Manufacturers</Text>
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                        {currentMedicine.medicalInfo.manufacturer.map((manufacturer, index) => (
                            <View key={index} className="bg-white rounded-full px-3 py-1 border border-gray-200">
                                <Text className="text-gray-700 text-sm">{manufacturer}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );

    const renderIngredients = () => (
        <View className="p-4 gap-3">
            {currentMedicine.medicalInfo.activeIngredients.map((ingredient, index) => (
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
        <View className="p-4 gap-4">
            {currentMedicine.medicalInfo.sideEffects.common.length > 0 && (
                <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="information-circle" size={20} color="#3b82f6" />
                        <Text className="text-blue-700 font-semibold ml-2">Common Side Effects</Text>
                    </View>
                    {currentMedicine.medicalInfo.sideEffects.common.map((effect, index) => (
                        <Text key={index} className="text-blue-700 mb-1">• {effect}</Text>
                    ))}
                </View>
            )}

            {currentMedicine.medicalInfo.sideEffects.serious.length > 0 && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="warning" size={20} color="#ef4444" />
                        <Text className="text-red-700 font-semibold ml-2">Serious Side Effects</Text>
                    </View>
                    {currentMedicine.medicalInfo.sideEffects.serious.map((effect, index) => (
                        <Text key={index} className="text-red-700 mb-1 leading-5">• {effect}</Text>
                    ))}
                </View>
            )}
        </View>
    );

    const renderInteractions = () => (
        <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
            <View className="gap-4">
                {/* Drug Interactions */}
                {currentMedicine.medicalInfo.interactions.drugInteractions.length > 0 && (
                    <View className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="medical" size={20} color="#f97316" />
                            <Text className="text-orange-700 font-semibold ml-2">Drug Interactions</Text>
                        </View>
                        {currentMedicine.medicalInfo.interactions.drugInteractions.map((interaction, index) => (
                            <Text key={index} className="text-orange-700 mb-2 leading-5">• {interaction}</Text>
                        ))}
                    </View>
                )}

                {/* Food Interactions */}
                {currentMedicine.medicalInfo.interactions.foodInteractions.length > 0 && (
                    <View className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="restaurant" size={20} color="#10b981" />
                            <Text className="text-green-700 font-semibold ml-2">Food Interactions</Text>
                        </View>
                        {currentMedicine.medicalInfo.interactions.foodInteractions.map((interaction, index) => (
                            <Text key={index} className="text-green-700 mb-2 leading-5">• {interaction}</Text>
                        ))}
                    </View>
                )}

                {/* Condition Interactions */}
                {currentMedicine.medicalInfo.interactions.conditionInteractions.length > 0 && (
                    <View className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="fitness" size={20} color="#8b5cf6" />
                            <Text className="text-purple-700 font-semibold ml-2">Medical Conditions</Text>
                        </View>
                        {currentMedicine.medicalInfo.interactions.conditionInteractions.map((condition, index) => (
                            <Text key={index} className="text-purple-700 mb-2 leading-5">• {condition}</Text>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );

    const renderPrecautions = () => (
        <View className="p-4 gap-3">
            {currentMedicine.medicalInfo.warningsAndPrecautions.map((precaution, index) => (
                <View key={index} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <View className="flex-row items-start">
                        <Ionicons name="shield-checkmark" size={20} color="#f59e0b" style={{ marginTop: 2, marginRight: 12 }} />
                        <Text className="text-yellow-800 leading-6 flex-1">
                            {precaution}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );

    const renderDosageInfo = () => (
        <View className="p-4 gap-4">
            {/* Overdose Info */}
            <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                <View className="flex-row items-center mb-3">
                    <Ionicons name="alert-circle" size={20} color="#ef4444" />
                    <Text className="text-red-700 font-semibold ml-2">Overdose Information</Text>
                </View>
                <Text className="text-red-700 leading-6">
                    {currentMedicine.medicalInfo.overdoseMissedDose.overdose}
                </Text>
            </View>

            {/* Missed Dose Info */}
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <View className="flex-row items-center mb-3">
                    <Ionicons name="time" size={20} color="#3b82f6" />
                    <Text className="text-blue-700 font-semibold ml-2">Missed Dose</Text>
                </View>
                <Text className="text-blue-700 leading-6">
                    {currentMedicine.medicalInfo.overdoseMissedDose.missedDose}
                </Text>
            </View>
        </View>
    );

    const renderHealthConflicts = () => (
        <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
            <View className="gap-4">
                {['allergy', 'medical_condition', 'current_medication', 'dietary_restriction'].map((type) => {
                    const interactions = currentMedicine.medicalInfo.healthProfileInteraction.interactions.filter((interaction) => interaction.type === type);
                    return (
                        <View key={type}>
                            {interactions.length > 0 && (
                                <View className="flex-row items-center mb-3">
                                    {type === 'allergy' && <Ionicons name="warning" size={20} color="black" />}
                                    {type === 'medical_condition' && <FontAwesome5 name="procedures" size={20} color="black" />}
                                    {type === 'current_medication' && <FontAwesome5 name="pills" size={20} color="black" />}
                                    {type === 'dietary_restriction' && <FontAwesome5 name="utensils" size={20} color="black" />}
                                    <Text className="text-black font-semibold ml-2">{type}</Text>
                                </View>
                            )}
                            {interactions.map((interaction, index) => (
                                <View key={index} className={`${getSeverityColor(interaction.severity)} border rounded-xl p-4 mb-2`}>
                                    <Text className={`${getSeverityTextColor(interaction.severity)} font-bold ml-2`}>{interaction.item}</Text>
                                    <Text className={`${getSeverityTextColor(interaction.severity)} mb-2 leading-5 ml-3`}>{interaction.description}</Text>
                                    <Text className="ml-2 font-semibold">Recommendation: </Text>
                                    <Text className="text-gray-600 ml-3">{interaction.recommendation}</Text>
                                </View>
                            ))}
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return renderOverview();
            case 'healthConflicts':
                return renderHealthConflicts();
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
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false} className="px-6">
                <View className="pt-[20px]">

                    {/* Doctor Information */}
                    {ocrResult.doctor && (
                        <View>
                            <View className="flex-row items-center mb-4">
                                <LinearGradient
                                    colors={['#00ffc8', '#00e6b8']}
                                    className="w-12 h-12 items-center justify-center mr-4"
                                    style={{ borderRadius: 10 }}
                                >
                                    <FontAwesome6 name="user-doctor" size={24} color="white" />
                                </LinearGradient>
                                <Text className="text-lg font-bold text-gray-900">Doctor Information</Text>
                            </View>
                            <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
                                {renderInfoItem('Name', ocrResult.doctor.name)}
                                {renderInfoItem('Qualifications', ocrResult.doctor.qualifications)}
                                {renderInfoItem('Registration', ocrResult.doctor.registration_number)}
                                {renderInfoItem('Clinic', ocrResult.doctor.clinic_name)}
                                {renderInfoItem('Address', ocrResult.doctor.address)}
                                {renderInfoItem('Phone', ocrResult.doctor.phone)}
                            </View>
                        </View>
                    )}

                    {/* Patient Information */}
                    {ocrResult.patient && (
                        <View className="pt-3 mb-3 shadow-sm">
                            <View className="flex-row items-center mb-2">
                                <LinearGradient
                                    colors={['#00ffc8', '#00e6b8']}
                                    className="w-12 h-12 items-center justify-center mr-4"
                                    style={{ borderRadius: 10 }}
                                >
                                    <Fontisto name="bed-patient" size={24} color="white" />
                                </LinearGradient>
                                <Text className="text-lg font-bold text-gray-900">Patient Information</Text>
                            </View>
                            <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
                                {renderInfoItem('Name', ocrResult.patient.name)}
                                {renderInfoItem('Age', ocrResult.patient.age)}
                                {renderInfoItem('Gender', ocrResult.patient.gender)}
                                {renderInfoItem('Address', ocrResult.patient.address)}
                                {renderInfoItem('Date', ocrResult.patient.prescription_date)}
                            </View>
                        </View>
                    )}

                </View>

                <View className="flex-row items-center">
                    <LinearGradient
                        colors={['#00ffc8', '#00e6b8']}
                        className="w-12 h-12 items-center justify-center mr-4"
                        style={{ borderRadius: 10 }}
                    >
                        <MaterialCommunityIcons name="pill" size={24} color="white" />
                    </LinearGradient>
                    <Text className="text-lg font-bold text-gray-900">Medicines Recognised</Text>
                </View>

                {/* Medicine Selector */}
                {result.medicines.length > 1 && renderMedicineSelector()}

                {/* Additional Notes */}
                {ocrResult.additional_notes?.follow_up || ocrResult.additional_notes?.special_instructions || ocrResult.additional_notes?.warnings && (
                    <View className="mt-4">
                        <View className="flex-row items-center mb-4">
                            <LinearGradient
                                colors={['#00ffc8', '#00e6b8']}
                                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                                style={{ borderRadius: 10 }}
                            >
                                <Ionicons name="document-text" size={24} color="#6b7280" />
                            </LinearGradient>
                            <Text className="text-lg font-bold text-gray-900">Additional Notes</Text>
                        </View>
                        <View className="gap-2 bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
                            {renderInfoItem('Special Instructions', ocrResult.additional_notes.special_instructions)}
                            {renderInfoItem('Follow-up', ocrResult.additional_notes.follow_up)}
                            {renderInfoItem('Warnings', ocrResult.additional_notes.warnings)}
                        </View>
                    </View>
                )}

                {/* Extraction Notes */}
                {ocrResult.extraction_notes && (
                    <View className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-12">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="information-circle" size={20} color="#6b7280" />
                            <Text className="text-lg font-bold text-gray-700 ml-2">Extraction Notes</Text>
                        </View>
                        <Text className="text-gray-800">{ocrResult.extraction_notes}</Text>
                    </View>
                )}

                <TouchableOpacity className="bg-primary-400 text-white flex-row items-center rounded-lg p-4 w-full justify-center gap-2 mt-4 mb-8"
                    onPress={() => {
                        router.push({
                            pathname: '/(dashboard)/prescription/tts',
                            params: { prescriptionId: prescriptionId }
                        })
                    }}
                >
                    <Ionicons name='volume-high' size={24} color={'white'} />
                    <Text className="text-xl font-semibold text-white">Hear Out</Text>
                </TouchableOpacity>

                {/* Bottom Actions */}
                {
                    savePrescription &&
                    <View className="py-4">
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="flex-1 bg-white rounded-2xl p-4 flex-row items-center justify-center"
                                style={{ elevation: 1 }}
                                onPress={resetToStart}
                            >
                                <Ionicons name="refresh" size={20} color="#6b7280" />
                                <Text className="text-gray-700 font-medium ml-2">Scan New</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 rounded-2xl overflow-hidden"
                                onPress={() => {
                                    savePrescription?.();
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
                }
            </ScrollView>

            <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
                <ActionsheetBackdrop />
                <ActionsheetContent>
                    <ActionsheetDragIndicatorWrapper>
                        <ActionsheetDragIndicator />
                    </ActionsheetDragIndicatorWrapper>
                    <ActionsheetScrollView horizontal showsHorizontalScrollIndicator={false} className="border-b border-gray-200 mb-2">
                        {renderSectionTabs()}
                    </ActionsheetScrollView>
                    <ActionsheetScrollView className="max-h-[600px] overflow-auto" showsVerticalScrollIndicator={false}>
                        {renderContent()}
                    </ActionsheetScrollView>
                </ActionsheetContent>
            </Actionsheet>
        </SafeAreaView>
    );
};

export default MedicineDisplay;