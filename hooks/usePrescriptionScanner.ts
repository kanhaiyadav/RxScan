import { useState, useCallback } from "react";
import { useMedicineDatabase } from "./useMedicinDatabase";
import { MedicineSearchResult } from "@/types/medicine";

// Types for the API response data structure
interface ApiMedication {
    name?: string;
    dosage?: string;
    quantity?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
    uncertain?: boolean;
}

interface ApiDoctor {
    name?: string;
    qualifications?: string;
    registration_number?: string;
    clinic_name?: string;
    address?: string;
    phone?: string;
}

interface ApiPatient {
    name?: string;
    age?: string;
    gender?: string;
    address?: string;
    prescription_date?: string;
}

interface ApiAdditionalNotes {
    special_instructions?: string;
    follow_up?: string;
    warnings?: string;
}

interface ApiPrescriptionData {
    doctor?: ApiDoctor;
    patient?: ApiPatient;
    medications?: ApiMedication[];
    additional_notes?: ApiAdditionalNotes;
    extraction_notes?: string;
    raw_response?: string;
    note?: string;
}

// Existing hook interfaces (keeping them unchanged for backward compatibility)
interface ExtractedMedicine {
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
    confidence: number;
}

interface PrescriptionScanResult {
    medicines: ExtractedMedicine[];
    doctorName?: string;
    hospitalName?: string;
    prescriptionDate?: string;
    patientName?: string;
    rawText: string;
}

interface PrescriptionAnalysis {
    prescription: PrescriptionScanResult;
    medicineAnalysis: {
        medicine: ExtractedMedicine;
        analysis: MedicineSearchResult | null;
        hasWarnings: boolean;
        warningCount: number;
    }[];
    overallRisk: "low" | "medium" | "high";
    criticalWarnings: string[];
}

export const usePrescriptionScanner = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { analyzeMedicine } = useMedicineDatabase();

    // Convert API response to ExtractedMedicine format
    const convertApiMedicationsToExtracted = useCallback(
        (apiMedications: ApiMedication[]): ExtractedMedicine[] => {
            return apiMedications.map((med) => ({
                name: med.name || "Unknown Medicine",
                dosage: med.dosage || undefined,
                frequency: med.frequency || undefined,
                duration: med.duration || undefined,
                instructions: med.instructions || undefined,
                // Set confidence based on uncertainty flag and available data
                confidence: med.uncertain
                    ? 0.5
                    : med.dosage && med.frequency
                    ? 0.95
                    : med.dosage || med.frequency
                    ? 0.8
                    : 0.7,
            }));
        },
        []
    );

    // Convert API prescription data to PrescriptionScanResult format
    const convertApiDataToPrescriptionResult = useCallback(
        (apiData: ApiPrescriptionData): PrescriptionScanResult => {
            const medicines = apiData.medications
                ? convertApiMedicationsToExtracted(apiData.medications)
                : [];

            // Create a synthetic raw text from the structured data for compatibility
            const rawText = [
                apiData.doctor?.name ? `Dr. ${apiData.doctor.name}` : "",
                apiData.doctor?.clinic_name || "",
                apiData.patient?.name ? `Patient: ${apiData.patient.name}` : "",
                apiData.patient?.age ? `Age: ${apiData.patient.age}` : "",
                apiData.patient?.prescription_date
                    ? `Date: ${apiData.patient.prescription_date}`
                    : "",
                ...medicines.map((med) =>
                    `${med.name} ${med.dosage || ""} ${med.frequency || ""} ${
                        med.instructions || ""
                    }`.trim()
                ),
                apiData.additional_notes?.special_instructions || "",
                apiData.extraction_notes || "",
            ]
                .filter(Boolean)
                .join("\n");

            return {
                medicines,
                doctorName: apiData.doctor?.name || undefined,
                hospitalName: apiData.doctor?.clinic_name || undefined,
                prescriptionDate:
                    apiData.patient?.prescription_date || undefined,
                patientName: apiData.patient?.name || undefined,
                rawText,
            };
        },
        [convertApiMedicationsToExtracted]
    );

    // Extract medicines from OCR text using pattern matching and NLP (keeping original for backward compatibility)
    const extractMedicinesFromText = useCallback(
        (text: string): ExtractedMedicine[] => {
            const medicines: ExtractedMedicine[] = [];
            const lines = text
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0);

            // Common medicine patterns
            const medicinePatterns = [
                // Pattern: Medicine Name + Dosage + Frequency
                /(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?\s*(?:mg|g|ml|mcg|units?))\s+(\d+(?:\s*x\s*|\s+times?\s+|\s*\/\s*)\s*(?:daily|day|weekly|week|monthly|month|od|bd|td|qd|bid|tid|qid))/gi,

                // Pattern: Medicine Name + Dosage
                /(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?\s*(?:mg|g|ml|mcg|units?))/gi,

                // Pattern: Medicine Name + Frequency
                /(\w+(?:\s+\w+)*)\s+(\d+(?:\s*x\s*|\s+times?\s+|\s*\/\s*)\s*(?:daily|day|weekly|week|monthly|month|od|bd|td|qd|bid|tid|qid))/gi,
            ];

            // Common medicine name patterns (Indian market focused)
            const commonMedicineNames = [
                // Antibiotics
                "amoxicillin",
                "azithromycin",
                "ciprofloxacin",
                "doxycycline",
                "cephalexin",
                // Pain relievers
                "paracetamol",
                "ibuprofen",
                "diclofenac",
                "aspirin",
                "tramadol",
                // Diabetes
                "metformin",
                "glimepiride",
                "insulin",
                "gliclazide",
                // Hypertension
                "amlodipine",
                "telmisartan",
                "atenolol",
                "losartan",
                "ramipril",
                // Acid reducers
                "omeprazole",
                "pantoprazole",
                "ranitidine",
                "domperidone",
                // Common Indian brands
                "crocin",
                "combiflam",
                "volini",
                "digene",
                "pudin",
            ];

            // Process each line
            lines.forEach((line, lineIndex) => {
                let processed = false;

                // Try each pattern
                medicinePatterns.forEach((pattern) => {
                    const matches = Array.from(line.matchAll(pattern));
                    matches.forEach((match) => {
                        if (!processed) {
                            const medicine: ExtractedMedicine = {
                                name: match[1].trim(),
                                confidence: 0.8,
                            };

                            // Extract dosage and frequency based on pattern
                            if (match.length > 2) {
                                if (
                                    match[2].match(
                                        /\d+(?:\.\d+)?\s*(?:mg|g|ml|mcg|units?)/i
                                    )
                                ) {
                                    medicine.dosage = match[2].trim();
                                    medicine.frequency = match[3]?.trim();
                                } else if (
                                    match[2].match(
                                        /\d+(?:\s*x\s*|\s+times?\s+|\s*\/\s*)/i
                                    )
                                ) {
                                    medicine.frequency = match[2].trim();
                                }
                            }

                            medicines.push(medicine);
                            processed = true;
                        }
                    });
                });

                // If no pattern matched, try to find medicine names using dictionary
                if (!processed) {
                    commonMedicineNames.forEach((medName) => {
                        if (
                            line.toLowerCase().includes(medName.toLowerCase())
                        ) {
                            const words = line.split(/\s+/);
                            const medIndex = words.findIndex((word) =>
                                word
                                    .toLowerCase()
                                    .includes(medName.toLowerCase())
                            );

                            if (medIndex !== -1) {
                                const medicine: ExtractedMedicine = {
                                    name: words[medIndex],
                                    confidence: 0.6,
                                };

                                // Try to extract dosage and frequency from surrounding words
                                const contextWords = words.slice(
                                    Math.max(0, medIndex - 2),
                                    medIndex + 4
                                );
                                contextWords.forEach((word) => {
                                    if (
                                        word.match(
                                            /\d+(?:\.\d+)?\s*(?:mg|g|ml|mcg|units?)/i
                                        ) &&
                                        !medicine.dosage
                                    ) {
                                        medicine.dosage = word;
                                    }
                                    if (
                                        word.match(
                                            /\d+(?:\s*x\s*|\s+times?\s+)\s*(?:daily|day|od|bd|td)/i
                                        ) &&
                                        !medicine.frequency
                                    ) {
                                        medicine.frequency = word;
                                    }
                                });

                                medicines.push(medicine);
                            }
                        }
                    });
                }
            });

            // Remove duplicates and improve confidence scores
            const uniqueMedicines = medicines.reduce(
                (acc: ExtractedMedicine[], current) => {
                    const existing = acc.find(
                        (med) =>
                            med.name.toLowerCase() ===
                            current.name.toLowerCase()
                    );

                    if (!existing) {
                        // Boost confidence if medicine has dosage info
                        if (current.dosage) current.confidence += 0.1;
                        if (current.frequency) current.confidence += 0.1;

                        acc.push(current);
                    } else if (current.confidence > existing.confidence) {
                        // Replace with higher confidence match
                        Object.assign(existing, current);
                    }

                    return acc;
                },
                []
            );

            return uniqueMedicines.sort((a, b) => b.confidence - a.confidence);
        },
        []
    );

    // Extract prescription metadata (keeping original for backward compatibility)
    const extractPrescriptionMetadata = useCallback(
        (text: string): Partial<PrescriptionScanResult> => {
            const metadata: Partial<PrescriptionScanResult> = {};
            const lines = text.split("\n").map((line) => line.trim());

            lines.forEach((line) => {
                // Doctor name patterns
                if (line.match(/dr\.?\s+\w+/i) && !metadata.doctorName) {
                    const match = line.match(/dr\.?\s+([a-z\s]+)/i);
                    if (match) {
                        metadata.doctorName = match[1].trim();
                    }
                }

                // Hospital/Clinic name (usually appears early in prescription)
                if (
                    line.match(
                        /(hospital|clinic|medical|healthcare|center)/i
                    ) &&
                    !metadata.hospitalName
                ) {
                    metadata.hospitalName = line.trim();
                }

                // Date patterns
                if (
                    line.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/) &&
                    !metadata.prescriptionDate
                ) {
                    const dateMatch = line.match(
                        /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/
                    );
                    if (dateMatch) {
                        metadata.prescriptionDate = dateMatch[1];
                    }
                }

                // Patient name (often after "Name:" or "Patient:")
                if (
                    line.match(/(?:name|patient):\s*([a-z\s]+)/i) &&
                    !metadata.patientName
                ) {
                    const match = line.match(/(?:name|patient):\s*([a-z\s]+)/i);
                    if (match) {
                        metadata.patientName = match[1].trim();
                    }
                }
            });

            return metadata;
        },
        []
    );

    // NEW: Scan and parse prescription from API structured data
    const scanPrescriptionFromApiData = useCallback(
        async (
            apiData: ApiPrescriptionData
        ): Promise<PrescriptionScanResult> => {
            try {
                setLoading(true);
                setError(null);

                const result = convertApiDataToPrescriptionResult(apiData);
                return result;
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to process prescription data";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [convertApiDataToPrescriptionResult]
    );

    // Original: Scan and parse prescription from OCR text
    const scanPrescription = useCallback(
        async (ocrText: string): Promise<PrescriptionScanResult> => {
            try {
                setLoading(true);
                setError(null);

                const medicines = extractMedicinesFromText(ocrText);
                const metadata = extractPrescriptionMetadata(ocrText);

                const result: PrescriptionScanResult = {
                    medicines,
                    rawText: ocrText,
                    ...metadata,
                };

                return result;
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to scan prescription";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [extractMedicinesFromText, extractPrescriptionMetadata]
    );

    // NEW: Analyze prescription from API structured data
    const analyzePrescriptionFromApiData = useCallback(
        async (apiData: ApiPrescriptionData): Promise<PrescriptionAnalysis> => {
            try {
                setLoading(true);
                setError(null);

                // Convert API data to prescription result
                const prescription = await scanPrescriptionFromApiData(apiData);

                // Analyze each medicine
                const medicineAnalysis = [];
                const criticalWarnings: string[] = [];
                let highRiskCount = 0;
                let mediumRiskCount = 0;

                // Add extraction notes as warnings if present
                if (apiData.extraction_notes) {
                    criticalWarnings.push(
                        `Extraction Notes: ${apiData.extraction_notes}`
                    );
                }

                for (const medicine of prescription.medicines) {
                    const analysis = await analyzeMedicine(medicine.name);

                    if (analysis) {
                        const hasWarnings =
                            analysis.warnings.length > 0 ||
                            analysis.allergyWarnings.length > 0;
                        const warningCount =
                            analysis.warnings.length +
                            analysis.allergyWarnings.length;

                        // Count critical warnings
                        interface DrugInteraction {
                            severity:
                                | "contraindicated"
                                | "major"
                                | "moderate"
                                | "minor";
                            description: string;
                            interactionType?:
                                | "drug-allergy"
                                | "drug-drug"
                                | "drug-condition"
                                | "drug-food";
                        }

                        const criticalInteractions: DrugInteraction[] =
                            analysis.interactions.filter(
                                (interaction: DrugInteraction) =>
                                    interaction.severity ===
                                        "contraindicated" ||
                                    interaction.severity === "major"
                            );

                        if (criticalInteractions.length > 0) {
                            highRiskCount++;
                            criticalInteractions.forEach((interaction) => {
                                criticalWarnings.push(
                                    `${medicine.name}: ${interaction.description}`
                                );
                            });
                        } else if (
                            analysis.interactions.some(
                                (i: any) => i.severity === "moderate"
                            )
                        ) {
                            mediumRiskCount++;
                        }

                        medicineAnalysis.push({
                            medicine,
                            analysis,
                            hasWarnings,
                            warningCount,
                        });
                    } else {
                        // Medicine not found in database
                        medicineAnalysis.push({
                            medicine,
                            analysis: null,
                            hasWarnings: true,
                            warningCount: 1,
                        });
                        criticalWarnings.push(
                            `${medicine.name}: Medicine not found in database. Please verify with pharmacist.`
                        );
                    }
                }

                // Check for uncertain medicines from API
                if (apiData.medications) {
                    apiData.medications.forEach((med) => {
                        if (med.uncertain && med.name) {
                            if (
                                !criticalWarnings.some((w) =>
                                    w.includes(med.name!)
                                )
                            ) {
                                criticalWarnings.push(
                                    `${med.name}: Information is uncertain. Please verify with doctor or pharmacist.`
                                );
                            }
                        }
                    });
                }

                // Determine overall risk level
                let overallRisk: "low" | "medium" | "high" = "low";
                if (highRiskCount > 0) {
                    overallRisk = "high";
                } else if (mediumRiskCount > 0 || criticalWarnings.length > 0) {
                    overallRisk = "medium";
                }

                return {
                    prescription,
                    medicineAnalysis,
                    overallRisk,
                    criticalWarnings,
                };
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to analyze prescription";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [scanPrescriptionFromApiData, analyzeMedicine]
    );

    // Original: Analyze complete prescription with medicine database from OCR text
    const analyzePrescription = useCallback(
        async (ocrText: string): Promise<PrescriptionAnalysis> => {
            try {
                setLoading(true);
                setError(null);

                // First scan the prescription
                const prescription = await scanPrescription(ocrText);

                // Analyze each medicine
                const medicineAnalysis = [];
                const criticalWarnings: string[] = [];
                let highRiskCount = 0;
                let mediumRiskCount = 0;

                for (const medicine of prescription.medicines) {
                    const analysis = await analyzeMedicine(medicine.name);

                    if (analysis) {
                        const hasWarnings =
                            analysis.warnings.length > 0 ||
                            analysis.allergyWarnings.length > 0;
                        const warningCount =
                            analysis.warnings.length +
                            analysis.allergyWarnings.length;

                        // Count critical warnings
                        interface DrugInteraction {
                            severity:
                                | "contraindicated"
                                | "major"
                                | "moderate"
                                | "minor";
                            description: string;
                            interactionType?:
                                | "drug-allergy"
                                | "drug-drug"
                                | "drug-condition"
                                | "drug-food";
                        }

                        const criticalInteractions: DrugInteraction[] =
                            analysis.interactions.filter(
                                (interaction: DrugInteraction) =>
                                    interaction.severity ===
                                        "contraindicated" ||
                                    interaction.severity === "major"
                            );

                        if (criticalInteractions.length > 0) {
                            highRiskCount++;
                            criticalInteractions.forEach((interaction) => {
                                criticalWarnings.push(
                                    `${medicine.name}: ${interaction.description}`
                                );
                            });
                        } else if (
                            analysis.interactions.some(
                                (i: any) => i.severity === "moderate"
                            )
                        ) {
                            mediumRiskCount++;
                        }

                        medicineAnalysis.push({
                            medicine,
                            analysis,
                            hasWarnings,
                            warningCount,
                        });
                    } else {
                        // Medicine not found in database
                        medicineAnalysis.push({
                            medicine,
                            analysis: null,
                            hasWarnings: true,
                            warningCount: 1,
                        });
                        criticalWarnings.push(
                            `${medicine.name}: Medicine not found in database. Please verify with pharmacist.`
                        );
                    }
                }

                // Determine overall risk level
                let overallRisk: "low" | "medium" | "high" = "low";
                if (highRiskCount > 0) {
                    overallRisk = "high";
                } else if (mediumRiskCount > 0 || criticalWarnings.length > 0) {
                    overallRisk = "medium";
                }

                return {
                    prescription,
                    medicineAnalysis,
                    overallRisk,
                    criticalWarnings,
                };
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to analyze prescription";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [scanPrescription, analyzeMedicine]
    );

    // Validate prescription against user profile
    const validatePrescription = useCallback(
        async (analysis: PrescriptionAnalysis) => {
            const validationResults = {
                allergyConflicts: [] as string[],
                drugInteractions: [] as string[],
                conditionWarnings: [] as string[],
                dietaryConflicts: [] as string[],
                isValid: true,
            };

            analysis.medicineAnalysis.forEach(
                ({ medicine, analysis: medAnalysis }) => {
                    if (medAnalysis) {
                        medAnalysis.interactions.forEach((interaction: any) => {
                            switch (interaction.interactionType) {
                                case "drug-allergy":
                                    validationResults.allergyConflicts.push(
                                        `${medicine.name}: ${interaction.description}`
                                    );
                                    validationResults.isValid = false;
                                    break;
                                case "drug-drug":
                                    validationResults.drugInteractions.push(
                                        `${medicine.name}: ${interaction.description}`
                                    );
                                    if (
                                        interaction.severity ===
                                            "contraindicated" ||
                                        interaction.severity === "major"
                                    ) {
                                        validationResults.isValid = false;
                                    }
                                    break;
                                case "drug-condition":
                                    validationResults.conditionWarnings.push(
                                        `${medicine.name}: ${interaction.description}`
                                    );
                                    if (
                                        interaction.severity ===
                                            "contraindicated" ||
                                        interaction.severity === "major"
                                    ) {
                                        validationResults.isValid = false;
                                    }
                                    break;
                                case "drug-food":
                                    validationResults.dietaryConflicts.push(
                                        `${medicine.name}: ${interaction.description}`
                                    );
                                    break;
                            }
                        });
                    }
                }
            );

            return validationResults;
        },
        []
    );

    return {
        loading,
        error,
        // Original methods (for backward compatibility)
        scanPrescription,
        analyzePrescription,
        validatePrescription,
        extractMedicinesFromText,
        // New methods for API data
        scanPrescriptionFromApiData,
        analyzePrescriptionFromApiData,
        convertApiDataToPrescriptionResult,
    };
};
