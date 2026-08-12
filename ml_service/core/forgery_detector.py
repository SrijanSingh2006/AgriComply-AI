import os
import numpy as np
from PIL import Image, ImageChops
import fitz  # 🌟 NEW: PyMuPDF for handling PDFs

def detect_forgery(file_path):
    """
    Performs Error Level Analysis (ELA) to detect photoshopped documents.
    Now supports BOTH images and PDFs by converting the first page of the PDF.
    """
    temp_pdf_image_path = None
    target_image_path = file_path

    try:
        # 🌟 1. HANDLE PDF CONVERSION
        if file_path.lower().endswith('.pdf'):
            # Open the PDF
            pdf_document = fitz.open(file_path)
            # Grab the very first page (index 0)
            page = pdf_document.load_page(0)
            # Render it to a high-res image (2x zoom for better pixel math)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) 
            
            # Save it temporarily
            temp_pdf_image_path = "temp_converted_page.jpg"
            pix.save(temp_pdf_image_path)
            target_image_path = temp_pdf_image_path
            pdf_document.close()

        # 2. RUN ELA MATH (On the original image, or the newly converted PDF image)
        original = Image.open(target_image_path).convert('RGB')
        
        # Resave at 90% quality to create a baseline
        temp_ela_path = "temp_ela_check.jpg"
        original.save(temp_ela_path, 'JPEG', quality=90)
        resaved = Image.open(temp_ela_path)
        
        # Calculate absolute pixel difference
        ela_image = ImageChops.difference(original, resaved)
        extrema = ela_image.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        
        # Standard deviation of the difference
        stat = np.array(ela_image).std()
        
        # 3. CLEAN UP TEMPORARY FILES
        if os.path.exists(temp_ela_path):
            os.remove(temp_ela_path)
        if temp_pdf_image_path and os.path.exists(temp_pdf_image_path):
            os.remove(temp_pdf_image_path)
            
        # 4. DETERMINE RISK
        is_tampered = bool(stat > 5.0) 
        
        return {
            "is_tampered": is_tampered,
            "forgery_confidence_score": round(min((stat / 10.0) * 100, 100), 2),
            "max_pixel_anomaly": max_diff,
            "status": "High Risk: Modification Detected" if is_tampered else "Safe: Authentic Document"
        }
        
    except Exception as e:
        print(f"Forgery Detection Error: {e}")
        # Make sure we clean up the PDF image even if it crashes
        if temp_pdf_image_path and os.path.exists(temp_pdf_image_path):
            os.remove(temp_pdf_image_path)
        return {"error": f"Could not analyze document. {str(e)}"}