import os
import faiss
import numpy as np
import fitz  # PyMuPDF
from PIL import Image
import io
import traceback
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

EMBEDDING_MODEL = 'models/gemini-embedding-001'
CHAT_MODEL = genai.GenerativeModel('gemini-2.5-flash')

# 🌟 NEW: Dynamic Database (No more hardcoded 768 dimension)
vector_index = None
document_chunks = []

def embed_text_batch(texts):
    """Embeds text without the buggy task_type parameters."""
    if isinstance(texts, str):
        texts = [texts]
        
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=texts
    )
    return result['embedding']

def ingest_pdf_to_vector_db(pdf_path):
    global vector_index, document_chunks
    print(f"\n📚 Ingesting {pdf_path} into Vector Database...")
    
    combined_text = ""
    try:
        pdf_document = fitz.open(pdf_path)
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            page_text = page.get_text().strip()
            
            if len(page_text) > 50:
                print(f"   -> Page {page_num + 1}: Extracted normal text.")
                combined_text += page_text + "\n"
            else:
                print(f"   -> Page {page_num + 1}: Running AI OCR...")
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                response = CHAT_MODEL.generate_content(["Extract all text and numbers.", img])
                combined_text += response.text + "\n"
        pdf_document.close()
    except Exception as e:
        raise ValueError(f"PDF Reading Error: {str(e)}")

    chunks = [combined_text[i:i+500] for i in range(0, len(combined_text), 500)]
    valid_chunks = [c.strip() for c in chunks if len(c.strip()) > 10]
    
    if not valid_chunks:
        raise ValueError("No readable text found in document.")

    try:
        print(f"   -> Processing {len(valid_chunks)} chunks...")
        embeddings = embed_text_batch(valid_chunks)
        
        # Format fix to ensure it's always a list of lists
        if not isinstance(embeddings[0], list):
            embeddings = [embeddings]
            
        # 🌟 NEW: Dynamically grab the exact dimension Google is using!
        dimension = len(embeddings[0]) 
        
        # Initialize or Re-initialize FAISS with the perfect dimension
        if vector_index is None or vector_index.d != dimension:
            print(f"   -> Initializing FAISS Engine with dynamic dimension: {dimension}...")
            vector_index = faiss.IndexFlatL2(dimension)
            document_chunks = []

        data_to_add = np.array(embeddings, dtype='float32')
        vector_index.add(data_to_add)
        document_chunks.extend(valid_chunks)
        
        print(f"✅ Success! Vector DB now contains {vector_index.ntotal} chunks.")
        
    except Exception as e:
        print(f"❌ Gemini API Error Type: {type(e).__name__}")
        traceback.print_exc()
        raise ValueError(f"Embedding failed: {str(e)}")

def query_rag_bot(user_question):
    global vector_index
    if vector_index is None or vector_index.ntotal == 0:
        return "The database is empty. Please upload a document first."
        
    try:
        # Get embedding for the question
        q_result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=user_question
        )
        
        embedding_data = q_result['embedding']
        if isinstance(embedding_data[0], list):
            embedding_data = embedding_data[0]
            
        question_vector = np.array(embedding_data, dtype='float32').reshape(1, -1)
        
        # 🌟 NEW: Safety Firewall before searching
        if question_vector.shape[1] != vector_index.d:
            return f"Error: DB expects size {vector_index.d}, but question was size {question_vector.shape[1]}"
        
        # Search the database
        D, I = vector_index.search(question_vector, 3)
        
        context = ""
        for idx in I[0]:
            if idx != -1 and idx < len(document_chunks):
                context += document_chunks[idx] + "\n\n"
                
        prompt = f"""
        You are an Agricultural Legal Assistant. Answer the question using ONLY the context provided.
        CONTEXT:
        {context}
        
        QUESTION: {user_question}
        """
        
        response = CHAT_MODEL.generate_content(prompt)
        
        try:
            return response.text
        except ValueError:
            return "Safety filter blocked response."
            
    except Exception as e:
        print(f"\n❌ Query Error Type: {type(e).__name__}")
        traceback.print_exc() 
        return f"Chat Error: {type(e).__name__}"