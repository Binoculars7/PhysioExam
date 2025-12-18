
import { GoogleGenAI } from "@google/genai";

/**
 * Service for interacting with Google GenAI Gemini models.
 * Optimized for high-yield, concise physiology study guides.
 */

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateAnswer(question: string): Promise<string> {
  // Create a new GoogleGenAI instance right before making an API call 
  // to ensure it always uses the most up-to-date API key from the environment.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let attempt = 0;
  const maxRetries = 3;
  let delay = 2000;

  while (attempt <= maxRetries) {
    try {
      // Using gemini-3-flash-preview for medical Q&A tasks as recommended
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a world-class Physiology Professor known for "High-Yield" exam prep. 
        Your task is to provide a punchy, ultra-concise, and highly structured study guide for: "${question}"
        
        CRITICAL RULES:
        - NO FLUFF: Get straight to the point. 
        - HIGH YIELD: Focus only on the most important mechanisms, definitions, and values.
        - TONE: Professional but energetic and direct.
        - STRUCTURE: Use short bullet points rather than long paragraphs.
        
        Formatting:
        - Use **BOLD HEADERS** for distinct parts of the question.
        - Use • bullet points for all lists.
        - **Bold** every key term or medical value (e.g., **70 mL**, **Action Potential**).
        - Ensure every sub-part of the user's prompt is answered, but keep each answer to 2-3 sentences max.`,
        config: {
          temperature: 0.2, // Lower temperature for more focused, factual answers
        }
      });

      // Access the .text property directly (not a method) to get the generated content
      const text = response.text;
      if (!text) throw new Error("Empty response");
      return text;

    } catch (error: any) {
      // Implement robust handling for API errors and rate limits
      const isRateLimit = error?.message?.includes('429') || error?.status === 429;
      
      if (isRateLimit && attempt < maxRetries) {
        console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
        await wait(delay);
        attempt++;
        delay *= 2; // Exponential backoff for retries
        continue;
      }
      
      console.error("Gemini API Error:", error);
      if (isRateLimit) {
        throw new Error("API Limit reached. Please wait a few seconds before trying again.");
      }
      throw new Error("Failed to generate answer. Check your internet connection.");
    }
  }
  throw new Error("Max retries exceeded.");
}
