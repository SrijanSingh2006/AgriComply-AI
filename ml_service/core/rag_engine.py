"""
RAG Engine — Lightweight rewrite
Replaced: faiss-cpu (90MB binary) + PyMuPDF
With:     numpy cosine similarity + pypdf (text only)

All semantic intelligence comes from Gemini text-embedding-004 API.
The vector store is an in-memory numpy array — perfectly sufficient for
the document volumes this app handles.
"""
import os
import io
import traceback
import numpy as np
from dotenv import load_dotenv
from google import genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
client = None
if api_key:
    client = genai.Client(api_key=api_key)

EMBEDDING_MODEL = 'text-embedding-004'
CHAT_MODEL_NAME = 'gemini-2.5-flash'

# In-memory vector store (numpy arrays, no FAISS needed)
_vectors = None        # shape: (N, D) float32
_chunks  = []          # list of text strings


def _cosine_top_k(query_vec: np.ndarray, k: int = 3):
    """Return indices of top-k most similar chunks by cosine similarity."""
    global _vectors
    if _vectors is None or len(_vectors) == 0:
        return []
    # Normalize
    qn = query_vec / (np.linalg.norm(query_vec) + 1e-9)
    norms = np.linalg.norm(_vectors, axis=1, keepdims=True) + 1e-9
    normed = _vectors / norms
    scores = normed @ qn
    top_k = min(k, len(scores))
    return np.argsort(scores)[::-1][:top_k].tolist()


def embed_text_batch(texts):
    """Embed texts using Gemini text-embedding-004."""
    if not client:
        raise ValueError("Gemini API client is not initialized.")
    if isinstance(texts, str):
        texts = [texts]
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=texts
    )
    return [e.values for e in response.embeddings]


def _extract_text_from_file(file_path: str) -> str:
    """Extract text from PDF or image using pypdf + Gemini OCR fallback."""
    text = ""

    if file_path.lower().endswith('.pdf'):
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text() or ""
                text += page_text + "\n"
        except Exception as e:
            print(f"pypdf error: {e}")

    # If PDF had no extractable text, or it's an image → use Gemini OCR
    if len(text.strip()) < 50:
        try:
            if not client:
                raise ValueError("Gemini API client is not initialized.")
            from PIL import Image

            if file_path.lower().endswith('.pdf'):
                # Render first page via pypdf + Pillow (no fitz needed)
                # For image-only PDFs, Gemini File API handles it directly
                gemini_file = client.files.upload(file=file_path)
                response = client.models.generate_content(
                    model=CHAT_MODEL_NAME,
                    contents=["Extract all text and numbers from this document.", gemini_file]
                )
            else:
                img = Image.open(file_path)
                response = client.models.generate_content(
                    model=CHAT_MODEL_NAME,
                    contents=["Extract all text and numbers.", img]
                )
            text = response.text
        except Exception as e:
            print(f"Gemini OCR error: {e}")

    return text


def ingest_pdf_to_vector_db(file_path: str):
    global _vectors, _chunks
    print(f"\n📚 Ingesting {file_path} into Vector Database...")

    combined_text = _extract_text_from_file(file_path)

    if not combined_text.strip():
        raise ValueError("No readable text found in document.")

    # Chunk at 500 chars
    raw_chunks = [combined_text[i:i+500] for i in range(0, len(combined_text), 500)]
    valid_chunks = [c.strip() for c in raw_chunks if len(c.strip()) > 10]

    if not valid_chunks:
        raise ValueError("No valid chunks after splitting document.")

    try:
        print(f"   -> Embedding {len(valid_chunks)} chunks via Gemini...")
        embeddings = embed_text_batch(valid_chunks)

        if not isinstance(embeddings[0], list):
            embeddings = [embeddings]

        new_vecs = np.array(embeddings, dtype='float32')

        if _vectors is None:
            _vectors = new_vecs
        else:
            _vectors = np.vstack([_vectors, new_vecs])

        _chunks.extend(valid_chunks)
        print(f"✅ Success! Vector DB now contains {len(_chunks)} chunks.")

    except Exception as e:
        print(f"❌ Embedding Error: {type(e).__name__}")
        traceback.print_exc()
        raise ValueError(f"Embedding failed: {str(e)}")


def query_rag_bot(user_question: str) -> str:
    global _vectors, _chunks

    # No documents ingested — use Gemini directly as agricultural legal AI
    if _vectors is None or len(_chunks) == 0:
        try:
            if not client:
                return "Gemini API client is not initialized."

            prompt = f"""
            You are an expert Agricultural Legal Assistant specializing in Indian farming laws,
            government schemes (PM-KISAN, PMFBY, KCC, etc.), land records, compliance rules,
            and farmer rights. Answer the following question clearly and helpfully.

            If the question is not related to agriculture or farming, politely redirect the user.

            QUESTION: {user_question}
            """

            response = client.models.generate_content(
                model=CHAT_MODEL_NAME,
                contents=prompt
            )
            try:
                return response.text
            except ValueError:
                return "Safety filter blocked response."

        except Exception as e:
            print(f"\n❌ Direct Query Error: {type(e).__name__}")
            traceback.print_exc()
            return f"Chat Error: {type(e).__name__}"

    # Documents ingested — do RAG
    try:
        if not client:
            return "Gemini API client is not initialized."

        q_embeddings = embed_text_batch(user_question)
        q_vec = np.array(q_embeddings[0], dtype='float32')

        top_indices = _cosine_top_k(q_vec, k=3)

        context = ""
        for idx in top_indices:
            if 0 <= idx < len(_chunks):
                context += _chunks[idx] + "\n\n"

        prompt = f"""
        You are an Agricultural Legal Assistant. Answer the question using ONLY the context provided.
        CONTEXT:
        {context}

        QUESTION: {user_question}
        """

        response = client.models.generate_content(
            model=CHAT_MODEL_NAME,
            contents=prompt
        )
        try:
            return response.text
        except ValueError:
            return "Safety filter blocked response."

    except Exception as e:
        print(f"\n❌ Query Error Type: {type(e).__name__}")
        traceback.print_exc()
        return f"Chat Error: {type(e).__name__}"
