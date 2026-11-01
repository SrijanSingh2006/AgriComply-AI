import os
import sys
import re
from google import genai
from dotenv import load_dotenv

load_dotenv()

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass


class GeminiAdapter:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        self.client = genai.Client(api_key=api_key) if api_key else None

        self.candidate_models = [
            "gemini-3.6-flash",
            "gemini-3.7-flash",
            "gemini-flash-latest"
        ]

    def _log(self, msg):
        try:
            print(msg)
        except UnicodeEncodeError:
            print(msg.encode('ascii', errors='replace').decode('ascii'))

    def generate_content(self, prompt_parts):
        if self.client is None:
            self._log("[AI] Gemini key is not configured; using the endpoint fallback.")
            return None

        for model in self.candidate_models:
            try:
                self._log(f"[AI] Requesting {model}...")
                response = self.client.models.generate_content(
                    model=model,
                    contents=prompt_parts
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                self._log(f"[AI] {model}: {str(e)[:80]}. Switching model.")
                continue

        return None


gemini = GeminiAdapter()
