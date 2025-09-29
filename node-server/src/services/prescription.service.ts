// src/services/prescription.service.ts
import sharp from "sharp";
import fs from "fs/promises";
import { geminiService } from "./gemini.service.js";

export interface PrescriptionResult {
    success: boolean;
    data?: any;
    error?: string;
    extraction_date?: string;
    image_path?: string;
}

class PrescriptionOCRService {
    /**
     * Preprocess image for better OCR results
     */
    async preprocessImage(
        imagePath: string,
        enhance: boolean = true
    ): Promise<Buffer> {
        if (!enhance) {
            return await fs.readFile(imagePath);
        }

        try {
            // Convert to grayscale and enhance using sharp
            const processedBuffer = await sharp(imagePath)
                .grayscale()
                .normalize() // Auto-adjust contrast
                .sharpen({ sigma: 2.0 })
                .blur(0.5)
                .toBuffer();

            return processedBuffer;
        } catch (error) {
            // If enhancement fails, return original
            return await fs.readFile(imagePath);
        }
    }

    /**
     * Convert image to Gemini-compatible format
     */
    async imageToGeminiFormat(imageBuffer: Buffer, mimeType: string) {
        return {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType,
            },
        };
    }

    /**
     * Extract prescription details from image
     */
    async extractPrescriptionDetails(
        imagePath: string,
        enhanceImage: boolean = true
    ): Promise<PrescriptionResult> {
        try {
            // Preprocess image
            const imageBuffer = await this.preprocessImage(
                imagePath,
                enhanceImage
            );

            // Determine MIME type
            const extension = imagePath.split(".").pop()?.toLowerCase();
            const mimeTypeMap: { [key: string]: string } = {
                png: "image/png",
                jpg: "image/jpeg",
                jpeg: "image/jpeg",
                gif: "image/gif",
                bmp: "image/bmp",
                tiff: "image/tiff",
                webp: "image/webp",
            };
            const mimeType = mimeTypeMap[extension || "jpeg"] || "image/jpeg";

            // Convert to Gemini format
            const imagePart = await this.imageToGeminiFormat(
                imageBuffer,
                mimeType
            );

            // Prepare prompt
            const prompt = `
You are a medical transcription expert. Analyze this prescription image and extract information in JSON format.

Return ONLY a valid JSON object with this exact structure:
{
    "doctor": {
        "name": "doctor name or null",
        "qualifications": "degrees/qualifications or null",
        "registration_number": "reg number or null",
        "clinic_name": "clinic/hospital name or null",
        "address": "clinic address or null",
        "phone": "phone number or null"
    },
    "patient": {
        "name": "patient name or null",
        "age": "age or null",
        "gender": "gender or null",
        "address": "patient address or null",
        "prescription_date": "date or null"
    },
    "medications": [
        {
            "name": "medicine name",
            "dosage": "strength/dosage",
            "quantity": "quantity prescribed",
            "frequency": "how often to take",
            "duration": "how long to take",
            "instructions": "special instructions",
            "uncertain": false
        }
    ],
    "additional_notes": {
        "special_instructions": "any special instructions or null",
        "follow_up": "follow-up date or instructions or null",
        "warnings": "warnings or precautions or null"
    },
    "extraction_notes": "any unclear text or reading difficulties"
}

Rules:

1. Use **null** for fields that are absent or unreadable.  
2. If any reading is doubtful, copy the raw text into \`instructions\` and set \`"uncertain": true\`.

3. **Interpreting timing codes**

• \`1\` or \`X\`  =  **take**  
• \`0\` or \`O\`  =  **skip** **unless** the code has **only O-O**, then treat each O as **take**.  
• Code length → times:  
    - 1 slot → once daily  
    - 2 slots → morning & night  
    - 3 slots → morning, afternoon, night  
    - 4 slots → every 6 hours  
• Expand the code into clear English in \`frequency\`, repeating any fractional dose in each phrase.

4. If brand name is given in prescription, output brand name. Don't convert it to generic drug name.
    If dosage is mentioned with name, let it be mentioned in the name, besides giving it seperately in the output. For example, if "Rantac 300" is given, output that, not "Rantac" or "Ranitidine".
5. Output only the final JSON – no other text, commentary, or markup.
`;

            // Call Gemini API
            const result = await geminiService.processCustomPrompt(prompt, {
                parseJSON: true,
                includeImages: [imagePart],
            });

            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                };
            }

            return {
                success: true,
                data: result.data,
                extraction_date: new Date().toISOString(),
                image_path: imagePath.split("/").pop(),
            };
        } catch (error: any) {
            return {
                success: false,
                error: `Error processing prescription: ${error.message}`,
            };
        }
    }
}

export const prescriptionOCRService = new PrescriptionOCRService();
