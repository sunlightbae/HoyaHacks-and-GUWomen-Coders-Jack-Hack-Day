
import { GoogleGenAI, Type } from "@google/genai";
import { Category } from "../types";

const API_KEY = process.env.API_KEY;
const hasApiKey = API_KEY && API_KEY !== "undefined" && API_KEY !== "";

export interface ProcessedPostData {
  category: Category;
  extractedLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

// Local fallback for offline/no-key hackathon use
const localProcessFallback = (text: string): Category => {
  const lower = text.toLowerCase();
  if (lower.includes('safe') || lower.includes('police') || lower.includes('danger') || lower.includes('suspicious')) return Category.SAFETY;
  if (lower.includes('help') || lower.includes('urgent') || lower.includes('emergency') || lower.includes('stuck')) return Category.URGENT;
  if (lower.includes('free') || lower.includes('giveaway') || lower.includes('donation') || lower.includes('canned')) return Category.GIVEAWAY;
  if (lower.includes('volunteer') || lower.includes('cleanup') || lower.includes('community') || lower.includes('impact')) return Category.SOCIAL_IMPACT;
  return Category.GENERAL;
};

export const processPostContent = async (text: string, providedAddress?: string): Promise<ProcessedPostData> => {
  // If no API key, use local logic immediately
  if (!hasApiKey) {
    console.warn("No API Key found. Using local keyword fallback.");
    return { category: localProcessFallback(text) };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `
      Analyze this community announcement for Washington DC: "${text}".
      ${providedAddress ? `The user provided this address: "${providedAddress}".` : "Try to extract a location from the text if mentioned (e.g. 14th and U, Columbia Heights)."}
      
      Task:
      1. Categorize it as one of: Safety, Urgent Help, Giveaway, Social Impact, General.
      2. If an address is provided or mentioned, return the approximate latitude and longitude within Washington, DC.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'The best fitting category',
              enum: Object.values(Category),
            },
            location: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
                address: { type: Type.STRING }
              },
              required: ['lat', 'lng', 'address']
            }
          },
          required: ['category'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return {
      category: (result.category as Category) || localProcessFallback(text),
      extractedLocation: result.location
    };
  } catch (error) {
    console.error("Gemini API error (likely quota or key issue):", error);
    return { category: localProcessFallback(text) };
  }
};
