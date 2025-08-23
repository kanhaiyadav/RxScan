import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

export interface UserHealthProfile {
  allergies: string[];
  medicalConditions: string[];
  currentMedications: MedicationLocal[];
  dietaryRestrictions: string[];
  emergencyContacts?: {
    name: string;
    phone: string;
    relationship: string;
  }[];
  bloodType?: string;
  dateOfBirth?: string;
  weight?: number;
  height?: number;
  additionalNotes?: string;
}

interface UserHealthState {
  healthProfile: UserHealthProfile | null;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  step: number; // Track the current step in the onboarding process
}

type UserHealthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_HEALTH_PROFILE'; payload: UserHealthProfile }
  | { type: 'UPDATE_ALLERGIES'; payload: string[] }
  | { type: 'UPDATE_CONDITIONS'; payload: string[] }
  | { type: 'UPDATE_MEDICATIONS'; payload: MedicationLocal[] }
  | { type: 'UPDATE_DIETARY_RESTRICTIONS'; payload: string[] }
  | { type: 'ADD_EMERGENCY_CONTACT'; payload: { name: string; phone: string; relationship: string } }
  | { type: 'REMOVE_EMERGENCY_CONTACT'; payload: number }
  | { type: 'UPDATE_ADDITIONAL_NOTES'; payload: string }
  | { type: 'SET_ONBOARDING_COMPLETE'; payload: boolean }
  | { type: 'RESET_PROFILE' }
  | { type: 'UPDATE_STEP'; payload: number };

const initialState: UserHealthState = {
  healthProfile: null,
  isLoading: true,
  isOnboardingComplete: false,
  step: 1, // Initialize the step to 1
};

const userHealthReducer = (state: UserHealthState, action: UserHealthAction): UserHealthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_HEALTH_PROFILE':
      return {
        ...state,
        healthProfile: action.payload,
        isOnboardingComplete: true,
        isLoading: false,
      };

    case 'UPDATE_ALLERGIES':
      return {
        ...state,
        healthProfile: state.healthProfile
          ? { ...state.healthProfile, allergies: action.payload }
          : null,
      };

    case 'UPDATE_CONDITIONS':
      return {
        ...state,
        healthProfile: state.healthProfile
          ? { ...state.healthProfile, medicalConditions: action.payload }
          : null,
      };

    case 'UPDATE_MEDICATIONS':
      return {
        ...state,
        healthProfile: state.healthProfile
          ? { ...state.healthProfile, currentMedications: action.payload }
          : null,
      };

    case 'UPDATE_DIETARY_RESTRICTIONS':
      return {
        ...state,
        healthProfile: state.healthProfile
          ? { ...state.healthProfile, dietaryRestrictions: action.payload }
          : null,
      };

    case 'ADD_EMERGENCY_CONTACT':
      const currentContacts = state.healthProfile?.emergencyContacts || [];
      return {
        ...state,
        healthProfile: state.healthProfile
          ? {
            ...state.healthProfile,
            emergencyContacts: [...currentContacts, action.payload],
          }
          : null,
      };

    case 'REMOVE_EMERGENCY_CONTACT':
      const filteredContacts = state.healthProfile?.emergencyContacts?.filter(
        (_, index) => index !== action.payload
      ) || [];
      return {
        ...state,
        healthProfile: state.healthProfile
          ? { ...state.healthProfile, emergencyContacts: filteredContacts }
          : null,
      };
    
    case 'UPDATE_ADDITIONAL_NOTES':
      return {
        ...state,
        healthProfile: state.healthProfile
          ? { ...state.healthProfile, additionalNotes: action.payload }
          : null,
      };

    case 'SET_ONBOARDING_COMPLETE':
      return { ...state, isOnboardingComplete: action.payload };

    case 'RESET_PROFILE':
      return { ...initialState, isLoading: false };
    
    case 'UPDATE_STEP':
      return { ...state, step: action.payload };

    default:
      return state;
  }
};

interface MedicationLocal {
  name: string;
  dosage: string;
  frequency: string;
}

interface UserHealthContextType {
  state: UserHealthState;
  healthProfile: UserHealthProfile | null;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  setHealthProfile: (profile: UserHealthProfile) => Promise<void>;
  updateAllergies: (allergies: string[]) => Promise<void>;
  updateMedicalConditions: (conditions: string[]) => Promise<void>;
  updateCurrentMedications: (medications: MedicationLocal[]) => Promise<void>;
  updateDietaryRestrictions: (restrictions: string[]) => Promise<void>;
  addEmergencyContact: (contact: { name: string; phone: string; relationship: string }) => Promise<void>;
  removeEmergencyContact: (index: number) => Promise<void>;
  updateAdditionalNotes: (notes: string) => Promise<void>;
  updateStep: (step?: number) => Promise<void>;
  resetProfile: () => Promise<void>;
  loadProfile: () => Promise<void>;
}

const UserHealthContext = createContext<UserHealthContextType | undefined>(undefined);

const STORAGE_KEY = '@RxScan:UserHealthProfile';

interface UserHealthProviderProps {
  children: ReactNode;
}

export const UserHealthProvider: React.FC<UserHealthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(userHealthReducer, initialState);

  // Load profile from AsyncStorage on app start
  const loadProfile = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const storedProfile = await AsyncStorage.getItem(STORAGE_KEY);

      if (storedProfile) {
        const parsedProfile: UserHealthProfile = JSON.parse(storedProfile);
        dispatch({ type: 'SET_HEALTH_PROFILE', payload: parsedProfile });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error loading health profile:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Save profile to AsyncStorage
  const saveProfile = async (profile: UserHealthProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving health profile:', error);
      throw error;
    }
  };

  // Set complete health profile
  const setHealthProfile = async (profile: UserHealthProfile) => {
    try {
      await saveProfile(profile);
      dispatch({ type: 'SET_HEALTH_PROFILE', payload: profile });
    } catch (error) {
      console.error('Error setting health profile:', error);
      throw error;
    }
  };

  const ensureProfileExists = (): UserHealthProfile => {
    if (state.healthProfile) {
      return state.healthProfile;
    }

    // Create a default profile if none exists
    const defaultProfile: UserHealthProfile = {
      allergies: [],
      medicalConditions: [],
      currentMedications: [],
      dietaryRestrictions: [],
    };

    return defaultProfile;
  };

  // Update allergies
  const updateAllergies = async (allergies: string[]) => {
    const currentProfile = ensureProfileExists();
    const updatedProfile = { ...currentProfile, allergies };

    try {
      await saveProfile(updatedProfile);
      dispatch({ type: 'SET_HEALTH_PROFILE', payload: updatedProfile });
    } catch (error) {
      console.error('Error updating allergies:', error);
      throw error;
    }
  };

  // Update medical conditions
  const updateMedicalConditions = async (conditions: string[]) => {
    const currentProfile = ensureProfileExists();
    const updatedProfile = { ...currentProfile, medicalConditions: conditions };

    try {
      await saveProfile(updatedProfile);
      dispatch({ type: 'SET_HEALTH_PROFILE', payload: updatedProfile });
    } catch (error) {
      console.error('Error updating medical conditions:', error);
      throw error;
    }
  };

  // Update current medications
  const updateCurrentMedications = async (medications: MedicationLocal[]) => {
    const currentProfile = ensureProfileExists();
    const updatedProfile = { ...currentProfile, currentMedications: medications };

    try {
      await saveProfile(updatedProfile);
      dispatch({ type: 'SET_HEALTH_PROFILE', payload: updatedProfile });
    } catch (error) {
      console.error('Error updating current medications:', error);
      throw error;
    }
  };

  // Update dietary restrictions
  const updateDietaryRestrictions = async (restrictions: string[]) => {
    const currentProfile = ensureProfileExists();
    const updatedProfile = { ...currentProfile, dietaryRestrictions: restrictions };

    try {
      await saveProfile(updatedProfile);
      dispatch({ type: 'SET_HEALTH_PROFILE', payload: updatedProfile });
    } catch (error) {
      console.error('Error updating dietary restrictions:', error);
      throw error;
    }
  };

  // Add emergency contact
  const addEmergencyContact = async (contact: { name: string; phone: string; relationship: string }) => {
    const currentProfile = ensureProfileExists();
    const updatedProfile = {
      ...currentProfile,
      emergencyContacts: [...(currentProfile.emergencyContacts || []), contact],
    };

    try {
      await saveProfile(updatedProfile);
      dispatch({ type: 'SET_HEALTH_PROFILE', payload: updatedProfile });
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      throw error;
    }
  };

  // Remove emergency contact
  const removeEmergencyContact = async (index: number) => {
    const currentProfile = ensureProfileExists();
    const updatedContacts = currentProfile.emergencyContacts?.filter((_, i) => i !== index) || [];
    const updatedProfile = { ...currentProfile, emergencyContacts: updatedContacts };

    try {
      await saveProfile(updatedProfile);
      dispatch({ type: 'SET_HEALTH_PROFILE', payload: updatedProfile });
    } catch (error) {
      console.error('Error removing emergency contact:', error);
      throw error;
    }
  };

  // Update additional notes (if applicable)
  const updateAdditionalNotes = async (notes: string) => {
    const currentProfile = ensureProfileExists();
    const updatedProfile = { ...currentProfile, additionalNotes: notes };

    try {
      await saveProfile(updatedProfile);
      dispatch({ type: 'SET_HEALTH_PROFILE', payload: updatedProfile });
    } catch (error) {
      console.error('Error updating additional notes:', error);
      throw error;
    }
  };

  // Update the current step in the onboarding process
  const updateStep = async (step?: number) => {
    try {
      if (step) {
        dispatch({ type: 'UPDATE_STEP', payload: step });
      } else {
        dispatch({ type: 'UPDATE_STEP', payload: state.step + 1 });
      }
    } catch (error) {
      console.error('Error updating step:', error);
      throw error;
    }
  };

  // Reset profile (for logout or data clearing)
  const resetProfile = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      dispatch({ type: 'RESET_PROFILE' });
    } catch (error) {
      console.error('Error resetting profile:', error);
      throw error;
    }
  };

  // Load profile on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const contextValue: UserHealthContextType = {
    state,
    healthProfile: state.healthProfile,
    isLoading: state.isLoading,
    isOnboardingComplete: state.isOnboardingComplete,
    setHealthProfile,
    updateAllergies,
    updateMedicalConditions,
    updateCurrentMedications,
    updateDietaryRestrictions,
    addEmergencyContact,
    removeEmergencyContact,
    updateAdditionalNotes,
    updateStep,
    resetProfile,
    loadProfile,
  };

  return (
    <UserHealthContext.Provider value={contextValue}>
      {children}
    </UserHealthContext.Provider>
  );
};

// Custom hook to use the context
export const useUserHealth = (): UserHealthContextType => {
  const context = useContext(UserHealthContext);
  if (!context) {
    throw new Error('useUserHealth must be used within a UserHealthProvider');
  }
  return context;
};

export { UserHealthContext };
