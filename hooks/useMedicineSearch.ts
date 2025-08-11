import { GoogleGenAI } from "@google/genai";
import { useCallback, useState } from "react";

// Type definitions
interface MedicineInput {
    dosage: string | null;
    duration: string;
    frequency: string;
    instructions: string;
    name: string;
    quantity: number | null;
    uncertain: boolean;
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
    overdose: string | null;
    missedDose: string | null;
}

interface Price {
    currency: string;
    priceRange: string;
    unit: string;
    lastUpdated: string;
}

interface ActiveIngredient {
    name: string;
    strength: string;
    purpose: string;
}

interface MedicalInfo {
    name: string;
    imageUrl: string | null;
    uses: string[];
    sideEffects: SideEffects;
    warningsAndPrecautions: string[];
    interactions: Interactions;
    overdoseMissedDose: OverdoseMissedDose;
    approximatePrice: Price | null;
    manufacturer: string[];
    activeIngredients: ActiveIngredient[];
    dosageForm: string | null;
    prescriptionRequired: boolean | null;
    genericAvailable: boolean | null;
    fdaApproved: boolean | null;
    lastUpdated: string | null;
    searchStatus?: string;
    error?: string;
}

interface CombinedMedicine {
    prescription: MedicineInput;
    medicalInfo: MedicalInfo;
}

interface Source {
    index: number;
    title: string;
    url: string;
    domain: string;
}

interface Citations {
    sources: Source[];
    queries: string[];
    hasGrounding: boolean;
}

interface SearchMetadata {
    searchDate: string;
    originalCount: number;
    foundCount: number;
    sourcesCount?: number;
    reliability?: string;
    error?: string;
    parseError?: string;
}

interface MedicineSearchResult {
    medicines: CombinedMedicine[];
    searchMetadata: SearchMetadata;
    citations: Citations;
}

interface UseMedicineSearchState {
    loading: boolean;
    error: string | null;
    searchResult: MedicineSearchResult | null;
}

interface UseMedicineSearchReturn extends UseMedicineSearchState {
    searchMedicines: (
        medicines: MedicineInput[]
    ) => Promise<MedicineSearchResult | null>;
    reset: () => void;
}

// Main hook
export const useMedicineSearch = (apiKey: string): UseMedicineSearchReturn => {
    const [state, setState] = useState<UseMedicineSearchState>({
        loading: false,
        error: null,
        searchResult: null,
    });

    // Helper function to create search prompt
    const createSearchPrompt = useCallback(
        (medicinesArray: MedicineInput[]): string => {
            const medicineList = medicinesArray
                .map(
                    (med) =>
                        `"${med.name}" (${med.dosage || "standard dosage"})`
                )
                .join(", ");

            return `
Search for current, accurate medical information about these medicines: ${medicineList}

For EACH medicine, provide the following information in a structured JSON format:

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
      "lastUpdated": "current date when searched"
    }
  ],
  "searchMetadata": {
    "searchDate": "current date",
    "sourcesCount": "number of sources used",
    "reliability": "high/medium/low"
  }
}

IMPORTANT REQUIREMENTS:
1. Search for the most current 2024-2025 information
2. Verify information from multiple medical sources
3. Include only FDA-approved or medically verified information
4. If any information is uncertain or unavailable, mark it as null
5. Prioritize official medical websites, drug databases, and manufacturer information
6. Include proper dosage forms and strengths
7. Ensure all price information is recent and realistic
8. Cross-reference side effects and interactions from reliable medical sources

Return ONLY the JSON object, no additional text or formatting.
    `;
        },
        []
    );

    // Helper function to extract citations
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

    // Helper function for fallback parsing
    const fallbackParseResponse = useCallback((responseText: string): any => {
        return {
            medicines: [],
            searchMetadata: {
                searchDate: new Date().toISOString(),
                sourcesCount: 0,
                reliability: "low",
                parseError: "Failed to parse structured response",
            },
        };
    }, []);

    // Helper function to combine data
    const combineWithOriginalData = useCallback(
        (
            medicineData: any,
            originalMedicines: MedicineInput[],
            citationData: Citations
        ): MedicineSearchResult => {
            const combinedMedicines: CombinedMedicine[] = [];

            originalMedicines.forEach((original) => {
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
                    },
                });
            });

            return {
                medicines: combinedMedicines,
                searchMetadata: {
                    ...medicineData.searchMetadata,
                    searchDate: new Date().toISOString(),
                    originalCount: originalMedicines.length,
                    foundCount: combinedMedicines.filter(
                        (m) => m.medicalInfo.searchStatus !== "not_found"
                    ).length,
                },
                citations: citationData,
            };
        },
        []
    );

    // Helper function to create error response
    const createErrorResponse = useCallback(
        (
            originalMedicines: MedicineInput[],
            errorMessage: string
        ): MedicineSearchResult => {
            return {
                medicines: originalMedicines.map((med) => ({
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
                    },
                })),
                searchMetadata: {
                    searchDate: new Date().toISOString(),
                    originalCount: originalMedicines.length,
                    foundCount: 0,
                    error: errorMessage,
                    reliability: "failed",
                },
                citations: {
                    sources: [],
                    queries: [],
                    hasGrounding: false,
                },
            };
        },
        []
    );

    // Main search function
    const searchMedicines = useCallback(
        async (
            medicinesArray: MedicineInput[]
        ): Promise<MedicineSearchResult | null> => {
            if (!apiKey) {
                const errorMessage = "API key is required";
                setState((prev) => ({ ...prev, error: errorMessage }));
                return null;
            }

            if (!medicinesArray || medicinesArray.length === 0) {
                const errorMessage =
                    "Medicines array is required and cannot be empty";
                setState((prev) => ({ ...prev, error: errorMessage }));
                return null;
            }

            setState((prev) => ({ ...prev, loading: true, error: null }));

            try {
                const ai = new GoogleGenAI({ apiKey });
                const groundingTool = { googleSearch: {} };
                const config = { tools: [groundingTool] };

                const medicineNames = medicinesArray
                    .map((med) => med.name)
                    .join(", ");
                console.log(`Searching for medicines: ${medicineNames}`);

                const prompt = createSearchPrompt(medicinesArray);

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
                const parsedData = JSON.parse(cleanedResponse);

                // Extract citations
                const citationData = extractCitations(response);

                // Combine data
                const enrichedData = combineWithOriginalData(
                    parsedData,
                    medicinesArray,
                    citationData
                );

                setState((prev) => ({
                    ...prev,
                    loading: false,
                    data: enrichedData,
                    error: null,
                }));

                return enrichedData;
            } catch (error: any) {
                console.error("Error searching for medicines:", error);
                const errorMessage = `Medicine search failed: ${error.message}`;
                const errorResponse = createErrorResponse(
                    medicinesArray,
                    errorMessage
                );

                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: errorMessage,
                    data: errorResponse,
                }));

                return errorResponse;
            }
        },
        [
            apiKey,
            createSearchPrompt,
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

// Export types for use in components
export type {
    ActiveIngredient,
    Citations,
    CombinedMedicine,
    Interactions,
    MedicalInfo,
    MedicineInput,
    MedicineSearchResult,
    OverdoseMissedDose,
    Price,
    SearchMetadata,
    SideEffects,
    Source,
    UseMedicineSearchReturn,
};
