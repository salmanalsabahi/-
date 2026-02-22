
import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getWeeklyAdvice = async (week: number): Promise<string> => {
  try {
    const prompt = `
      أنا امرأة حامل في الأسبوع ${week}. 
      قدمي لي نصائح ومعلومات مفصلة ومفيدة لهذا الأسبوع من الحمل. 
      يجب أن تكون النصيحة سهلة القراءة ومقسمة إلى فقرات ذات عناوين واضحة (على سبيل المثال: تطور الجنين، التغيرات في جسمك، نصائح التغذية، فحوصات هامة).
      اجعلي الأسلوب ودودًا ومطمئنًا.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching weekly advice from Gemini:", error);
    return "عذرًا، حدث خطأ أثناء جلب النصائح. يرجى المحاولة مرة أخرى لاحقًا.";
  }
};
