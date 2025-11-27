import { GoogleGenAI } from "@google/genai";
import { MOCK_ANALYSIS } from '../constants';

const GEMINI_API_KEY = process.env.API_KEY;

export const analyzeStockWithGemini = async (symbol: string, price: number, isRealMode: boolean): Promise<string> => {
  if (isRealMode && GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const prompt = `
        You are a senior financial analyst. Provide a concise, professional investment summary for the stock "${symbol}" trading at $${price}.
        Include:
        1. Market Trend Summary
        2. Key Risks/Opportunities
        3. Actionable Advice (Buy/Hold/Sell)
        
        CRITICAL RULES:
        - Do NOT use Markdown formatting (no bold, no italics, no headers).
        - Return plain text only.
        - Keep it under 200 words.
        - Use Traditional Chinese (繁體中文).
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text;
    } catch (e) {
      console.error("Gemini API Error:", e);
      return `【系統訊息】無法連接 AI 服務 (${(e as Error).message})。顯示模擬分析資料：\n\n${MOCK_ANALYSIS}`;
    }
  }

  // Simulation delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  return MOCK_ANALYSIS;
};