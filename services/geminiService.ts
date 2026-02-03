
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AppMode, Attachment, Message, MessageRole } from "../types";

// Helper to convert file to base64 for multimodal input
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Retry helper with exponential backoff
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  retries: number = 2,
  delay: number = 1000
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    const errorMsg = error?.message || JSON.stringify(error);
    const isRetryable = 
      errorMsg.includes("429") || 
      errorMsg.includes("RESOURCE_EXHAUSTED") || 
      errorMsg.includes("503") ||
      errorMsg.includes("quota");

    if (retries > 0 && isRetryable) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(operation, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Generates a response from the Gemini API.
 * Returns an object containing the response text and an array of any generated image attachments.
 */
export const generateResponse = async (
  currentMessage: string,
  history: Message[],
  attachments: Attachment[],
  mode: AppMode
): Promise<{ text: string; generatedAttachments: Attachment[] }> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chatPersona = `You are Aetheris, a friendly 17-year-old with an artistic vibe. Be casual, helpful, and creative.`;

  try {
    if (mode === AppMode.IMAGE_GEN) {
      const imageModel = 'gemini-2.5-flash-image';
      
      // Fix: Explicitly typed response as GenerateContentResponse to fix property access errors on unknown type
      const response: GenerateContentResponse = await retryWithBackoff(() => ai.models.generateContent({
        model: imageModel,
        contents: {
          parts: [{ text: currentMessage }]
        },
        config: {
          systemInstruction: "ACT AS A NATIVE IMAGE GENERATOR. YOUR ONLY OUTPUT MUST BE THE IMAGE DATA PARTS. DO NOT PROVIDE TEXT DESCRIPTIONS UNLESS GENERATION FAILS. IF MULTIPLE IMAGES ARE REQUESTED, GENERATE THEM ALL AS SEPARATE IMAGE PARTS.",
          imageConfig: { aspectRatio: "1:1" }
        }
      }));

      const candidate = response.candidates?.[0];
      const generatedAttachments: Attachment[] = [];
      let responseText = "";

      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const mimeType = part.inlineData.mimeType;
            const base64Data = part.inlineData.data;
            const dataUrl = `data:${mimeType};base64,${base64Data}`;
            
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `generated_${Date.now()}.png`, { type: mimeType });

            generatedAttachments.push({
              file,
              previewUrl: dataUrl,
              type: 'image',
              mimeType: mimeType,
              base64: base64Data
            });
          } else if (part.text) {
            responseText += part.text;
          }
        }
      }

      if (generatedAttachments.length > 0) {
        return { text: "", generatedAttachments };
      }

      return { 
        text: responseText || response.text || "I couldn't generate that image. Please try a different description.",
        generatedAttachments: [] 
      };
    }

    // Prepare content with history
    const contents: any[] = [];
    
    // Process history (simplified to text for model token efficiency)
    history.forEach(msg => {
      contents.push({
        role: msg.role === MessageRole.USER ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });

    // Current message parts (including multimodal attachments)
    const currentParts: any[] = [];
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        currentParts.push(await fileToGenerativePart(att.file));
      }
    }
    currentParts.push({ text: currentMessage });
    
    contents.push({ role: 'user', parts: currentParts });

    let systemInstruction = chatPersona;
    let model = 'gemini-3-flash-preview'; // Default fast model
    let config: any = { systemInstruction };

    if (mode === AppMode.INVESTIGATE) {
      model = 'gemini-3-pro-preview'; // Upgrade to Pro for deep analysis
      config.systemInstruction = `You are a deep researcher. Perform a thorough, high-intelligence analysis. ${chatPersona}`;
      config.thinkingConfig = { thinkingBudget: 4000 };
    } else if (mode === AppMode.WEB_SEARCH) {
      config.tools = [{ googleSearch: {} }];
    }

    // Fix: Explicitly typed response as GenerateContentResponse to fix property access errors on unknown type
    const response: GenerateContentResponse = await retryWithBackoff(() => ai.models.generateContent({
      model,
      contents,
      config
    }));

    let text = response.text || "I'm a bit lost, could you rephrase that?";

    if (mode === AppMode.WEB_SEARCH) {
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks && groundingChunks.length > 0) {
        const sources = groundingChunks
          .filter((c: any) => c.web?.uri)
          .map((c: any) => `- [${c.web.title || 'Source'}](${c.web.uri})`)
          .join('\n');
        if (sources) text += `\n\n**Sources:**\n${sources}`;
      }
    }

    return { text, generatedAttachments: [] };

  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    const msg = error?.message || "";
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      return { text: "⚠️ **Traffic Heavy**: Please wait a moment before trying again.", generatedAttachments: [] };
    }
    return { text: "I encountered a technical glitch. Mind trying that again?", generatedAttachments: [] };
  }
};
