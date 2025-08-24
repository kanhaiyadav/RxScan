// prescriptionNarrativeService.ts
import { PrescriptionData } from "@/types/prescription";
import { GoogleGenAI } from "@google/genai";
import { useState, useCallback } from "react";

interface NarrativeOptions {
    language?: string;
    structured?: boolean;
}

interface NarrativeResult {
    success: boolean;
    narrative?: string;
    language?: string;
    wordCount?: number;
    estimatedDuration?: number;
    error?: string;
}

class PrescriptionNarrativeService {
    private genAI: GoogleGenAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenAI({ apiKey });
    }

    // Main method to convert OCR JSON to medical narrative
    async convertToNarrative(
        ocrData: PrescriptionData,
        targetLanguage: string = "English",
    ): Promise<string> {
        try {
            const prompt = this.buildPrompt(
                ocrData,
                targetLanguage,
            );
            const result = await this.genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            return result.text || "Unable to generate narrative from the provided prescription data.";
        } catch (error: any) {
            throw new Error(`Failed to generate narrative: ${error.message}`);
        }
    }

    // Build comprehensive prompt for medical narrative generation
    private buildPrompt(
        ocrData: PrescriptionData,
        targetLanguage: string,
    ): string {

        const effectivePatientName = ocrData.patient?.name || "the patient";

        return `You are an experienced medical professional explaining a prescription to ${effectivePatientName}. 
    
Convert the following prescription information into a clear, comprehensive medical narrative in ${targetLanguage}.

PRESCRIPTION INFORMATION:
${JSON.stringify(ocrData, null, 2)}

INSTRUCTIONS:
1. Generate the narrative entirely in ${targetLanguage}
2. Explain the prescription as if you're a doctor speaking directly to the patient
3. Use clear, patient-friendly language while maintaining medical accuracy
4. Address the patient by name when available
5. Structure the narrative to include:
   - Personal greeting with patient name, age, and date
   - Doctor/clinic information
   - Brief explanation of the treatment plan
   - Detailed explanation of each medication including:
     * Medication name and purpose
     * Exact dosage and strength (when available)
     * Frequency and timing instructions
     * Duration of treatment
     * Special instructions (before/after meals, massage technique, etc.)
     * Important notes about the medication
   - Summary of the complete treatment schedule
   - General advice and encouragement
   - Contact information for questions

MEDICATION HANDLING GUIDELINES:
- For Augmentin 625mg: Explain it's an antibiotic for bacterial infections
- For Enzoflam: Explain it's an anti-inflammatory pain reliever  
- For Pan-D 40mg: Explain it's for acid reduction and stomach protection
- For Hexigel gum paint: Explain it's a topical antiseptic for oral care
- Always mention the timing relative to meals clearly
- Explain massage technique for topical applications
- Emphasize completing the full course of antibiotics

NARRATIVE STYLE GUIDELINES:
- Start with a greeting and context
- Use conversational but professional tone
- Explain medical terms in simple language
- Group related medications together
- Provide practical guidance for taking medications
- End with encouragement and next steps
- Ensure cultural sensitivity for the target language

EXAMPLE STRUCTURE for the given prescription format:
"Hello ${effectivePatientName}, this is your prescription from ${
            ocrData.doctor?.clinic_name || "your clinic"
        } dated ${
            ocrData.patient?.prescription_date || "today"
        }. You are a ${
            ocrData.patient?.age
        }-year-old ${ocrData.patient?.gender?.toLowerCase()} and I'm going to explain your complete treatment plan..."

OUTPUT REQUIREMENTS:
- Generate ONLY the narrative text
- No JSON, markdown, or formatting
- No markdown symbols like * or \` etc.
- Complete sentences and proper grammar in ${targetLanguage}
- Natural speech patterns suitable for text-to-speech
- Length: 2-4 minutes when spoken (approximately 300-600 words)

If any critical information is missing or unclear from the OCR data, mention it appropriately in the narrative.`;
    }

    // Alternative method for structured narrative with sections
    async convertToStructuredNarrative(
        ocrData: PrescriptionData,
        targetLanguage: string = "English",
        patientName: string | null = null
    ): Promise<string> {
        try {
            const prompt = this.buildStructuredPrompt(
                ocrData,
                targetLanguage,
                patientName
            );
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            throw new Error(
                `Failed to generate structured narrative: ${error.message}`
            );
        }
    }

    private buildStructuredPrompt(
        ocrData: OCRResponse | PrescriptionData,
        targetLanguage: string,
        patientName: string | null
    ): string {
        // Extract data from the nested structure
        const prescriptionData = (ocrData as OCRResponse).success
            ? (ocrData as OCRResponse).data
            : ocrData;
        let parsedData: PrescriptionData = prescriptionData as PrescriptionData;

        // If raw_response contains JSON string, parse it
        if ("raw_response" in prescriptionData) {
            try {
                const cleanJson = prescriptionData.raw_response.replace(
                    /```json\s*|\s*```/g,
                    ""
                );
                parsedData = JSON.parse(cleanJson) as PrescriptionData;
            } catch (e) {
                parsedData = prescriptionData as PrescriptionData;
            }
        }

        const effectivePatientName =
            patientName || parsedData.patient?.name || "the patient";

        return `You are a medical professional explaining a prescription to ${effectivePatientName}. Convert the following prescription information into a concise, clear medical narrative in ${targetLanguage}.

PRESCRIPTION INFORMATION: ${JSON.stringify(ocrData, null, 2)}

INSTRUCTIONS:
1. Generate the narrative entirely in ${targetLanguage}
2. Use clear, conversational language suitable for voice output
3. Prioritize essential medication information over formalities
4. Keep total length under 300 words (1.5-2 minutes spoken)

STRUCTURE (in order of priority):
1. **Brief greeting** - Just name and basic context (1 sentence)
2. **Core medications** - For each medication:
   - Name and primary purpose
   - Dosage and frequency 
   - Key timing instructions (meals, etc.)
   - Duration if specified
3. **Important reminders** - Only critical points like completing antibiotic courses
4. **Closing** - Brief encouragement and clinic contact if questions arise

MEDICATION GUIDELINES:
- Augmentin 625mg: "antibiotic for infection"
- Pan-D 40mg: "for acid reduction" 
- Enzoflam: "anti-inflammatory for pain/swelling"
- Hexigel: "antiseptic gel for mouth/gums"

STYLE REQUIREMENTS:
- Start immediately with: "Hello ${effectivePatientName}, here are your medications from ${ocrData.doctor?.clinic_name || "your doctor"}."
- Group related medications naturally
- Avoid repeating medication names unnecessarily
- Use "this medication" or "it" for subsequent references
- Skip patient age/gender unless medically relevant
- No markdown formatting or bullet points
- Natural speech flow for text-to-speech

EXAMPLE FLOW:
"Hello [Name], here are your medications from [Clinic]. You have [X] medications to take. 

First, take Augmentin 625mg twice daily after meals for bacterial infection - continue the full course even if you feel better. 

Pan-D should be taken once daily before breakfast for stomach acid control.

For pain relief, take Enzoflam as directed when needed.

[Additional specific instructions only if critical]

Complete all medications as prescribed. Contact [clinic] if you have questions."

OUTPUT: Generate ONLY the narrative text with no formatting, suitable for direct text-to-speech conversion.` 
    }

    // Method to get supported languages (extend as needed)
    getSupportedLanguages(): string[] {
        return [
            "English",
            "Spanish",
            "French",
            "German",
            "Italian",
            "Portuguese",
            "Hindi",
            "Bengali",
            "Tamil",
            "Telugu",
            "Marathi",
            "Gujarati",
            "Kannada",
            "Malayalam",
            "Punjabi",
            "Urdu",
            "Chinese",
            "Japanese",
            "Korean",
            "Arabic",
            "Russian",
        ];
    }
}

// Usage example and configuration
export default class PrescriptionService {
    private narrativeService: PrescriptionNarrativeService;

    constructor(geminiApiKey: string) {
        this.narrativeService = new PrescriptionNarrativeService(geminiApiKey);
    }

    async generateNarrative(
        ocrData: PrescriptionData,
        options: NarrativeOptions = {}
    ): Promise<NarrativeResult> {
        const {
            language = "English",
            structured = false,
        } = options;

        try {

            // Generate narrative
            const narrative: string = structured
                ? await this.narrativeService.convertToStructuredNarrative(
                      ocrData,
                      language,
                  )
                : await this.narrativeService.convertToNarrative(
                      ocrData,
                      language,
                  );

            return {
                success: true,
                narrative,
                language,
                wordCount: narrative.split(" ").length,
                estimatedDuration: Math.ceil(narrative.split(" ").length / 150), // ~150 words per minute
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                narrative: undefined,
            };
        }
    }
}

// React Native/Expo integration hook with TypeScript
interface UsePrescriptionNarrativeReturn {
    generateNarrative: (
        ocrData: PrescriptionData,
        options?: NarrativeOptions
    ) => Promise<NarrativeResult>;
    loading: boolean;
    error: string | null;
    clearError: () => void;
}

export const usePrescriptionNarrative = (
    geminiApiKey: string
): UsePrescriptionNarrativeReturn => {
    const [service] = useState(() => new PrescriptionService(geminiApiKey));
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const generateNarrative = useCallback(
        async (
            ocrData: PrescriptionData,
            options?: NarrativeOptions
        ): Promise<NarrativeResult> => {
            setLoading(true);
            setError(null);

            try {
                const result = await service.generateNarrative(
                    ocrData,
                    options
                );

                if (!result.success) {
                    throw new Error(result.error);
                }

                return result;
            } catch (err: any) {
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [service]
    );

    return {
        generateNarrative,
        loading,
        error,
        clearError: () => setError(null),
    };
};
