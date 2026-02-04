
import { GoogleGenAI, Type } from "@google/genai";
import { Job } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Utility for exponential backoff retries
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isTransient = error?.message?.includes('500') || 
                        error?.message?.includes('xhr error') || 
                        error?.message?.includes('deadline') ||
                        error?.status === 'UNKNOWN';

    if (retries > 0 && isTransient) {
      console.warn(`Gemini API transient error. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Parses natural language career queries into structured data
 */
export const parseCareerQuery = async (userInput: string): Promise<{ query: string, location: string }> => {
  return withRetry(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Extract the job title/role and location from this request: "${userInput}". 
        If no location is specified, default to "Lagos". 
        Format as JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              query: { type: Type.STRING },
              location: { type: Type.STRING }
            },
            required: ["query", "location"]
          }
        }
      });
      return JSON.parse(response.text || '{"query": "", "location": "Lagos"}');
    } catch (error) {
      return { query: userInput, location: "Lagos" };
    }
  });
};

/**
 * Search jobs using Gemini
 */
export const searchJobsWithGemini = async (query: string, location: string): Promise<Job[]> => {
  return withRetry(async () => {
    try {
      const prompt = `Search for current job openings in ${location}, Nigeria for the role: "${query}". 
      Provide realistic job listings based on current trends.`;

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

      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error("Gemini Search Error inside retry block:", error);
      throw error; // Rethrow to trigger retry or final catch
    }
  }).catch(err => {
    console.error("Final Gemini Search Error after retries:", err);
    return [];
  });
};

export interface AIInsights {
  pros: string[];
  requirements: string[];
  summary: string;
}

export const getJobInsights = async (jobDescription: string): Promise<AIInsights> => {
  return withRetry(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this job description: "${jobDescription}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pros: { type: Type.ARRAY, items: { type: Type.STRING } },
              requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      return { pros: [], requirements: [], summary: "Error generating insights." };
    }
  });
};

export interface CVAnalysis {
  matchScore: number;
  missingKeywords: string[];
  suggestions: string[];
  tailoringAdvice: string;
  verdict: string;
  recommendedJobIds?: string[];
}

/**
 * Deep Analysis of a CV against a specific Job or the entire database
 */
export const analyzeCV = async (
  cvData: { text?: string; base64?: string; mimeType?: string },
  context: { jobDescription?: string; allJobs?: Job[] }
): Promise<CVAnalysis> => {
  return withRetry(async () => {
    try {
      const parts: any[] = [];
      
      if (cvData.base64 && cvData.mimeType) {
        parts.push({
          inlineData: {
            data: cvData.base64,
            mimeType: cvData.mimeType
          }
        });
      } else if (cvData.text) {
        parts.push({ text: `CV Content: ${cvData.text}` });
      }

      const jobContext = context.jobDescription 
        ? `Target Job Description: ${context.jobDescription}`
        : `Analyze the user's profile and recommend the best career path based on these available jobs: ${JSON.stringify(context.allJobs?.map(j => ({ id: j.id, title: j.title, category: j.category, description: j.description.substring(0, 100) })))}`;

      parts.push({ text: `
        Act as an expert Senior Recruiter and ATS Optimization specialist in the Nigerian market. 
        Analyze the provided CV against the context.
        
        Tasks:
        1. Provide a match score (0-100).
        2. List missing keywords or skills crucial for this specific role/market.
        3. Give 3-5 high-impact suggestions for CV improvement.
        4. Crucial: Provide "tailoringAdvice" - a detailed paragraph explaining exactly how to optimize the CV (e.g., "Highlight your project management experience more in the professional summary").
        5. If other jobs in the context are a significantly better fit, list their IDs.
        
        Context: ${jobContext}
      `});

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchScore: { type: Type.INTEGER },
              missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              tailoringAdvice: { type: Type.STRING },
              verdict: { type: Type.STRING },
              recommendedJobIds: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["matchScore", "missingKeywords", "suggestions", "tailoringAdvice", "verdict"]
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Analysis Error:", error);
      throw error;
    }
  });
};
