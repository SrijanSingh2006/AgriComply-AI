import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

print("🔍 Listing ALL available models for your API key:")
try:
    for m in client.models.list():
        # In the new SDK, we check 'supported_actions'
        if "generateContent" in (m.supported_actions or []):
            print(f"✅ Available: {m.name}")
except Exception as e:
    print(f"❌ Error: {e}")