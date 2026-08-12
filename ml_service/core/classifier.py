import json
from .gemini_client import gemini
from prompts.system_prompts import CLASSIFICATION_PROMPT

def classify_document(image_data):
    """
    Sends image to Gemini to determine document type.
    """
    if not image_data:
        return {"error": "No image data provided"}

    # Prepare inputs: Prompt + Image
    inputs = [CLASSIFICATION_PROMPT, image_data]
    
    response_text = gemini.generate_content(inputs)
    
    # Gemini usually returns JSON-like text, we need to parse it safely
    try:
        # Simple cleanup to ensure we get valid JSON
        clean_json = response_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_json)
        return data
    except Exception as e:
        return {"type": "Unknown", "confidence": 0, "raw_response": response_text}