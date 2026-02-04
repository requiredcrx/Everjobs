
import { GoogleGenAI, Type } from "@google/genai";
import { Job } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Search jobs using Gemini
 */
export const searchJobsWithGemini = async (query: string, location: string): Promise<Job[]> => {
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
      : `Analyze the user's profile and recommend the best career path. Available jobs context: ${JSON.stringify(context.allJobs?.map(j => ({ id: j.id, title: j.title, category: j.category })))}`;

    parts.push({ text: `
      Act as a Senior Tech Recruiter in Nigeria. 
      Analyze the attached CV against the provided context.
      
      Requirements:
      1. Calculate match percentage (0-100).
      2. Identify specific missing skills/keywords for Nigeria's market.
      3. Provide concrete "Tailoring Advice" to optimize the CV for this specific role.
      4. Suggest other suitable job IDs from the context if they fit better.
      
      ${jobContext}
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
            tailoringAdvice: { type: Type.STRING, description: "Detailed guide on how to rewrite or highlight sections of the CV" },
            verdict: { type: Type.STRING },
            recommendedJobIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "IDs of other suitable jobs from the provided context" }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      matchScore: 0,
      missingKeywords: [],
      suggestions: ["We encountered an error analyzing your document. Please ensure it is a clear PDF or Text file."],
      tailoringAdvice: "Unable to provide specific advice at this time.",
      verdict: "Error"
    };
  }
};
