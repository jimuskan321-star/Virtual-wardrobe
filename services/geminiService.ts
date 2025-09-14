import { GoogleGenAI, Modality } from "@google/genai";
import type { ImagePart } from "../types";

// Initialize the Google GenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
// Use the 'gemini-2.5-flash-image-preview' model, also known as Nano Banana, for image editing.
const model = 'gemini-2.5-flash-image-preview';

export async function virtualTryOn(personImage: ImagePart, clothingImage: ImagePart): Promise<string | null> {
    const prompt = 'Take the clothing item from the second image and realistically place it on the person from the first image. Prioritize high resolution and photorealism. Preserve the person\'s pose and the original background. Ensure the clothing fits naturally. The output should be only the final photorealistic image.';

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    personImage,
                    clothingImage,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return part.inlineData.data; // Return base64 image data
                }
            }
        }
        
        console.warn("No image found in Gemini response", response);
        return null;

    } catch (error: any) {
        console.error("Error calling Gemini API:", error);

        if (error && error.message) {
            if (error.message.includes('API key not valid')) {
                throw new Error('Invalid API Key: Please ensure your key is correct and has permissions.');
            }
            if (error.message.includes('429')) { // Rate limiting
                throw new Error('Rate Limit Exceeded: You have made too many requests. Please wait and try again.');
            }
            if (error.message.includes('400')) { // Bad request
                throw new Error('Invalid Request: The images may be corrupted or in an unsupported format. Please try different images.');
            }
        }
        
        throw new Error("AI Generation Failed: An unexpected error occurred. Please try again later.");
    }
}