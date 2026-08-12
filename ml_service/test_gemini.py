import os
from dotenv import load_dotenv
from google import genai

# Load your API key from .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("🛑 ERROR: Could not find GEMINI_API_KEY in your .env file!")
else:
    print("⏳ Attempting to connect to Google Gemini...")
    try:
        # This is where your app was freezing!
        client = genai.Client(api_key=api_key)
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents='Say "Hello, your connection works!"'
        )
        print(f"✅ SUCCESS: {response.text}")
    except Exception as e:
        print(f"❌ FAILED: {e}")