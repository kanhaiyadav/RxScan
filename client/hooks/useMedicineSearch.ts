import { Citations, CombinedMedicine, MedicineSearchResult, PrescriptionInput, Source, UseMedicineSearchReturn, UseMedicineSearchState } from "@/types/prescription";
import { GoogleGenAI } from "@google/genai";
import { useCallback, useState } from "react";


// Main hook
export const useMedicineSearch = (apiKey: string): UseMedicineSearchReturn => {
    const [state, setState] = useState<UseMedicineSearchState>({
        loading: false,
        error: null,
        searchResult: null,
    });

    // Helper function to create enhanced search prompt
    const createEnhancedSearchPrompt = useCallback(
        (prescriptionData: PrescriptionInput): string => {
            const { prescription_medications, health_profile } =
                prescriptionData;

            const medicineList = prescription_medications
                .map(
                    (med) =>
                        `"${med.name}" (${med.dosage || "standard dosage"})`
                )
                .join(", ");

            const allergiesList = health_profile.allergies.join(", ");
            const conditionsList = health_profile.medicalConditions.join(", ");
            const currentMedsList = health_profile.currentMedications
                .map((med) => `${med.name} (${med.dosage})`)
                .join(", ");
            const dietaryRestrictionsList =
                health_profile.dietaryRestrictions.join(", ");

            return `
You are a medical AI assistant analyzing prescription medications against a patient's health profile. 

PRESCRIPTION MEDICATIONS TO ANALYZE: ${medicineList}

PATIENT HEALTH PROFILE:
- Allergies: ${allergiesList}
- Medical Conditions: ${conditionsList}
- Current Medications: ${currentMedsList}
- Dietary Restrictions: ${dietaryRestrictionsList}
- Additional Notes: ${health_profile.additionalNotes}

For EACH prescribed medicine, provide comprehensive analysis including interactions with the patient's health profile.

Return response in this EXACT JSON structure:

{
  "medicines": [
    {
      "name": "exact medicine name",
      "imageUrl": "URL to official medicine image if available, or null",
      "uses": ["primary use 1", "primary use 2", "primary use 3"],
      "sideEffects": {
        "common": ["side effect 1", "side effect 2"],
        "serious": ["serious side effect 1", "serious side effect 2"],
        "rare": ["rare side effect 1"]
      },
      "warningsAndPrecautions": [
        "warning 1",
        "precaution 1",
        "contraindication 1"
      ],
      "interactions": {
        "drugInteractions": ["interacting drug 1", "interacting drug 2"],
        "foodInteractions": ["food/drink to avoid"],
        "conditionInteractions": ["medical condition that contraindicates"]
      },
      "overdoseMissedDose": {
        "overdose": "what to do in case of overdose",
        "missedDose": "what to do if dose is missed"
      },
      "approximatePrice": {
        "currency": "USD",
        "priceRange": "low-high estimate",
        "unit": "per tablet/bottle/pack",
        "lastUpdated": "2024/2025"
      },
      "manufacturer": ["primary manufacturer", "other manufacturers"],
      "activeIngredients": [
        {
          "name": "ingredient name",
          "strength": "dosage amount",
          "purpose": "what this ingredient does"
        }
      ],
      "dosageForm": "tablet/capsule/syrup/gel",
      "prescriptionRequired": true/false,
      "genericAvailable": true/false,
      "fdaApproved": true/false,
      "lastUpdated": "current date when searched",
      "healthProfileInteraction": {
        "hasInteractions": true/false,
        "criticalCount": 0,
        "highCount": 0,
        "moderateCount": 0,
        "lowCount": 0,
        "interactions": [
          {
            "type": "allergy|medical_condition|current_medication|dietary_restriction",
            "item": "specific allergy/condition/medication/restriction name",
            "description": "detailed description of the interaction",
            "severity": "critical|high|moderate|low|info",
            "recommendation": "specific action to take"
          }
        ],
        "overallRisk": "critical|high|moderate|low|minimal",
        "summary": "overall interaction summary for this medicine"
      }
    }
  ],
  "searchMetadata": {
    "searchDate": "current date",
    "sourcesCount": "number of sources used",
    "reliability": "high|medium|low",
    "totalInteractions": 0,
    "criticalInteractions": 0,
    "overallRiskLevel": "critical|high|moderate|low|minimal"
  },
  "overallHealthAnalysis": {
    "riskLevel": "critical|high|moderate|low|minimal",
    "summary": "overall analysis of all prescription medications against health profile",
    "keyRecommendations": [
      "most important recommendation 1",
      "most important recommendation 2"
    ],
    "requiresImmediateAttention": true/false
  }
}

SEVERITY LEVEL GUIDELINES:
- CRITICAL: Life-threatening interactions, absolute contraindications, severe allergic reactions
- HIGH: Serious interactions requiring immediate medical consultation, dose adjustments
- MODERATE: Interactions requiring monitoring, potential side effects increase
- LOW: Minor interactions, enhanced monitoring recommended
- INFO: General information, no immediate action needed

INTERACTION ANALYSIS REQUIREMENTS:
1. Check each prescribed medicine against ALL patient allergies
2. Analyze interactions with ALL current medications (drug-drug interactions)
3. Evaluate contraindications with ALL medical conditions
4. Assess compatibility with ALL dietary restrictions
5. Consider cumulative effects of multiple medications
6. Identify potential synergistic or antagonistic effects
7. Flag any duplicate therapeutic classes
8. Consider age, kidney/liver function impacts

SEARCH REQUIREMENTS:
1. Use most current 2024-2025 medical information
2. Verify from multiple authoritative medical sources
3. Cross-reference interaction databases
4. Include FDA warnings and contraindications
5. Consider both generic and brand name interactions
6. Factor in dosage-dependent interactions

Return ONLY the JSON object, no additional text or markdown formatting.
            `;
        },
        []
    );

    // Helper function to extract citations (unchanged)
    const extractCitations = useCallback((response: any): Citations => {
        if (!response.candidates?.[0]?.groundingMetadata) {
            return {
                sources: [],
                queries: [],
                hasGrounding: false,
            };
        }

        const grounding = response.candidates[0].groundingMetadata;

        const sources: Source[] = [];
        if (grounding.groundingChunks) {
            grounding.groundingChunks.forEach((chunk: any, index: number) => {
                sources.push({
                    index: index + 1,
                    title: chunk.web?.title || "Unknown Source",
                    url: chunk.web?.uri || "",
                    domain: chunk.web?.uri
                        ? new URL(chunk.web.uri).hostname
                        : "unknown",
                });
            });
        }

        return {
            sources: sources,
            queries: grounding.webSearchQueries || [],
            hasGrounding: true,
        };
    }, []);

    // Helper function for fallback parsing with health profile structure
    const fallbackParseResponse = useCallback(
        (responseText: string, originalData: PrescriptionInput): any => {
            return {
                medicines: originalData.prescription_medications.map((med) => ({
                    name: med.name,
                    imageUrl: null,
                    uses: [],
                    sideEffects: { common: [], serious: [], rare: [] },
                    warningsAndPrecautions: [],
                    interactions: {
                        drugInteractions: [],
                        foodInteractions: [],
                        conditionInteractions: [],
                    },
                    overdoseMissedDose: {
                        overdose: null,
                        missedDose: null,
                    },
                    approximatePrice: null,
                    manufacturer: [],
                    activeIngredients: [],
                    dosageForm: null,
                    prescriptionRequired: null,
                    genericAvailable: null,
                    fdaApproved: null,
                    lastUpdated: null,
                    healthProfileInteraction: {
                        hasInteractions: false,
                        criticalCount: 0,
                        highCount: 0,
                        moderateCount: 0,
                        lowCount: 0,
                        interactions: [],
                        overallRisk: "minimal",
                        summary: "Analysis unavailable due to parsing error",
                    },
                })),
                searchMetadata: {
                    searchDate: new Date().toISOString(),
                    sourcesCount: 0,
                    reliability: "low",
                    parseError: "Failed to parse structured response",
                    totalInteractions: 0,
                    criticalInteractions: 0,
                    overallRiskLevel: "unknown",
                },
                overallHealthAnalysis: {
                    riskLevel: "minimal",
                    summary:
                        "Health profile analysis unavailable due to parsing error",
                    keyRecommendations: [
                        "Consult healthcare provider for proper medication review",
                    ],
                    requiresImmediateAttention: false,
                },
            };
        },
        []
    );

    // Updated helper function to combine data with health profile analysis
    const combineWithOriginalData = useCallback(
        (
            medicineData: any,
            originalData: PrescriptionInput,
            citationData: Citations
        ): MedicineSearchResult => {
            const combinedMedicines: CombinedMedicine[] = [];

            originalData.prescription_medications.forEach((original) => {
                // Find matching medicine in searched data
                const searchedMedicine = medicineData.medicines?.find(
                    (med: any) =>
                        med.name
                            .toLowerCase()
                            .includes(original.name.toLowerCase()) ||
                        original.name
                            .toLowerCase()
                            .includes(med.name.toLowerCase())
                );

                combinedMedicines.push({
                    prescription: original,
                    medicalInfo: searchedMedicine || {
                        name: original.name,
                        imageUrl: null,
                        uses: [],
                        sideEffects: { common: [], serious: [], rare: [] },
                        warningsAndPrecautions: [],
                        interactions: {
                            drugInteractions: [],
                            foodInteractions: [],
                            conditionInteractions: [],
                        },
                        overdoseMissedDose: {
                            overdose: null,
                            missedDose: null,
                        },
                        approximatePrice: null,
                        manufacturer: [],
                        activeIngredients: [],
                        dosageForm: null,
                        prescriptionRequired: null,
                        genericAvailable: null,
                        fdaApproved: null,
                        lastUpdated: null,
                        searchStatus: "not_found",
                        healthProfileInteraction: {
                            hasInteractions: false,
                            criticalCount: 0,
                            highCount: 0,
                            moderateCount: 0,
                            lowCount: 0,
                            interactions: [],
                            overallRisk: "minimal",
                            summary: "No data available for this medication",
                        },
                    },
                });
            });

            // Calculate overall statistics
            const totalInteractions = combinedMedicines.reduce(
                (sum, med) =>
                    sum +
                    (med.medicalInfo.healthProfileInteraction?.interactions
                        ?.length || 0),
                0
            );

            const criticalInteractions = combinedMedicines.reduce(
                (sum, med) =>
                    sum +
                    (med.medicalInfo.healthProfileInteraction?.criticalCount ||
                        0),
                0
            );

            return {
                medicines: combinedMedicines,
                searchMetadata: {
                    ...medicineData.searchMetadata,
                    searchDate: new Date().toISOString(),
                    originalCount: originalData.prescription_medications.length,
                    foundCount: combinedMedicines.filter(
                        (m) => m.medicalInfo.searchStatus !== "not_found"
                    ).length,
                    totalInteractions,
                    criticalInteractions,
                    overallRiskLevel:
                        medicineData.searchMetadata?.overallRiskLevel ||
                        "unknown",
                },
                citations: citationData,
                overallHealthAnalysis: medicineData.overallHealthAnalysis || {
                    riskLevel: "minimal",
                    summary: "Overall health analysis not available",
                    keyRecommendations: ["Consult healthcare provider"],
                    requiresImmediateAttention: criticalInteractions > 0,
                },
            };
        },
        []
    );

    // Updated helper function to create error response
    const createErrorResponse = useCallback(
        (
            originalData: PrescriptionInput,
            errorMessage: string
        ): MedicineSearchResult => {
            return {
                medicines: originalData.prescription_medications.map((med) => ({
                    prescription: med,
                    medicalInfo: {
                        name: med.name,
                        imageUrl: null,
                        uses: [],
                        sideEffects: { common: [], serious: [], rare: [] },
                        warningsAndPrecautions: [],
                        interactions: {
                            drugInteractions: [],
                            foodInteractions: [],
                            conditionInteractions: [],
                        },
                        overdoseMissedDose: {
                            overdose: null,
                            missedDose: null,
                        },
                        approximatePrice: null,
                        manufacturer: [],
                        activeIngredients: [],
                        dosageForm: null,
                        prescriptionRequired: null,
                        genericAvailable: null,
                        fdaApproved: null,
                        lastUpdated: null,
                        error: errorMessage,
                        searchStatus: "error",
                        healthProfileInteraction: {
                            hasInteractions: false,
                            criticalCount: 0,
                            highCount: 0,
                            moderateCount: 0,
                            lowCount: 0,
                            interactions: [],
                            overallRisk: "minimal",
                            summary: "Analysis failed due to error",
                        },
                    },
                })),
                searchMetadata: {
                    searchDate: new Date().toISOString(),
                    originalCount: originalData.prescription_medications.length,
                    foundCount: 0,
                    error: errorMessage,
                    reliability: "failed",
                    totalInteractions: 0,
                    criticalInteractions: 0,
                    overallRiskLevel: "unknown",
                },
                citations: {
                    sources: [],
                    queries: [],
                    hasGrounding: false,
                },
                overallHealthAnalysis: {
                    riskLevel: "minimal",
                    summary: "Health profile analysis failed due to error",
                    keyRecommendations: [
                        "Consult healthcare provider immediately",
                    ],
                    requiresImmediateAttention: false,
                },
            };
        },
        []
    );

    // Updated main search function
    const searchMedicines = useCallback(
        async (
            prescriptionData: PrescriptionInput
        ): Promise<MedicineSearchResult | null> => {
            if (!apiKey) {
                const errorMessage = "API key is required";
                setState((prev) => ({ ...prev, error: errorMessage }));
                return null;
            }

            if (
                !prescriptionData?.prescription_medications ||
                prescriptionData.prescription_medications.length === 0
            ) {
                const errorMessage =
                    "Prescription medications are required and cannot be empty";
                setState((prev) => ({ ...prev, error: errorMessage }));
                return null;
            }

            setState((prev) => ({ ...prev, loading: true, error: null }));

            try {
                const ai = new GoogleGenAI({ apiKey });
                const groundingTool = { googleSearch: {} };
                const config = { tools: [groundingTool] };

                const medicineNames = prescriptionData.prescription_medications
                    .map((med) => med.name)
                    .join(", ");
                console.log(
                    `Analyzing medicines with health profile: ${medicineNames}`
                );

                const prompt = createEnhancedSearchPrompt(prescriptionData);

                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: config,
                });

                // Parse response
                const responseText = response.text;

                if (!responseText) {
                    throw new Error("No response text received from AI model");
                }

                const cleanedResponse = responseText
                    .replace(/```json\s*|\s*```/g, "")
                    .trim();

                let parsedData;
                try {
                    parsedData = JSON.parse(cleanedResponse);
                } catch (parseError) {
                    console.error(
                        "JSON parsing failed, using fallback:",
                        parseError
                    );
                    parsedData = fallbackParseResponse(
                        cleanedResponse,
                        prescriptionData
                    );
                }

                // Extract citations
                const citationData = extractCitations(response);

                // Combine data
                const enrichedData = combineWithOriginalData(
                    parsedData,
                    prescriptionData,
                    citationData
                );

                setState((prev) => ({
                    ...prev,
                    loading: false,
                    searchResult: enrichedData,
                    error: null,
                }));

                return enrichedData;
            } catch (error: any) {
                console.error(
                    "Error analyzing medicines with health profile:",
                    error
                );
                const errorMessage = `Medicine analysis failed: ${error.message}`;
                const errorResponse = createErrorResponse(
                    prescriptionData,
                    errorMessage
                );

                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: errorMessage,
                    searchResult: errorResponse,
                }));

                return errorResponse;
            }
        },
        [
            apiKey,
            createEnhancedSearchPrompt,
            extractCitations,
            combineWithOriginalData,
            createErrorResponse,
            fallbackParseResponse,
        ]
    );

    // Reset function
    const reset = useCallback(() => {
        setState({
            loading: false,
            error: null,
            searchResult: null,
        });
    }, []);

    return {
        ...state,
        searchMedicines,
        reset,
    };
};
