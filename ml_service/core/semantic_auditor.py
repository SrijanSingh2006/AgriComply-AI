from sentence_transformers import SentenceTransformer, util
import torch

# Load the SBERT model (MiniLM is extremely fast and accurate for this)
print("🧠 Loading Siamese Neural Network (SBERT)...")
model = SentenceTransformer('all-MiniLM-L6-v2')

def audit_compliance(farmer_profile_text, policy_clauses):
    """
    Encodes the farmer's profile and the policy clauses into the same vector space,
    then calculates Cosine Similarity to find the legal match.
    """
    # 1. Translate texts into High-Dimensional Vectors
    profile_embedding = model.encode(farmer_profile_text, convert_to_tensor=True)
    clause_embeddings = model.encode(policy_clauses, convert_to_tensor=True)

    # 2. Calculate Cosine Similarity mathematically
    # Formula: cos(theta) = (A dot B) / (||A|| ||B||)
    cosine_scores = util.cos_sim(profile_embedding, clause_embeddings)[0]

    # 3. Find the highest matching clause
    best_match_idx = torch.argmax(cosine_scores).item()
    best_match_score = cosine_scores[best_match_idx].item()
    
    return {
        "farmer_profile": farmer_profile_text,
        "matched_clause": policy_clauses[best_match_idx],
        "confidence_score": round(best_match_score * 100, 2),
        "is_compliant": best_match_score > 0.50 # Threshold for legal match
    }

# ==========================================
# 🧪 TEST THE SIAMESE NETWORK
# ==========================================
if __name__ == "__main__":
    # The farmer's data extracted from OCR/Forms
    farmer_data = "Female agricultural worker owning 1.5 acres of land."
    
    # The dense legal text from the PDF
    legal_rulebook = [
        "Clause 1.1: Standard corporate loans require a minimum of 10 acres of commercial property.",
        "Clause 2.4: Interest rate subsidies are provided for purchasing tractors.",
        "Clause 4.2: Special financial grants shall be provided to women agriculturists managing marginal land holdings defined as less than 2.0 acres."
    ]

    print("\n🔍 Running Semantic Policy Audit...")
    result = audit_compliance(farmer_data, legal_rulebook)
    
    print("-" * 50)
    print(f"🧑‍🌾 Profile: {result['farmer_profile']}")
    print(f"📜 Matched Legal Clause: {result['matched_clause']}")
    print(f"✅ Compliance Match: {result['confidence_score']}%")
    print("-" * 50)