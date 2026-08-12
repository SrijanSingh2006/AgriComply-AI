def calculate_eligibility(opportunity, user_docs):
    """
    Pure Python Logic to check if user has required documents.
    """
    # 1. Standardize inputs to Sets
    required_set = set(opportunity.get('required_docs', []))
    user_set = set(user_docs)
    
    # 2. Calculate the "Gap"
    missing_docs = list(required_set - user_set)
    
    # 3. Calculate a "Readiness Score" (0 to 100)
    total_reqs = len(required_set)
    if total_reqs == 0:
        score = 100
    else:
        # Formula: (Owned / Total) * 100
        score = round(((total_reqs - len(missing_docs)) / total_reqs) * 100)
        
    return {
        "is_eligible": len(missing_docs) == 0,
        "missing_docs": missing_docs,
        "match_score": score
    }