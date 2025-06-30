import { useState, useCallback, useContext } from "react";
import { UserHealthContext } from "../context/UserHealthContext";
import {
    DrugInfo,
    DrugInteraction,
    MedicineSearchResult,
} from "@/types/medicine";

const RXNORM_BASE_URL = "https://rxnav.nlm.nih.gov/REST";
const OPENFDA_BASE_URL = "https://api.fda.gov";

export const useMedicineDatabase = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const context = useContext(UserHealthContext);
    const healthProfile = context?.healthProfile;

    // Enhanced allergy matching database
    const allergyMappings: Record<string, string[]> = {
        // Common drug allergies
        penicillin: [
            "penicillin",
            "amoxicillin",
            "ampicillin",
            "benzylpenicillin",
            "phenoxymethylpenicillin",
        ],
        sulfa: [
            "sulfamethoxazole",
            "trimethoprim",
            "sulfadiazine",
            "sulfasalazine",
            "sulfisoxazole",
        ],
        aspirin: [
            "aspirin",
            "acetylsalicylic acid",
            "salicylate",
            "methyl salicylate",
        ],
        codeine: [
            "codeine",
            "hydrocodone",
            "oxycodone",
            "morphine",
            "tramadol",
        ],
        latex: ["latex", "rubber", "natural rubber latex"],
        iodine: [
            "iodine",
            "contrast media",
            "povidone iodine",
            "iodinated contrast",
        ],
        shellfish: ["shellfish", "iodine", "contrast media"],
        eggs: ["egg", "albumin", "influenza vaccine", "yellow fever vaccine"],
        gelatin: ["gelatin", "vaccines", "capsules"],
        soy: ["soy", "lecithin", "propofol", "fat emulsion"],
        // Extended mappings
        nsaids: [
            "ibuprofen",
            "naproxen",
            "diclofenac",
            "indomethacin",
            "celecoxib",
            "meloxicam",
        ],
        statins: [
            "atorvastatin",
            "simvastatin",
            "rosuvastatin",
            "pravastatin",
            "lovastatin",
        ],
        "ace inhibitors": [
            "lisinopril",
            "enalapril",
            "captopril",
            "ramipril",
            "quinapril",
        ],
        "beta blockers": [
            "metoprolol",
            "propranolol",
            "atenolol",
            "carvedilol",
            "bisoprolol",
        ],
        quinolones: [
            "ciprofloxacin",
            "levofloxacin",
            "moxifloxacin",
            "norfloxacin",
            "ofloxacin",
        ],
        macrolides: [
            "azithromycin",
            "erythromycin",
            "clarithromycin",
            "roxithromycin",
        ],
        tetracyclines: [
            "tetracycline",
            "doxycycline",
            "minocycline",
            "tigecycline",
        ],
        cephalosporins: [
            "cephalexin",
            "ceftriaxone",
            "cefazolin",
            "cefuroxime",
            "ceftaroline",
        ],
        benzodiazepines: [
            "lorazepam",
            "diazepam",
            "alprazolam",
            "clonazepam",
            "midazolam",
        ],
        opioids: [
            "morphine",
            "oxycodone",
            "hydrocodone",
            "fentanyl",
            "codeine",
            "tramadol",
        ],
        anticonvulsants: [
            "phenytoin",
            "carbamazepine",
            "valproic acid",
            "lamotrigine",
            "levetiracetam",
        ],
        antipsychotics: [
            "haloperidol",
            "risperidone",
            "olanzapine",
            "quetiapine",
            "aripiprazole",
        ],
    };

    // Enhanced drug-drug interaction database
    const drugInteractionDatabase: Record<
        string,
        Array<{ drug: string; severity: string; description: string }>
    > = {
        warfarin: [
            {
                drug: "aspirin",
                severity: "major",
                description: "Increased bleeding risk",
            },
            {
                drug: "ibuprofen",
                severity: "major",
                description: "Increased bleeding risk",
            },
            {
                drug: "acetaminophen",
                severity: "moderate",
                description: "May increase anticoagulant effect",
            },
            {
                drug: "amiodarone",
                severity: "major",
                description: "Significantly increases warfarin effect",
            },
            {
                drug: "metronidazole",
                severity: "major",
                description: "Increases warfarin effect",
            },
            {
                drug: "fluconazole",
                severity: "major",
                description: "Increases warfarin effect",
            },
            {
                drug: "trimethoprim",
                severity: "moderate",
                description: "May increase warfarin effect",
            },
        ],
        digoxin: [
            {
                drug: "furosemide",
                severity: "moderate",
                description:
                    "Increased risk of digoxin toxicity due to potassium loss",
            },
            {
                drug: "amiodarone",
                severity: "major",
                description: "Significantly increases digoxin levels",
            },
            {
                drug: "verapamil",
                severity: "major",
                description: "Increases digoxin levels",
            },
            {
                drug: "quinidine",
                severity: "major",
                description: "Increases digoxin levels",
            },
            {
                drug: "clarithromycin",
                severity: "moderate",
                description: "May increase digoxin levels",
            },
        ],
        metformin: [
            {
                drug: "furosemide",
                severity: "moderate",
                description: "May increase metformin levels",
            },
            {
                drug: "contrast media",
                severity: "major",
                description: "Risk of lactic acidosis",
            },
            {
                drug: "alcohol",
                severity: "moderate",
                description: "Increased risk of lactic acidosis",
            },
        ],
        simvastatin: [
            {
                drug: "amlodipine",
                severity: "moderate",
                description: "Increased risk of myopathy",
            },
            {
                drug: "diltiazem",
                severity: "moderate",
                description: "Increased risk of myopathy",
            },
            {
                drug: "verapamil",
                severity: "moderate",
                description: "Increased risk of myopathy",
            },
            {
                drug: "cyclosporine",
                severity: "major",
                description: "Significantly increased risk of myopathy",
            },
            {
                drug: "gemfibrozil",
                severity: "major",
                description: "Significantly increased risk of myopathy",
            },
        ],
        lisinopril: [
            {
                drug: "potassium",
                severity: "major",
                description: "Risk of hyperkalemia",
            },
            {
                drug: "spironolactone",
                severity: "major",
                description: "Risk of hyperkalemia",
            },
            {
                drug: "ibuprofen",
                severity: "moderate",
                description: "Reduced antihypertensive effect",
            },
            {
                drug: "lithium",
                severity: "major",
                description: "Increased lithium levels",
            },
        ],
        metoprolol: [
            {
                drug: "verapamil",
                severity: "major",
                description: "Risk of heart block",
            },
            {
                drug: "diltiazem",
                severity: "major",
                description: "Risk of heart block",
            },
            {
                drug: "clonidine",
                severity: "major",
                description: "Rebound hypertension risk",
            },
            {
                drug: "insulin",
                severity: "moderate",
                description: "May mask hypoglycemic symptoms",
            },
        ],
    };

    // Enhanced condition contraindications
    const conditionContraindications: Record<
        string,
        Array<{ drug: string; severity: string; description: string }>
    > = {
        diabetes: [
            {
                drug: "prednisone",
                severity: "major",
                description: "Significantly increases blood glucose",
            },
            {
                drug: "hydrochlorothiazide",
                severity: "moderate",
                description: "May increase blood glucose",
            },
            {
                drug: "propranolol",
                severity: "moderate",
                description: "May mask hypoglycemic symptoms",
            },
            {
                drug: "niacin",
                severity: "moderate",
                description: "May increase blood glucose",
            },
            {
                drug: "growth hormone",
                severity: "major",
                description: "Significantly increases blood glucose",
            },
        ],
        hypertension: [
            {
                drug: "pseudoephedrine",
                severity: "major",
                description: "May significantly increase blood pressure",
            },
            {
                drug: "phenylephrine",
                severity: "major",
                description: "May significantly increase blood pressure",
            },
            {
                drug: "ibuprofen",
                severity: "moderate",
                description: "May increase blood pressure",
            },
            {
                drug: "naproxen",
                severity: "moderate",
                description: "May increase blood pressure",
            },
            {
                drug: "prednisone",
                severity: "moderate",
                description: "May increase blood pressure",
            },
        ],
        "kidney disease": [
            {
                drug: "ibuprofen",
                severity: "major",
                description: "May worsen kidney function",
            },
            {
                drug: "naproxen",
                severity: "major",
                description: "May worsen kidney function",
            },
            {
                drug: "lisinopril",
                severity: "major",
                description: "May worsen kidney function in severe disease",
            },
            {
                drug: "metformin",
                severity: "major",
                description: "Risk of lactic acidosis",
            },
            {
                drug: "contrast media",
                severity: "major",
                description: "Risk of contrast-induced nephropathy",
            },
        ],
        "liver disease": [
            {
                drug: "acetaminophen",
                severity: "major",
                description: "Risk of liver toxicity",
            },
            {
                drug: "simvastatin",
                severity: "major",
                description: "Risk of liver toxicity",
            },
            {
                drug: "ketoconazole",
                severity: "major",
                description: "Risk of liver toxicity",
            },
            {
                drug: "isoniazid",
                severity: "major",
                description: "Risk of liver toxicity",
            },
            {
                drug: "valproic acid",
                severity: "major",
                description: "Risk of liver toxicity",
            },
        ],
        "heart disease": [
            {
                drug: "ibuprofen",
                severity: "major",
                description: "Increased risk of heart attack",
            },
            {
                drug: "celecoxib",
                severity: "major",
                description: "Increased cardiovascular risk",
            },
            {
                drug: "rosiglitazone",
                severity: "major",
                description: "Increased risk of heart failure",
            },
            {
                drug: "doxorubicin",
                severity: "major",
                description: "Risk of cardiomyopathy",
            },
        ],
        asthma: [
            {
                drug: "propranolol",
                severity: "major",
                description: "May trigger bronchospasm",
            },
            {
                drug: "aspirin",
                severity: "major",
                description:
                    "May trigger bronchospasm in aspirin-sensitive asthma",
            },
            {
                drug: "timolol",
                severity: "major",
                description: "May trigger bronchospasm",
            },
            {
                drug: "atenolol",
                severity: "moderate",
                description: "May trigger bronchospasm",
            },
        ],
        pregnancy: [
            {
                drug: "warfarin",
                severity: "contraindicated",
                description: "Teratogenic - causes birth defects",
            },
            {
                drug: "isotretinoin",
                severity: "contraindicated",
                description: "Highly teratogenic",
            },
            {
                drug: "lisinopril",
                severity: "contraindicated",
                description: "Causes fetal kidney damage",
            },
            {
                drug: "methotrexate",
                severity: "contraindicated",
                description: "Teratogenic and abortifacient",
            },
            {
                drug: "phenytoin",
                severity: "major",
                description: "Risk of fetal hydantoin syndrome",
            },
        ],
        glaucoma: [
            {
                drug: "atropine",
                severity: "major",
                description: "May increase intraocular pressure",
            },
            {
                drug: "scopolamine",
                severity: "major",
                description: "May increase intraocular pressure",
            },
            {
                drug: "ipratropium",
                severity: "moderate",
                description: "May increase intraocular pressure",
            },
            {
                drug: "amitriptyline",
                severity: "moderate",
                description: "May increase intraocular pressure",
            },
        ],
    };

    // Enhanced food/dietary interactions
    const foodInteractionDatabase: Record<
        string,
        Array<{
            drug: string;
            severity: string;
            description: string;
            recommendation: string;
        }>
    > = {
        alcohol: [
            {
                drug: "metronidazole",
                severity: "major",
                description: "Disulfiram-like reaction",
                recommendation:
                    "Avoid alcohol completely during treatment and for 72 hours after",
            },
            {
                drug: "warfarin",
                severity: "major",
                description: "Increased bleeding risk",
                recommendation: "Limit alcohol consumption",
            },
            {
                drug: "acetaminophen",
                severity: "major",
                description: "Increased liver toxicity risk",
                recommendation: "Limit alcohol consumption",
            },
            {
                drug: "lorazepam",
                severity: "major",
                description: "Increased sedation and respiratory depression",
                recommendation: "Avoid alcohol completely",
            },
            {
                drug: "zolpidem",
                severity: "major",
                description: "Increased sedation and confusion",
                recommendation: "Avoid alcohol completely",
            },
        ],
        caffeine: [
            {
                drug: "theophylline",
                severity: "major",
                description: "Increased theophylline levels and toxicity",
                recommendation: "Limit caffeine intake significantly",
            },
            {
                drug: "ciprofloxacin",
                severity: "moderate",
                description: "Increased caffeine levels",
                recommendation: "Reduce caffeine intake",
            },
            {
                drug: "iron",
                severity: "moderate",
                description: "Reduced iron absorption",
                recommendation:
                    "Take iron 1 hour before or 2 hours after caffeine",
            },
            {
                drug: "lithium",
                severity: "moderate",
                description: "May affect lithium levels",
                recommendation: "Maintain consistent caffeine intake",
            },
        ],
        grapefruit: [
            {
                drug: "simvastatin",
                severity: "major",
                description: "Significantly increased drug levels",
                recommendation: "Avoid grapefruit completely",
            },
            {
                drug: "amlodipine",
                severity: "major",
                description: "Increased drug levels and hypotension risk",
                recommendation: "Avoid grapefruit completely",
            },
            {
                drug: "cyclosporine",
                severity: "major",
                description: "Increased drug levels and toxicity",
                recommendation: "Avoid grapefruit completely",
            },
            {
                drug: "buspirone",
                severity: "major",
                description: "Increased drug levels",
                recommendation: "Avoid grapefruit completely",
            },
            {
                drug: "sertraline",
                severity: "moderate",
                description: "May increase drug levels",
                recommendation: "Avoid grapefruit",
            },
        ],
        dairy: [
            {
                drug: "tetracycline",
                severity: "major",
                description: "Significantly reduced absorption",
                recommendation: "Take 1 hour before or 2 hours after dairy",
            },
            {
                drug: "ciprofloxacin",
                severity: "major",
                description: "Significantly reduced absorption",
                recommendation: "Take 2 hours before or 6 hours after dairy",
            },
            {
                drug: "alendronate",
                severity: "major",
                description: "Significantly reduced absorption",
                recommendation:
                    "Take 30 minutes before any food or drink except water",
            },
            {
                drug: "levothyroxine",
                severity: "moderate",
                description: "Reduced absorption",
                recommendation: "Take 4 hours apart from dairy",
            },
        ],
        "high sodium": [
            {
                drug: "lisinopril",
                severity: "moderate",
                description: "Reduced antihypertensive effect",
                recommendation: "Maintain low sodium diet",
            },
            {
                drug: "furosemide",
                severity: "moderate",
                description: "Reduced diuretic effect",
                recommendation: "Limit sodium intake",
            },
            {
                drug: "lithium",
                severity: "major",
                description: "Increased lithium levels",
                recommendation: "Maintain consistent sodium intake",
            },
        ],
        "vitamin k": [
            {
                drug: "warfarin",
                severity: "major",
                description: "Reduced anticoagulant effect",
                recommendation: "Maintain consistent vitamin K intake",
            },
        ],
        "high fiber": [
            {
                drug: "digoxin",
                severity: "moderate",
                description: "May reduce absorption",
                recommendation:
                    "Take medication 2 hours apart from high fiber meals",
            },
            {
                drug: "lovastatin",
                severity: "moderate",
                description: "May reduce absorption",
                recommendation: "Take with low-fiber meal",
            },
        ],
    };

    // Enhanced fuzzy matching for drug names and ingredients
    const fuzzyMatch = useCallback(
        (searchTerm: string, targetList: string[]): string[] => {
            const matches: string[] = [];
            const searchLower = searchTerm.toLowerCase().trim();

            targetList.forEach((target) => {
                const targetLower = target.toLowerCase();

                // Exact match
                if (targetLower === searchLower) {
                    matches.push(target);
                    return;
                }

                // Contains match
                if (
                    targetLower.includes(searchLower) ||
                    searchLower.includes(targetLower)
                ) {
                    matches.push(target);
                    return;
                }

                // Word boundary match
                const searchWords = searchLower.split(/\s+/);
                const targetWords = targetLower.split(/\s+/);

                for (const searchWord of searchWords) {
                    for (const targetWord of targetWords) {
                        if (
                            searchWord.length > 3 &&
                            targetWord.includes(searchWord)
                        ) {
                            matches.push(target);
                            return;
                        }
                        if (
                            targetWord.length > 3 &&
                            searchWord.includes(targetWord)
                        ) {
                            matches.push(target);
                            return;
                        }
                    }
                }
            });

            return [...new Set(matches)];
        },
        []
    );

    // Enhanced allergy checking
    const checkAllergyInteractions = useCallback(
        (drug: DrugInfo, allergies: string[]): DrugInteraction[] => {
            const interactions: DrugInteraction[] = [];

            if (!drug.activeIngredients || allergies.length === 0)
                return interactions;

            // Create comprehensive drug ingredient list
            const drugComponents = [
                drug.name,
                drug.genericName,
                ...(drug.brandNames || []),
                ...(drug.activeIngredients || []),
                ...(drug.therapeuticClass || []),
            ]
                .filter(Boolean)
                .map((item) => item!.toLowerCase());

            allergies.forEach((allergy) => {
                const allergyLower = allergy.toLowerCase().trim();

                // Direct matching
                const directMatches = fuzzyMatch(allergyLower, drugComponents);
                if (directMatches.length > 0) {
                    interactions.push({
                        severity: "contraindicated",
                        description: `SEVERE ALLERGY ALERT: You are allergic to ${allergy}. This medication contains ${directMatches.join(
                            ", "
                        )}.`,
                        recommendation:
                            "DO NOT TAKE this medication. Contact your healthcare provider immediately.",
                        interactionType: "drug-allergy",
                    });
                    return;
                }

                // Check allergy mappings
                const allergyMappingKey = Object.keys(allergyMappings).find(
                    (key) =>
                        key.toLowerCase().includes(allergyLower) ||
                        allergyLower.includes(key.toLowerCase())
                );

                if (allergyMappingKey) {
                    const relatedDrugs = allergyMappings[allergyMappingKey];
                    const foundMatches = relatedDrugs.filter((relatedDrug) =>
                        drugComponents.some(
                            (component) =>
                                component.includes(relatedDrug.toLowerCase()) ||
                                relatedDrug.toLowerCase().includes(component)
                        )
                    );

                    if (foundMatches.length > 0) {
                        interactions.push({
                            severity: "contraindicated",
                            description: `SEVERE ALLERGY ALERT: You are allergic to ${allergy}. This medication may contain related substances: ${foundMatches.join(
                                ", "
                            )}.`,
                            recommendation:
                                "DO NOT TAKE this medication. Contact your healthcare provider immediately.",
                            interactionType: "drug-allergy",
                        });
                    }
                }
            });

            return interactions;
        },
        [fuzzyMatch]
    );

    // Enhanced drug-drug interaction checking
    const checkDrugDrugInteractions = useCallback(
        (drug: DrugInfo, currentMedications: any[]): DrugInteraction[] => {
            const interactions: DrugInteraction[] = [];

            if (!currentMedications || currentMedications.length === 0)
                return interactions;

            const drugComponents = [
                drug.name,
                drug.genericName,
                ...(drug.brandNames || []),
                ...(drug.activeIngredients || []),
            ].filter(Boolean);

            currentMedications.forEach((currentMed) => {
                const currentMedComponents = [
                    currentMed.name,
                    currentMed.genericName,
                    ...(currentMed.brandNames || []),
                    ...(currentMed.activeIngredients || []),
                ].filter(Boolean);

                // Check against drug interaction database
                drugComponents.forEach((newDrugComponent) => {
                    if (!newDrugComponent) return;
                    const newDrugLower = newDrugComponent.toLowerCase();

                    // Find matching interaction rules
                    Object.keys(drugInteractionDatabase).forEach(
                        (interactionKey) => {
                            if (
                                newDrugLower.includes(interactionKey) ||
                                interactionKey.includes(newDrugLower)
                            ) {
                                const interactionRules =
                                    drugInteractionDatabase[interactionKey];

                                interactionRules.forEach((rule) => {
                                    currentMedComponents.forEach(
                                        (currentComponent) => {
                                            const currentLower =
                                                currentComponent.toLowerCase();

                                            if (
                                                currentLower.includes(
                                                    rule.drug
                                                ) ||
                                                rule.drug.includes(currentLower)
                                            ) {
                                                interactions.push({
                                                    severity:
                                                        rule.severity as any,
                                                    description: `${newDrugComponent} + ${currentComponent}: ${rule.description}`,
                                                    recommendation:
                                                        rule.severity ===
                                                        "major"
                                                            ? "Consult your healthcare provider before taking these medications together."
                                                            : "Monitor for side effects and consult your healthcare provider if needed.",
                                                    interactionType:
                                                        "drug-drug",
                                                    interactingDrug:
                                                        currentMed.name,
                                                });
                                            }
                                        }
                                    );
                                });
                            }
                        }
                    );

                    // Reverse check
                    currentMedComponents.forEach((currentComponent) => {
                        const currentLower = currentComponent.toLowerCase();

                        Object.keys(drugInteractionDatabase).forEach(
                            (interactionKey) => {
                                if (
                                    currentLower.includes(interactionKey) ||
                                    interactionKey.includes(currentLower)
                                ) {
                                    const interactionRules =
                                        drugInteractionDatabase[interactionKey];

                                    interactionRules.forEach((rule) => {
                                        if (
                                            newDrugLower.includes(rule.drug) ||
                                            rule.drug.includes(newDrugLower)
                                        ) {
                                            // Avoid duplicates
                                            const isDuplicate =
                                                interactions.some(
                                                    (existing) =>
                                                        existing.interactingDrug ===
                                                            currentMed.name &&
                                                        existing.description.includes(
                                                            rule.description
                                                        )
                                                );

                                            if (!isDuplicate) {
                                                interactions.push({
                                                    severity:
                                                        rule.severity as any,
                                                    description: `${currentComponent} + ${newDrugComponent}: ${rule.description}`,
                                                    recommendation:
                                                        rule.severity ===
                                                        "major"
                                                            ? "Consult your healthcare provider before taking these medications together."
                                                            : "Monitor for side effects and consult your healthcare provider if needed.",
                                                    interactionType:
                                                        "drug-drug",
                                                    interactingDrug:
                                                        currentMed.name,
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        );
                    });
                });
            });

            return interactions;
        },
        []
    );

    // Enhanced condition contraindication checking
    const checkConditionContraindications = useCallback(
        (drug: DrugInfo, conditions: string[]): DrugInteraction[] => {
            const interactions: DrugInteraction[] = [];

            if (!conditions || conditions.length === 0) return interactions;

            const drugComponents = [
                drug.name,
                drug.genericName,
                ...(drug.brandNames || []),
                ...(drug.activeIngredients || []),
            ].filter(Boolean);

            conditions.forEach((condition) => {
                const conditionLower = condition.toLowerCase().trim();

                // Find matching condition rules
                Object.keys(conditionContraindications).forEach(
                    (conditionKey) => {
                        if (
                            conditionLower.includes(conditionKey) ||
                            conditionKey.includes(conditionLower)
                        ) {
                            const contraindicationRules =
                                conditionContraindications[conditionKey];

                            contraindicationRules.forEach((rule) => {
                                drugComponents.forEach((drugComponent) => {
                                    if (!drugComponent) return;
                                    const drugLower =
                                        drugComponent.toLowerCase();

                                    if (
                                        drugLower.includes(rule.drug) ||
                                        rule.drug.includes(drugLower)
                                    ) {
                                        interactions.push({
                                            severity: rule.severity as any,
                                            description: `${drugComponent} may be problematic with ${condition}: ${rule.description}`,
                                            recommendation:
                                                rule.severity ===
                                                "contraindicated"
                                                    ? "This medication is contraindicated. DO NOT TAKE. Contact your healthcare provider immediately."
                                                    : rule.severity === "major"
                                                    ? "Consult your healthcare provider before taking this medication."
                                                    : "Monitor closely and consult your healthcare provider if symptoms worsen.",
                                            interactionType: "drug-condition",
                                        });
                                    }
                                });
                            });
                        }
                    }
                );
            });

            return interactions;
        },
        []
    );

    // Enhanced dietary interaction checking
    const checkDietaryInteractions = useCallback(
        (drug: DrugInfo, dietaryRestrictions: string[]): DrugInteraction[] => {
            const interactions: DrugInteraction[] = [];

            if (!dietaryRestrictions || dietaryRestrictions.length === 0)
                return interactions;

            const drugComponents = [
                drug.name,
                drug.genericName,
                ...(drug.brandNames || []),
                ...(drug.activeIngredients || []),
            ].filter(Boolean);

            dietaryRestrictions.forEach((restriction) => {
                const restrictionLower = restriction.toLowerCase().trim();

                // Find matching dietary interaction rules
                Object.keys(foodInteractionDatabase).forEach((foodKey) => {
                    if (
                        restrictionLower.includes(foodKey) ||
                        foodKey.includes(restrictionLower)
                    ) {
                        const interactionRules =
                            foodInteractionDatabase[foodKey];

                        interactionRules.forEach((rule) => {
                            drugComponents.forEach((drugComponent) => {
                                if (!drugComponent) return;
                                const drugLower = drugComponent.toLowerCase();

                                if (
                                    drugLower.includes(rule.drug) ||
                                    rule.drug.includes(drugLower)
                                ) {
                                    interactions.push({
                                        severity: rule.severity as any,
                                        description: rule.description,
                                        recommendation: rule.recommendation,
                                        interactionType: "drug-food",
                                    });
                                }
                            });
                        });
                    }
                });
            });

            return interactions;
        },
        []
    );

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

    // Enhanced drug interaction checking with comprehensive approach
    const checkDrugInteractions = useCallback(
        async (drug: DrugInfo): Promise<DrugInteraction[]> => {
            const interactions: DrugInteraction[] = [];

            if (!healthProfile) return interactions;

            try {
                // 1. Check for allergy interactions (highest priority)
                if (
                    healthProfile.allergies &&
                    healthProfile.allergies.length > 0
                ) {
                    const allergyInteractions = checkAllergyInteractions(
                        drug,
                        healthProfile.allergies
                    );
                    interactions.push(...allergyInteractions);
                }

                // 2. Check drug-drug interactions with current medications
                if (
                    healthProfile.currentMedications &&
                    healthProfile.currentMedications.length > 0
                ) {
                    const drugDrugInteractions = checkDrugDrugInteractions(
                        drug,
                        healthProfile.currentMedications
                    );
                    interactions.push(...drugDrugInteractions);
                }

                // 3. Check condition-based contraindications
                if (
                    healthProfile.medicalConditions &&
                    healthProfile.medicalConditions.length > 0
                ) {
                    const conditionInteractions =
                        checkConditionContraindications(
                            drug,
                            healthProfile.medicalConditions
                        );
                    interactions.push(...conditionInteractions);
                }

                // 4. Check dietary restrictions and food interactions
                if (
                    healthProfile.dietaryRestrictions &&
                    healthProfile.dietaryRestrictions.length > 0
                ) {
                    const dietaryInteractions = checkDietaryInteractions(
                        drug,
                        healthProfile.dietaryRestrictions
                    );
                    interactions.push(...dietaryInteractions);
                }

                // 5. Additional OpenFDA adverse events check (if no contraindicated interactions found)
                const hasContraindicated = interactions.some(
                    (i) => i.severity === "contraindicated"
                );
                if (
                    !hasContraindicated &&
                    healthProfile.currentMedications &&
                    healthProfile.currentMedications.length > 0
                ) {
                    for (const currentMed of healthProfile.currentMedications) {
                        try {
                            const fdaInteractions = await getCommonInteractions(
                                drug.name,
                                currentMed.name
                            );
                            // Only add FDA interactions if we don't already have a similar one
                            fdaInteractions.forEach((fdaInteraction) => {
                                const existingSimilar = interactions.find(
                                    (existing) =>
                                        existing.interactingDrug ===
                                            fdaInteraction.interactingDrug &&
                                        existing.interactionType === "drug-drug"
                                );
                                if (!existingSimilar) {
                                    interactions.push(fdaInteraction);
                                }
                            });
                        } catch (error) {
                            console.warn(
                                `Failed to check FDA interactions for ${drug.name} + ${currentMed.name}:`,
                                error
                            );
                        }
                    }
                }

                // Sort interactions by severity (contraindicated > major > moderate > minor)
                const severityOrder = {
                    contraindicated: 0,
                    major: 1,
                    moderate: 2,
                    minor: 3,
                };
                interactions.sort((a, b) => {
                    const aSeverity =
                        severityOrder[
                            a.severity as keyof typeof severityOrder
                        ] ?? 4;
                    const bSeverity =
                        severityOrder[
                            b.severity as keyof typeof severityOrder
                        ] ?? 4;
                    return aSeverity - bSeverity;
                });
            } catch (error) {
                console.error("Error checking drug interactions:", error);
                // Add a generic warning if interaction checking fails
                interactions.push({
                    severity: "moderate",
                    description:
                        "Unable to fully check drug interactions. Please consult your healthcare provider.",
                    recommendation:
                        "Verify safety with your healthcare provider before taking this medication.",
                    interactionType: "drug-drug",
                });
            }

            return interactions;
        },
        [
            healthProfile,
            checkAllergyInteractions,
            checkDrugDrugInteractions,
            checkConditionContraindications,
            checkDietaryInteractions,
        ]
    );

    // Enhanced drug-drug interaction check (using existing OpenFDA method but improved)
    const checkDrugDrugInteraction = useCallback(
        async (drug1: string, drug2: string): Promise<DrugInteraction[]> => {
            // This method is kept for backward compatibility but enhanced version is used in checkDrugInteractions
            return await getCommonInteractions(drug1, drug2);
        },
        []
    );

    // Enhanced common interactions from OpenFDA adverse events
    const getCommonInteractions = useCallback(
        async (drug1: string, drug2: string): Promise<DrugInteraction[]> => {
            const interactions: DrugInteraction[] = [];

            try {
                // Clean drug names for better matching
                const cleanDrug1 = drug1.replace(/[^\w\s]/g, "").trim();
                const cleanDrug2 = drug2.replace(/[^\w\s]/g, "").trim();

                // Try multiple search strategies
                const searchQueries = [
                    `patient.drug.medicinalproduct:"${cleanDrug1}"+AND+patient.drug.medicinalproduct:"${cleanDrug2}"`,
                    `patient.drug.activesubstance.activesubstancename:"${cleanDrug1}"+AND+patient.drug.activesubstance.activesubstancename:"${cleanDrug2}"`,
                    `patient.drug.drugindication:"${cleanDrug1}"+AND+patient.drug.drugindication:"${cleanDrug2}"`,
                ];

                for (const query of searchQueries) {
                    try {
                        const response = await fetch(
                            `${OPENFDA_BASE_URL}/drug/event.json?search=${encodeURIComponent(
                                query
                            )}&limit=5`,
                            {
                                method: "GET",
                                headers: {
                                    Accept: "application/json",
                                },
                            }
                        );

                        if (response.ok) {
                            const data = await response.json();

                            if (data.results && data.results.length > 0) {
                                // Analyze the adverse events to determine interaction severity
                                const totalEvents =
                                    data.meta?.results?.total ||
                                    data.results.length;
                                let severity = "moderate";

                                if (totalEvents > 100) {
                                    severity = "major";
                                } else if (totalEvents > 500) {
                                    severity = "contraindicated";
                                }

                                // Look for serious outcomes
                                const seriousOutcomes = data.results.some(
                                    (result: any) =>
                                        result.serious === "1" ||
                                        result.seriousnessother === "1" ||
                                        result.seriousnesshospitalization ===
                                            "1" ||
                                        result.seriousnessdeath === "1"
                                );

                                if (seriousOutcomes) {
                                    severity =
                                        severity === "moderate"
                                            ? "major"
                                            : severity;
                                }

                                interactions.push({
                                    severity: severity as any,
                                    description: `Potential interaction detected between ${drug1} and ${drug2} based on ${totalEvents} reported adverse events`,
                                    recommendation:
                                        severity === "major" ||
                                        severity === "contraindicated"
                                            ? "Consult your healthcare provider before taking these medications together."
                                            : "Monitor for adverse effects and consult your healthcare provider if you experience unusual symptoms.",
                                    interactionType: "drug-drug",
                                    interactingDrug: drug2,
                                });

                                break; // Stop after first successful query
                            }
                        }
                    } catch (queryError) {
                        console.warn(
                            `FDA query failed for: ${query}`,
                            queryError
                        );
                        continue;
                    }
                }
            } catch (error) {
                console.error(
                    "Error getting common interactions from FDA:",
                    error
                );
            }

            return interactions;
        },
        []
    );

    // Comprehensive medicine analysis with enhanced interaction checking
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

                // Check for interactions using enhanced method
                const interactions = await checkDrugInteractions(drug);

                // Generate categorized warnings
                const warnings: string[] = [];
                const foodInteractions: string[] = [];
                const allergyWarnings: string[] = [];

                interactions.forEach((interaction) => {
                    switch (interaction.interactionType) {
                        case "drug-food":
                            foodInteractions.push(interaction.description);
                            if (
                                interaction.severity === "major" ||
                                interaction.severity === "contraindicated"
                            ) {
                                warnings.push(interaction.description);
                            }
                            break;
                        case "drug-allergy":
                            allergyWarnings.push(interaction.description);
                            warnings.push(interaction.description);
                            break;
                        case "drug-condition":
                            warnings.push(interaction.description);
                            break;
                        case "drug-drug":
                            warnings.push(interaction.description);
                            break;
                        default:
                            warnings.push(interaction.description);
                    }
                });

                // Remove duplicates and sort by severity
                const uniqueWarnings = [...new Set(warnings)];
                const uniqueFoodInteractions = [...new Set(foodInteractions)];
                const uniqueAllergyWarnings = [...new Set(allergyWarnings)];

                return {
                    drug,
                    interactions,
                    warnings: uniqueWarnings,
                    foodInteractions: uniqueFoodInteractions,
                    allergyWarnings: uniqueAllergyWarnings,
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

    // Get detailed drug information from OpenFDA (enhanced with better error handling)
    const getDrugLabelInfo = useCallback(async (drugName: string) => {
        try {
            const cleanDrugName = drugName.replace(/[^\w\s]/g, "").trim();

            // Try multiple search strategies
            const searchStrategies = [
                `openfda.brand_name:"${cleanDrugName}"`,
                `openfda.generic_name:"${cleanDrugName}"`,
                `openfda.substance_name:"${cleanDrugName}"`,
                `openfda.brand_name:${cleanDrugName}`,
                `openfda.generic_name:${cleanDrugName}`,
            ];

            for (const searchQuery of searchStrategies) {
                try {
                    const response = await fetch(
                        `${OPENFDA_BASE_URL}/drug/label.json?search=${encodeURIComponent(
                            searchQuery
                        )}&limit=1`
                    );

                    if (response.ok) {
                        const data = await response.json();
                        if (data.results && data.results.length > 0) {
                            return data.results[0];
                        }
                    }
                } catch (strategyError) {
                    console.warn(
                        `Search strategy failed: ${searchQuery}`,
                        strategyError
                    );
                    continue;
                }
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
