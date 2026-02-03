import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai  # ⚠️ depreciado, migrar futuramente para google.genai

app = FastAPI()

# Configure CORS para o Netlify
netlify_url = os.getenv("ALLOWED_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[netlify_url] if netlify_url != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API key da Gemini (Google Generative AI)
api_key = os.getenv("API_KEY")
if not api_key:
    raise ValueError("API_KEY environment variable is not set")
genai.configure(api_key=api_key)

model = genai.GenerativeModel(
    model_name='gemini-2.0-flash',
    system_instruction="You are Aetheris, a friendly 17-year-old with an artistic vibe. Be casual, helpful, and creative."
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
async def root():
    return {"status": "Aetheris API is online"}

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        response = model.generate_content(request.message)
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="AI failed to generate a response")
        return {"response": response.text}
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
