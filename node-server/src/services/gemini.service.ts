import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export interface GeminiResponse {
    success: boolean;
    data?: any;
    error?: string;
}

class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is required");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });
    }

    /**
     * Generate content from text prompt
     */
    async generateContent(prompt: string): Promise<GeminiResponse> {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return {
                success: true,
                data: text,
            };
        } catch (error: any) {
            return {
                success: false,
                error: `Gemini API error: ${error.message}`,
            };
        }
    }

    /**
     * Generate content from prompt and image
     */
    async generateContentFromImage(
        prompt: string,
        imageParts: any[]
    ): Promise<GeminiResponse> {
        try {
            const result = await this.model.generateContent([
                prompt,
                ...imageParts,
            ]);
            const response = await result.response;
            const text = response.text();

            return {
                success: true,
                data: text,
            };
        } catch (error: any) {
            return {
                success: false,
                error: `Gemini API error: ${error.message}`,
            };
        }
    }

    /**
     * Parse JSON response from Gemini
     */
    parseJSONResponse(text: string): any {
        try {
            // Remove markdown code blocks if present
            const cleanedText = text
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();

            return JSON.parse(cleanedText);
        } catch (error) {
            // Return raw text if JSON parsing fails
            return {
                raw_response: text,
                note: "Could not parse as JSON, returning raw text",
            };
        }
    }

    /**
     * Generic method for custom prompts
     */
    async processCustomPrompt(
        prompt: string,
        options?: {
            parseJSON?: boolean;
            includeImages?: any[];
        }
    ): Promise<GeminiResponse> {
        try {
            let result;

            if (options?.includeImages && options.includeImages.length > 0) {
                result = await this.generateContentFromImage(
                    prompt,
                    options.includeImages
                );
            } else {
                result = await this.generateContent(prompt);
            }

            if (!result.success) {
                return result;
            }

            // Parse JSON if requested
            if (options?.parseJSON) {
                const parsedData = this.parseJSONResponse(result.data);
                return {
                    success: true,
                    data: parsedData,
                };
            }

            return result;
        } catch (error: any) {
            return {
                success: false,
                error: `Error processing prompt: ${error.message}`,
            };
        }
    }
}

const apiKey = process.env.GEMINI_API_KEY || "";
export const geminiService = new GeminiService(apiKey);

export default GeminiService;
