import json
from .gemini_client import gemini
from prompts.extraction_prompts import get_extraction_prompt

def extract_data(image_data, doc_type):
    """
    Extracts structured data (JSON) from the document.
    """
    prompt = get_extraction_prompt(doc_type)
    
    inputs = [prompt, image_data]
    response_text = gemini.generate_content(inputs)

    try:
        clean_json = response_text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_json)
    except Exception as e:
        return {"error": "Failed to parse extraction data", "raw": response_text}