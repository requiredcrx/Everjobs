
import { GoogleGenAI, Type } from "@google/genai";
import { Job, SafetyReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Utility for exponential backoff retries to handle transient errors
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
 * Performs an AI-driven safety audit to detect scams (fake interviews, GNLD patterns)
 */
export const getJobSafetyAudit = async (job: Partial<Job>): Promise<SafetyReport> => {
  return withRetry(async () => {
    const prompt = `
      Act as a Security Audit Specialist for the Nigerian Job Market. 
      Analyze this job listing for potential scam signatures (e.g., GNLD recruitment, fake interview centers).
      
      Job Details:
      Title: ${job.title}
      Company: ${job.company}
      Location: ${job.location}
      Description: ${job.description}
      
      Evaluate based on:
      1. Address format (vague Ikeja, Anthony, or Yaba addresses are often red flags).
      2. Professionalism of language.
      3. Requests for payment/form fees.
      4. Generic contact emails (gmail vs professional domain).
      
      Output JSON only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: "'Verified', 'Unverified', or 'High Risk'" },
            score: { type: Type.INTEGER, description: "Trust score 0-100" },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            greenFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ["status", "score", "redFlags", "greenFlags", "summary"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  });
};

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

export const searchJobsWithGemini = async (query: string, location: string): Promise<Job[]> => {
  return withRetry(async () => {
    try {
      const prompt = `Find 3-5 realistic job openings in ${location}, Nigeria for "${query}". 
      Return JSON objects representing the jobs. Include specific Nigerian company names if possible.`;

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
              required: ["title", "company", "location", "sourceUrl", "description"]
            }
          }
        }
      });

      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error("Gemini Search Error:", error);
      throw error;
    }
  }).catch(() => []);
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

export const analyzeCV = async (
  cvData: { text?: string; base64?: string; mimeType?: string },
  context: { jobDescription?: string; allJobs?: Job[] }
): Promise<CVAnalysis> => {
  return withRetry(async () => {
    try {
      const parts: any[] = [];
      if (cvData.base64 && cvData.mimeType) {
        parts.push({ inlineData: { data: cvData.base64, mimeType: cvData.mimeType } });
      } else if (cvData.text) {
        parts.push({ text: `CV Content: ${cvData.text}` });
      }

      const jobContext = context.jobDescription 
        ? `Target Job Description: ${context.jobDescription}`
        : `Available jobs to match with: ${JSON.stringify(context.allJobs?.map(j => ({ id: j.id, title: j.title })))}`;

      parts.push({ text: `
        Analyze this CV for the Nigerian market. Provide matching score, tailoring advice, and missing keywords.
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