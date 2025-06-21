export interface DrugInfo {
    rxcui?: string;
    name: string;
    genericName?: string;
    brandNames?: string[];
    dosageForm?: string;
    strength?: string;
    activeIngredients?: string[];
    therapeuticClass?: string[];
    fdaApplicationNumber?: string;
}

export interface DrugInteraction {
    severity: "minor" | "moderate" | "major" | "contraindicated";
    description: string;
    mechanismOfAction?: string;
    clinicalEffects?: string;
    recommendation?: string;
    interactingDrug?: string;
    interactionType:
        | "drug-drug"
        | "drug-food"
        | "drug-allergy"
        | "drug-condition";
}

export interface UserHealthProfile {
    allergies: string[];
    medicalConditions: string[];
    currentMedications: string[];
    dietaryRestrictions: string[];
}

export interface MedicineSearchResult {
    drug: DrugInfo;
    interactions: DrugInteraction[];
    warnings: string[];
    foodInteractions: string[];
    allergyWarnings: string[];
}
