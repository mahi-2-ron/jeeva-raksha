
import { GoogleGenAI as GenerativeClient, Type } from "@google/genai";

// ─── Automated Clinical Intelligence Engine ──────────────────
// Custom integration for high-performance medical data extraction
// and clinical decision support.
// ──────────────────────────────────────────────────────────────

export const aiService = {
    async extractPatientFromID(base64Image: string) {
        const engine = new GenerativeClient({ apiKey: process.env.API_KEY });
        const processor = await engine.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
                    { text: "Extract name, age, gender, and ID number from this identification card. Respond in JSON." }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        age: { type: Type.NUMBER },
                        gender: { type: Type.STRING },
                        idNumber: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(processor.text || '{}');
    },

    async analyzeLabReport(base64Image: string) {
        const engine = new GenerativeClient({ apiKey: process.env.API_KEY });
        const processor = await engine.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
                    { text: "Summarize this lab report and predict a health score (0-100). Identify high-risk factors and suggest 3 steps. Respond in JSON." }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        healthScore: { type: Type.NUMBER },
                        riskLevel: { type: Type.STRING },
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                        abnormalFindings: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(processor.text || '{}');
    },

    async analyzeRadiologyScan(base64Image: string, modality: string) {
        const engine = new GenerativeClient({ apiKey: process.env.API_KEY });
        const processor = await engine.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
                    { text: `Analyze this ${modality} scan. Provide summary, observations, and findings. Respond in JSON.` }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        aiSummary: { type: Type.STRING },
                        keyObservations: { type: Type.ARRAY, items: { type: Type.STRING } },
                        urgencyLevel: { type: Type.STRING },
                        potentialFindings: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(processor.text || '{}');
    }
};
