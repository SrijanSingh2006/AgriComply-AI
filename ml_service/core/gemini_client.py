import os
import sys
import time
import re
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Fix: ensure stdout uses UTF-8 to handle emoji/non-ASCII characters on Windows
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass


class GeminiAdapter:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is missing.")
            
        self.client = genai.Client(api_key=api_key)
        
        self.candidate_models = [
            "gemini-3.7-flash",
            "gemini-3.6-flash",
            "gemini-flash-latest"
        ]

    def _extract_retry_delay(self, error_str):
        # If Google says "retry in 22s", we wait 22s + 2s buffer
        match = re.search(r"retry in (\d+(\.\d+)?)", error_str)
        if match:
            return float(match.group(1)) + 2.0
        return 10.0

    def _log(self, msg):
        """Safe print that won't crash on Windows cp1252 consoles."""
        try:
            print(msg)
        except UnicodeEncodeError:
            print(msg.encode('ascii', errors='replace').decode('ascii'))

    def generate_content(self, prompt_parts):
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
                error_str = str(e)
                self._log(f"[AI] {model} notice: {error_str[:120]}... Switching model.")
                continue

        return None

gemini = GeminiAdapter()