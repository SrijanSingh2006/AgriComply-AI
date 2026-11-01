import os
import PIL.Image

def load_image_for_gemini(file_path):
    """
    Loads an image or extracts text from PDF for the Gemini API.
    """
    if not os.path.exists(file_path):
        return None

    if file_path.lower().endswith('.pdf'):
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            extracted_text = "\n".join([p.extract_text() or "" for p in reader.pages])
            if extracted_text.strip():
                return f"DOCUMENT CONTENT (Extracted from PDF):\n{extracted_text}"
        except Exception as e:
            print(f"Error reading PDF text: {e}")

    try:
        img = PIL.Image.open(file_path)
        return img
    except Exception as e:
        print(f"Error loading image: {e}")
        # If Pillow cannot open (e.g. raw text or fallback), read as text
        try:
            with open(file_path, 'r', errors='ignore') as f:
                content = f.read(4000)
                if content.strip():
                    return f"DOCUMENT CONTENT:\n{content}"
        except Exception:
            pass
        return None