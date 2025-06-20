import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface HealthProfile {
  allergies: string[];
  conditions: string[];
  currentMedications: Medication[];
  dietaryRestrictions: string[];
  additionalNotes: string;
  step: number;
}

interface HealthProfileContextType {
  healthProfile: HealthProfile;
  updateAllergies: (allergies: string[]) => void;
  updateConditions: (conditions: string[]) => void;
  updateMedications: (medications: Medication[]) => void;
  updateDietaryRestrictions: (restrictions: string[]) => void;
  updateAdditionalNotes: (notes: string) => void;
  resetProfile: () => void;
  updateStep: (num?: number | undefined) => void;
}

const initialHealthProfile: HealthProfile = {
  allergies: [],
  conditions: [],
  currentMedications: [],
  dietaryRestrictions: [],
  additionalNotes: '',
  step: 1
};

const HealthProfileContext = createContext<HealthProfileContextType | undefined>(undefined);

export const HealthProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [healthProfile, setHealthProfile] = useState<HealthProfile>(initialHealthProfile);

  const updateAllergies = (allergies: string[]) => {
    setHealthProfile(prev => ({ ...prev, allergies }));
  };

  const updateConditions = (conditions: string[]) => {
    setHealthProfile(prev => ({ ...prev, conditions }));
  };

  const updateMedications = (currentMedications: Medication[]) => {
    setHealthProfile(prev => ({ ...prev, currentMedications }));
  };

  const updateDietaryRestrictions = (dietaryRestrictions: string[]) => {
    setHealthProfile(prev => ({ ...prev, dietaryRestrictions }));
  };

  const updateAdditionalNotes = (additionalNotes: string) => {
    setHealthProfile(prev => ({ ...prev, additionalNotes }));
  };

  const resetProfile = () => {
    setHealthProfile(initialHealthProfile);
  };

    const updateStep = (num?: number|undefined) => {
      setHealthProfile(prev => {
        if (num !== undefined) {
          return { ...prev, step: num };
        }
        return { ...prev, step: prev.step + 1 };
      });
    };
  
    return (
      <HealthProfileContext.Provider
        value={{
          healthProfile,
          updateAllergies,
          updateConditions,
          updateMedications,
          updateDietaryRestrictions,
          updateAdditionalNotes,
          resetProfile,
          updateStep,
  
        }}
      >
        {children}
      </HealthProfileContext.Provider>
    );
  };
  
  export const useHealthProfile = () => {
    const context = useContext(HealthProfileContext);
    if (context === undefined) {
      throw new Error('useHealthProfile must be used within a HealthProfileProvider');
    }
    return context;
  };