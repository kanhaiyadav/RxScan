export type PrescriptionStatus = "active" | "inactive" | "abandoned" | "completed";

export interface User {
  $id: string;
  email: string;
  name: string;
  emailVerification?: boolean;
  registration?: string;
}

export interface CurrentMedication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface HealthProfile {
  $id?: string;
  userId?: string;
  allergies: string[];
  medicalConditions: string[];
  currentMedications: CurrentMedication[];
  dietaryRestrictions: string[];
  emergencyContacts?: EmergencyContact[];
  bloodType?: string;
  dateOfBirth?: string;
  weight?: number;
  height?: number;
  additionalNotes?: string;
}

export interface Medicine {
  name: string;
  dosage?: string | null;
  quantity?: number | string | null;
  frequency?: string;
  duration?: string;
  instructions?: string;
  uncertain?: boolean;
}

export interface PrescriptionData {
  doctor?: {
    name?: string | null;
    qualifications?: string | null;
    registration_number?: string | null;
    clinic_name?: string | null;
    address?: string | null;
    phone?: string | null;
  };
  patient?: {
    name?: string | null;
    age?: string | null;
    gender?: string | null;
    address?: string | null;
    prescription_date?: string | null;
  };
  medications?: Medicine[];
  additional_notes?: {
    special_instructions?: string | null;
    follow_up?: string | null;
    warnings?: string | null;
  };
  extraction_notes?: string | null;
  raw_response?: string;
  note?: string;
}

export interface Prescription {
  $id: string;
  userId: string;
  image: string;
  object_key: string;
  ocrResult: PrescriptionData;
  searchResult: Record<string, unknown>;
  status: PrescriptionStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reminder {
  id: string;
  medicine: string;
  dosage?: string;
  time: string;
  frequency?: string;
  status: "pending" | "taken" | "skipped";
  prescriptionId?: string;
}
