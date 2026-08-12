import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load API Key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# Initialize the state-of-the-art Flash model
gemini = genai.GenerativeModel('gemini-2.5-flash')

def clean_json_response(text):
    """Helper to strip markdown formatting from Gemini's JSON response"""
    clean = text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(clean)
    except:
        return {}

def classify_document(image_part):
    """Feature: Smart Document Classification"""
    prompt = """
    Analyze this document image. Identify its primary type.
    Must be one of: Aadhaar, PAN, BankStatement, LandRecord, ProjectReport, Quotation, Unknown.
    Return strictly valid JSON in this format: {"type": "DocumentType"}
    """
    try:
        response = gemini.generate_content([prompt, image_part])
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Classification Error: {e}")
        return {"type": "Unknown"}

def extract_data(image_part, doc_type):
    """Feature: Intelligent OCR & Data Extraction"""
    prompt = f"""
    You are a financial data extraction AI. Extract all key data points from this {doc_type}.
    - If it's an identity doc, extract Name, ID Number, DOB.
    - If it's a financial doc, extract total balances, turnover, or land size numbers.
    Return strictly valid JSON containing the key-value pairs of the extracted data. Do not invent data.
    """
    try:
        response = gemini.generate_content([prompt, image_part])
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Extraction Error: {e}")
        return {"error": "Failed to extract data"}