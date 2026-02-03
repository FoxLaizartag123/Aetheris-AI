
import { AppMode, Attachment, Message } from "../types";

/**
 * Updated generateResponse to call the Python Backend API.
 * This keeps the API Key secure on the server side.
 */
export const generateResponse = async (
  currentMessage: string,
  history: Message[], // Note: Backend implementation currently handles single turn for simplicity
  attachments: Attachment[],
  mode: AppMode
): Promise<{ text: string; generatedAttachments: Attachment[] }> => {
  
  // The URL where your Python API is hosted (e.g., https://your-api.onrender.com)
  // Define this in Netlify's Environment Variables as VITE_BACKEND_URL
  const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:8000';

  try {
    // Mode-specific handling (Image Gen would require additional backend logic)
    if (mode === AppMode.IMAGE_GEN) {
      return { text: "Image generation is being moved to the backend. Please check backend compatibility.", generatedAttachments: [] };
    }

    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: currentMessage
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to connect to Aetheris Backend');
    }

    const data = await response.json();

    return { 
      text: data.response || "I couldn't get a response from my brain. Try again?", 
      generatedAttachments: [] 
    };

  } catch (error: any) {
    console.error("Backend API Error:", error);
    return { 
      text: `⚠️ **Connection Error**: I can't reach my server. Make sure the backend at ${BACKEND_URL} is running.`, 
      generatedAttachments: [] 
    };
  }
};
