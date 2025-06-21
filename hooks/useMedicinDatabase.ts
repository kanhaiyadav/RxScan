import { useState, useCallback, useContext } from "react";
import { UserHealthContext } from "../context/UserHealthContext";
import { DrugInfo, DrugInteraction, MedicineSearchResult } from "@/types/medicine";

const RXNORM_BASE_URL = "https://rxnav.nlm.nih.gov/REST";
const OPENFDA_BASE_URL = "https://api.fda.gov";

export const useMedicineDatabase = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const context = useContext(UserHealthContext);
    const healthProfile = context?.healthProfile;

    // Search for drug by name using RxNorm API
    const searchDrugByName = useCallback(
        async (drugName: string): Promise<DrugInfo[]> => {
            try {
                setLoading(true);
                setError(null);

                // Search for approximate matches
                const searchResponse = await fetch(
                    `${RXNORM_BASE_URL}/approximateTerm.json?term=${encodeURIComponent(
                        drugName
                    )}&maxEntries=10`
                );

                if (!searchResponse.ok) {
                    throw new Error("Failed to search drug database");
                }

                const searchData = await searchResponse.json();
                const candidates = searchData.approximateGroup?.candidate || [];

                const drugs: DrugInfo[] = [];

                for (const candidate of candidates.slice(0, 5)) {
                    const rxcui = candidate.rxcui;

                    // Get detailed drug information
                    const detailResponse = await fetch(
                        `${RXNORM_BASE_URL}/rxcui/${rxcui}/properties.json`
                    );

                    if (detailResponse.ok) {
                        const detailData = await detailResponse.json();
                        const properties = detailData.properties;

                        if (properties) {
                            // Get related drugs (brand names, generics)
                            const relatedResponse = await fetch(
                                `${RXNORM_BASE_URL}/rxcui/${rxcui}/related.json?tty=BN+GPCK+SBD+BPCK`
                            );
                            const relatedData = relatedResponse.ok
                                ? await relatedResponse.json()
                                : null;

                            const brandNames: string[] = [];
                            if (relatedData?.relatedGroup?.conceptGroup) {
                                relatedData.relatedGroup.conceptGroup.forEach(
                                    (group: any) => {
                                        if (group.conceptProperties) {
                                            group.conceptProperties.forEach(
                                                (concept: any) => {
                                                    if (
                                                        concept.name &&
                                                        !brandNames.includes(
                                                            concept.name
                                                        )
                                                    ) {
                                                        brandNames.push(
                                                            concept.name
                                                        );
                                                    }
                                                }
                                            );
                                        }
                                    }
                                );
                            }

                            drugs.push({
                                rxcui: rxcui,
                                name: properties.name,
                                genericName:
                                    properties.synonym || properties.name,
                                brandNames: brandNames,
                                activeIngredients: await getActiveIngredients(
                                    rxcui
                                ),
                                therapeuticClass: await getTherapeuticClass(
                                    rxcui
                                ),
                            });
                        }
                    }
                }

                return drugs;
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to search medicine database";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Get active ingredients for a drug
    const getActiveIngredients = useCallback(
        async (rxcui: string): Promise<string[]> => {
            try {
                const response = await fetch(
                    `${RXNORM_BASE_URL}/rxcui/${rxcui}/related.json?tty=IN`
                );
                if (!response.ok) return [];

                const data = await response.json();
                const ingredients: string[] = [];

                if (data.relatedGroup?.conceptGroup) {
                    data.relatedGroup.conceptGroup.forEach((group: any) => {
                        if (group.tty === "IN" && group.conceptProperties) {
                            group.conceptProperties.forEach((concept: any) => {
                                ingredients.push(concept.name);
                            });
                        }
                    });
                }

                return ingredients;
            } catch {
                return [];
            }
        },
        []
    );

    // Get therapeutic class information
    const getTherapeuticClass = useCallback(
        async (rxcui: string): Promise<string[]> => {
            try {
                const response = await fetch(
                    `https://rxnav.nlm.nih.gov/REST/rxclass/class/byRxcui.json?rxcui=${rxcui}&relaSource=ATC`
                );
                if (!response.ok) return [];

                const data = await response.json();
                const classes: string[] = [];

                if (data.rxclassDrugInfoList?.rxclassDrugInfo) {
                    data.rxclassDrugInfoList.rxclassDrugInfo.forEach(
                        (info: any) => {
                            if (info.rxclassMinConceptItem?.className) {
                                classes.push(
                                    info.rxclassMinConceptItem.className
                                );
                            }
                        }
                    );
                }

                return classes;
            } catch {
                return [];
            }
        },
        []
    );

    // Check for drug interactions with user's health profile
    const checkDrugInteractions = useCallback(
        async (drug: DrugInfo): Promise<DrugInteraction[]> => {
            const interactions: DrugInteraction[] = [];

            if (!healthProfile) return interactions;

            try {
                // Check for allergy interactions
                if (
                    drug.activeIngredients &&
                    healthProfile.allergies.length > 0
                ) {
                    drug.activeIngredients.forEach((ingredient) => {
                        healthProfile.allergies.forEach((allergy:any) => {
                            if (
                                ingredient
                                    .toLowerCase()
                                    .includes(allergy.toLowerCase()) ||
                                allergy
                                    .toLowerCase()
                                    .includes(ingredient.toLowerCase())
                            ) {
                                interactions.push({
                                    severity: "contraindicated",
                                    description: `Potential allergic reaction to ${ingredient}`,
                                    recommendation:
                                        "Do not take this medication. Consult your doctor immediately.",
                                    interactionType: "drug-allergy",
                                });
                            }
                        });
                    });
                }

                // Check drug-drug interactions with current medications
                if (healthProfile.currentMedications.length > 0) {
                    for (const currentMed of healthProfile.currentMedications) {
                        const drugInteractions = await checkDrugDrugInteraction(
                            drug.name,
                            currentMed
                        );
                        interactions.push(...drugInteractions);
                    }
                }

                // Check condition-based contraindications
                await checkConditionContraindications(
                    drug,
                    healthProfile.medicalConditions,
                    interactions
                );

                // Check dietary restrictions
                checkDietaryInteractions(
                    drug,
                    healthProfile.dietaryRestrictions,
                    interactions
                );
            } catch (error) {
                console.error("Error checking drug interactions:", error);
            }

            return interactions;
        },
        [healthProfile]
    );

    // Check drug-drug interactions (simplified implementation)
    const checkDrugDrugInteraction = useCallback(
        async (drug1: string, drug2: string): Promise<DrugInteraction[]> => {
            const interactions: DrugInteraction[] = [];

            // This is a simplified implementation. In practice, you'd use a dedicated interaction database
            // Since the free RxNav interaction API was discontinued, we use basic ingredient matching
            try {
                const commonInteractions = await getCommonInteractions(
                    drug1,
                    drug2
                );
                interactions.push(...commonInteractions);
            } catch (error) {
                console.error("Error checking drug-drug interaction:", error);
            }

            return interactions;
        },
        []
    );

    // Get common drug interactions from OpenFDA adverse events
    const getCommonInteractions = useCallback(
        async (drug1: string, drug2: string): Promise<DrugInteraction[]> => {
            const interactions: DrugInteraction[] = [];

            try {
                // Search for adverse events mentioning both drugs
                const query = `patient.drug.medicinalproduct:"${drug1}"+AND+patient.drug.medicinalproduct:"${drug2}"`;
                const response = await fetch(
                    `${OPENFDA_BASE_URL}/drug/event.json?search=${encodeURIComponent(
                        query
                    )}&limit=10`
                );

                if (response.ok) {
                    const data = await response.json();

                    if (data.results && data.results.length > 0) {
                        // If we find adverse events with both drugs, flag as potential interaction
                        interactions.push({
                            severity: "moderate",
                            description: `Potential interaction detected between ${drug1} and ${drug2}`,
                            recommendation:
                                "Monitor for adverse effects. Consult your healthcare provider.",
                            interactionType: "drug-drug",
                            interactingDrug: drug2,
                        });
                    }
                }
            } catch (error) {
                console.error("Error getting common interactions:", error);
            }

            return interactions;
        },
        []
    );

    // Check condition-based contraindications
    const checkConditionContraindications = useCallback(
        async (
            drug: DrugInfo,
            conditions: string[],
            interactions: DrugInteraction[]
        ) => {
            // Common contraindications database (simplified)
            const contraindications: Record<string, string[]> = {
                diabetes: ["corticosteroids", "thiazide", "beta-blockers"],
                hypertension: ["nsaids", "decongestants", "stimulants"],
                "kidney disease": ["nsaids", "ace inhibitors", "contrast dyes"],
                "liver disease": ["acetaminophen", "statins", "antifungals"],
                "heart disease": [
                    "nsaids",
                    "cox-2 inhibitors",
                    "thiazolidinediones",
                ],
                asthma: ["beta-blockers", "aspirin", "nsaids"],
                pregnancy: ["ace inhibitors", "warfarin", "retinoids"],
            };

            conditions.forEach((condition) => {
                const contraList = contraindications[condition.toLowerCase()];
                if (contraList && drug.activeIngredients) {
                    drug.activeIngredients.forEach((ingredient) => {
                        if (
                            contraList.some(
                                (contra) =>
                                    ingredient.toLowerCase().includes(contra) ||
                                    drug.name.toLowerCase().includes(contra)
                            )
                        ) {
                            interactions.push({
                                severity: "major",
                                description: `${drug.name} may be contraindicated with ${condition}`,
                                recommendation:
                                    "Consult your healthcare provider before taking this medication.",
                                interactionType: "drug-condition",
                            });
                        }
                    });
                }
            });
        },
        []
    );

    // Check dietary interactions
    const checkDietaryInteractions = useCallback(
        (
            drug: DrugInfo,
            dietaryRestrictions: string[],
            interactions: DrugInteraction[]
        ) => {
            const foodInteractions: Record<string, string[]> = {
                alcohol: [
                    "metronidazole",
                    "warfarin",
                    "acetaminophen",
                    "benzodiazepines",
                ],
                caffeine: ["theophylline", "quinolones", "iron supplements"],
                grapefruit: [
                    "statins",
                    "calcium channel blockers",
                    "immunosuppressants",
                ],
                dairy: ["tetracyclines", "quinolones", "bisphosphonates"],
                "high sodium": [
                    "ace inhibitors",
                    "diuretics",
                    "heart medications",
                ],
            };

            dietaryRestrictions.forEach((restriction) => {
                const interactingDrugs =
                    foodInteractions[restriction.toLowerCase()];
                if (interactingDrugs && drug.activeIngredients) {
                    drug.activeIngredients.forEach((ingredient) => {
                        if (
                            interactingDrugs.some(
                                (interacting) =>
                                    ingredient
                                        .toLowerCase()
                                        .includes(interacting) ||
                                    drug.name
                                        .toLowerCase()
                                        .includes(interacting)
                            )
                        ) {
                            interactions.push({
                                severity: "moderate",
                                description: `Avoid ${restriction} while taking ${drug.name}`,
                                recommendation: `Limit or avoid ${restriction} consumption during treatment.`,
                                interactionType: "drug-food",
                            });
                        }
                    });
                }
            });
        },
        []
    );

    // Comprehensive medicine analysis
    const analyzeMedicine = useCallback(
        async (medicineName: string): Promise<MedicineSearchResult | null> => {
            try {
                setLoading(true);
                setError(null);

                // Search for the drug
                const drugs = await searchDrugByName(medicineName);

                if (drugs.length === 0) {
                    throw new Error("Medicine not found in database");
                }

                const drug = drugs[0]; // Take the first match

                // Check for interactions
                const interactions = await checkDrugInteractions(drug);

                // Generate warnings
                const warnings: string[] = [];
                const foodInteractions: string[] = [];
                const allergyWarnings: string[] = [];

                interactions.forEach((interaction) => {
                    switch (interaction.interactionType) {
                        case "drug-food":
                            foodInteractions.push(interaction.description);
                            break;
                        case "drug-allergy":
                            allergyWarnings.push(interaction.description);
                            warnings.push(interaction.description);
                            break;
                        default:
                            warnings.push(interaction.description);
                    }
                });

                return {
                    drug,
                    interactions,
                    warnings,
                    foodInteractions,
                    allergyWarnings,
                };
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to analyze medicine";
                setError(errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [searchDrugByName, checkDrugInteractions]
    );

    // Get detailed drug information from OpenFDA
    const getDrugLabelInfo = useCallback(async (drugName: string) => {
        try {
            const response = await fetch(
                `${OPENFDA_BASE_URL}/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(
                    drugName
                )}"&limit=1`
            );

            if (response.ok) {
                const data = await response.json();
                return data.results?.[0];
            }
        } catch (error) {
            console.error("Error fetching drug label info:", error);
        }
        return null;
    }, []);

    return {
        loading,
        error,
        searchDrugByName,
        analyzeMedicine,
        checkDrugInteractions,
        getDrugLabelInfo,
    };
};
