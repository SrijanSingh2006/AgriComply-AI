import PIL.Image

def load_image_for_gemini(file_path):
    """
    Loads an image from the local path and prepares it for the Gemini API.
    """
    try:
        img = PIL.Image.open(file_path)
        return img
    except Exception as e:
        print(f"Error loading image: {e}")
        return None