import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please set REACT_APP_GEMINI_API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

export const summarizeArticles = async (
  articlesText: string
): Promise<string> => {
  const ai = getClient();
  
  const systemInstruction = `You are an expert news editor and podcast scriptwriter. 
  Your goal is to take raw news text and convert it into a concise, engaging, and spoken-word friendly "News Brief" script.
  - Do not use markdown formatting like bold or headers in the output, as it will be read by a TTS engine.
  - Use natural transitions between topics.
  - Keep it under 3 minutes of reading time (approx 400-500 words maximum).
  - Start with "Here is your personalized audio summary for today."
  - End with "That's all for now. Safe travels."`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: articlesText,
    config: {
      systemInstruction,
    }
  });

  return response.text || "Sorry, I couldn't generate a summary.";
};

export const generateSpeech = async (
  text: string,
  voice: VoiceName
): Promise<string> => {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: {
      parts: [{ text }],
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("No audio data returned from the model.");
  }

  return base64Audio;
};
