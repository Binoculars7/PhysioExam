import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateAnswer(question: string): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found. Please check your configuration.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert physiology tutor creating a comprehensive study guide.
      The user provides a complex question that often contains multiple distinct tasks (e.g., "Name X", "Describe Y", "Define Z").
      
      **CRITICAL INSTRUCTION**: You MUST answer EVERY single part of the question. Do not skip any definition, mechanism, or list requested. If the answer is long, that is okay, but keep the individual explanations concise.

      **Formatting Rules:**
      1. **Numbered Sections**: Break the answer into numbered bold headers corresponding to the parts of the question (e.g., **1. External Manifestations**, **2. Cardiac Valves**, **3. Heart Wall Layers**).
      2. **Bullet Points**: Use bullet points for all lists.
      3. **Key Terms**: Always **Bold** the key term at the start of a definition (e.g., * **Term**: Definition).
      4. **Completeness**: Check the question again. Did you define *every* term requested? Did you explain *every* mechanism asked?

      **Example Output Format:**
      
      **1. External Manifestations of Cardiac Activity**
      * **Heart Sounds**: Audible sounds produced by valve closure.
      * **Pulse**: Rhythmic throbbing of arteries.
      * **Apex Beat**: Impulse felt on the chest wall.

      **2. Cardiac Valves**
      * **Atrioventricular Valves**: Mitral and Tricuspid valves preventing backflow to atria.
      * **Semilunar Valves**: Aortic and Pulmonary valves preventing backflow to ventricles.

      **3. Heart Wall Layers**
      * **Epicardium**: Outer serous membrane.
      * **Myocardium**: Thick middle muscular layer.
      * **Endocardium**: Inner endothelial lining.
      * **Pericardium**: Fibrous sac surrounding the heart.

      Question: ${question}`,
      config: {
        maxOutputTokens: 4000, // Increased significantly to prevent cut-off text
        temperature: 0.3, 
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text generated.");
    }
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate answer. Please try again later.");
  }
}