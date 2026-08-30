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
            "gemini-3.6-flash",
            "gemini-3.7-flash",
            "gemini-flash-latest",
            "gemini-3.5-flash",
            "gemini-2.5-flash",
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
            # Try each model TWICE to handle temporary glitches
            for attempt in range(2): 
                try:
                    self._log(f"[AI] Requesting {model}...")
                    response = self.client.models.generate_content(
                        model=model,
                        contents=prompt_parts
                    )
                    return response.text
                
                except Exception as e:
                    error_str = str(e)
                    
                    # 429 Rate Limit -> Wait and Retry
                    if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                        wait_time = self._extract_retry_delay(error_str)
                        self._log(f"[AI] Quota hit on {model}. Waiting {wait_time:.1f}s...")
                        time.sleep(wait_time)
                        
                        # Retry once on the same model after waiting
                        try:
                            response = self.client.models.generate_content(
                                model=model,
                                contents=prompt_parts
                            )
                            return response.text
                        except Exception:
                            self._log(f"[AI] {model} exhausted. Switching to next model...")
                            break  # Move to next model in list
                    
                    # 404 Not Found -> Skip immediately
                    if "404" in error_str or "NOT_FOUND" in error_str:
                        self._log(f"[AI] {model} not found/retired. Skipping.")
                        break
                    
                    self._log(f"[AI] Error ({model}): {error_str[:200]}")
                    break
        
        self._log("[AI] All AI models failed.")
        return None

gemini = GeminiAdapter()