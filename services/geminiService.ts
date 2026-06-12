
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Condition, MaterialCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMaterialImage = async (base64Image: string): Promise<AnalysisResult[]> => {
  try {
    // Extract MIME type dynamically from the Data URL (e.g. data:image/png;base64,...)
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    // Remove the Data URL header to get the raw base64 string
    const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    const prompt = `
      Analyze this image of construction materials. 
      Detect and list ALL distinct items or groups of materials visible (e.g., "Stack of Plywood", "Copper Pipes", "Bucket of Paint").
      For EACH distinct item found:
      1. Identify the material name and category.
      2. Assess its physical condition.
      3. Provide a reusability score (0-100).
      4. Estimate resale value (EUR) for the visible quantity.
      5. Estimate the quantity (e.g., "10 Bricks", "15m", "3 Bags", "1 Unit").
      6. Provide a 2D bounding box [ymin, xmin, ymax, xmax] for the item (0-1 scale).
      7. Suggest the best action.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Descriptive title (e.g. 'Red Bricks')" },
              category: { 
                type: Type.STRING, 
                enum: [
                  MaterialCategory.WOOD,
                  MaterialCategory.METAL,
                  MaterialCategory.CONCRETE,
                  MaterialCategory.BRICK,
                  MaterialCategory.GLASS,
                  MaterialCategory.PLASTIC,
                  MaterialCategory.ELECTRICAL,
                  MaterialCategory.OTHER
                ]
              },
              condition: {
                type: Type.STRING,
                enum: [
                  Condition.NEW,
                  Condition.GOOD,
                  Condition.FAIR,
                  Condition.POOR,
                  Condition.SCRAP
                ]
              },
              reusabilityScore: { type: Type.NUMBER },
              estimatedValue: { type: Type.NUMBER },
              description: { type: Type.STRING, description: "Concise description" },
              quantity: { type: Type.STRING, description: "Estimated quantity (e.g. '5 units', '10m')" },
              suggestedAction: { type: Type.STRING },
              box_2d: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                description: "Bounding box in [ymin, xmin, ymax, xmax] format"
              }
            },
            required: ["name", "category", "condition", "reusabilityScore", "estimatedValue", "description", "quantity", "suggestedAction"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult[];

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze material. Please try again.");
  }
};
