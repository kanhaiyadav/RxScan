export interface MedicineInput {
    dosage: string | null;
    duration: string;
    frequency: string;
    instructions: string;
    name: string;
    quantity: number | null;
    uncertain: boolean;
}

export interface CurrentMedication {
    name: string;
    dosage: string;
    frequency: string;
}

export interface HealthProfile {
    allergies: string[];
    medicalConditions: string[];
    currentMedications: CurrentMedication[];
    dietaryRestrictions: string[];
    additionalNotes: string;
}

export interface PrescriptionInput {
    prescription_medications: MedicineInput[];
    health_profile: HealthProfile;
}

export interface SideEffects {
    common: string[];
    serious: string[];
    rare: string[];
}

export interface Interactions {
    drugInteractions: string[];
    foodInteractions: string[];
    conditionInteractions: string[];
}

export interface OverdoseMissedDose {
    overdose: string | null;
    missedDose: string | null;
}

export interface Price {
    currency: string;
    priceRange: string;
    unit: string;
    lastUpdated: string;
}

export interface ActiveIngredient {
    name: string;
    strength: string;
    purpose: string;
}

export interface HealthProfileInteraction {
    type:
        | "allergy"
        | "medical_condition"
        | "current_medication"
        | "dietary_restriction";
    item: string;
    description: string;
    severity: "critical" | "high" | "moderate" | "low" | "info";
    recommendation: string;
}

export interface InteractionAnalysis {
    hasInteractions: boolean;
    criticalCount: number;
    highCount: number;
    moderateCount: number;
    lowCount: number;
    interactions: HealthProfileInteraction[];
    overallRisk: "critical" | "high" | "moderate" | "low" | "minimal";
    summary: string;
}

export interface MedicalInfo {
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
    // New field for health profile interactions
    healthProfileInteraction: InteractionAnalysis;
}

export interface CombinedMedicine {
    prescription: MedicineInput;
    medicalInfo: MedicalInfo;
}

export interface Source {
    index: number;
    title: string;
    url: string;
    domain: string;
}

export interface Citations {
    sources: Source[];
    queries: string[];
    hasGrounding: boolean;
}

export interface SearchMetadata {
    searchDate: string;
    originalCount: number;
    foundCount: number;
    sourcesCount?: number;
    reliability?: string;
    error?: string;
    parseError?: string;
    // New fields for health profile analysis
    totalInteractions: number;
    criticalInteractions: number;
    overallRiskLevel: string;
}

export interface MedicineSearchResult {
    medicines: CombinedMedicine[];
    searchMetadata: SearchMetadata;
    citations: Citations;
    // New field for overall health profile analysis
    overallHealthAnalysis: {
        riskLevel: "critical" | "high" | "moderate" | "low" | "minimal";
        summary: string;
        keyRecommendations: string[];
        requiresImmediateAttention: boolean;
    };
}

export interface UseMedicineSearchState {
    loading: boolean;
    error: string | null;
    searchResult: MedicineSearchResult | null;
}

export interface UseMedicineSearchReturn extends UseMedicineSearchState {
    searchMedicines: (
        prescriptionData: PrescriptionInput
    ) => Promise<MedicineSearchResult | null>;
    reset: () => void;
}

export interface Doctor {
    name?: string;
    qualifications?: string;
    registration_number?: string;
    clinic_name?: string;
    address?: string;
    phone?: string;
}

export interface Patient {
    name?: string;
    age?: string;
    gender?: string;
    address?: string;
    prescription_date?: string;
}

export interface AdditionalNotes {
    special_instructions?: string;
    follow_up?: string;
    warnings?: string;
}

export interface PrescriptionData {
    doctor?: Doctor;
    patient?: Patient;
    medications?: MedicineInput[];
    additional_notes?: AdditionalNotes;
    extraction_notes?: string;
    raw_response?: string;
    note?: string;
}

export interface ApiResponse {
    success: boolean;
    data?: PrescriptionData;
    error?: string;
}

export interface SelectedImage {
    uri: string;
    fileName?: string;
    fileSize?: number;
}

export interface Prescription {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    $databaseId: string;
    $collectionId: string;
    userId: string;
    image: string;
    object_key: string;
    ocrResult: PrescriptionData;
    searchResult: MedicineSearchResult;
    status: "active" | "completed" | "inactive" | "abandoned";
    createdAt: string;
    updatedAt: string;
}