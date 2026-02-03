
import { GoogleGenAI, Type } from "@google/genai";
import { Job } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchJobsWithGemini = async (query: string, location: string): Promise<Job[]> => {
  try {
    const prompt = `Search for current job openings in ${location}, Nigeria for the role: "${query}". 
    Provide realistic job listings based on current trends.
    Include details like title, company, location, type (Full-time, etc.), and a direct link to apply.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              type: { type: Type.STRING },
              postedAt: { type: Type.STRING },
              description: { type: Type.STRING },
              sourceUrl: { type: Type.STRING },
              category: { type: Type.STRING },
              salary: { type: Type.STRING }
            },
            required: ["title", "company", "location", "sourceUrl"]
          }
        }
      }
    });

    const textOutput = response.text;
    if (textOutput) {
      try {
        return JSON.parse(textOutput);
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON output:", parseError);
        return [];
      }
    }
    return [];
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};

export interface AIInsights {
  pros: string[];
  requirements: string[];
  summary: string;
}

export const getJobInsights = async (jobDescription: string): Promise<AIInsights> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this job description and provide structured insights: "${jobDescription}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 compelling reasons to apply" },
            requirements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 2 critical candidate requirements" },
            summary: { type: Type.STRING, description: "A brief 2-sentence summary of the role's impact" }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { pros: [], requirements: [], summary: "Error generating insights." };
  }
};

export interface CVAnalysis {
  matchScore: number;
  missingKeywords: string[];
  suggestions: string[];
  verdict: string;
}

export const analyzeCVForJob = async (jobDescription: string, cvText: string): Promise<CVAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Compare this CV against this Job Description.
      CV: ${cvText}
      Job: ${jobDescription}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER, description: "Percentage match from 0 to 100" },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords or skills missing from CV" },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Concrete advice to improve the CV for this specific role" },
            verdict: { type: Type.STRING, description: "Final assessment: Highly Recommended, Good Fit, or Not Suitable" }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { matchScore: 0, missingKeywords: [], suggestions: ["Error during analysis."], verdict: "Unknown" };
  }
};
