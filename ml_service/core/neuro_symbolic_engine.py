import json

# ==========================================
# 1. THE SYMBOLIC LOGIC ENGINE (Strict Math)
# ==========================================
class NeuroSymbolicNode:
    """A node in the Logic Proof Tree."""
    def __init__(self, name, condition_met, confidence, details=""):
        self.name = name
        self.condition_met = condition_met  # Boolean: Did it pass the hard rule? (e.g., < 5 acres)
        self.confidence = confidence        # Float: How sure is the Neural Network?
        self.details = details              # String: Context for the UI
        
        # The final mathematical probability of this node being TRUE
        self.probability = 1.0 if condition_met else 0.0
        self.probability *= self.confidence

def logical_AND(node_A, node_B, rule_name):
    """
    Symbolic AND gate. In probability math: P(A AND B) = P(A) * P(B)
    """
    final_prob = node_A.probability * node_B.probability
    
    return {
        "rule": rule_name,
        "operator": "AND",
        "final_eligibility_score": round(final_prob * 100, 2),
        "proof_tree": [
            {
                "node": node_A.name,
                "status": "Pass" if node_A.condition_met else "Fail",
                "neural_confidence": f"{node_A.confidence * 100}%",
                "math_probability": node_A.probability,
                "details": node_A.details
            },
            {
                "node": node_B.name,
                "status": "Pass" if node_B.condition_met else "Fail",
                "neural_confidence": f"{node_B.confidence * 100}%",
                "math_probability": node_B.probability,
                "details": node_B.details
            }
        ]
    }

# ==========================================
# 2. THE NEURO-SYMBOLIC PIPELINE
# ==========================================
def evaluate_farmer_eligibility(neural_extraction_data):
    """
    Takes the messy probabilities from the Vision LLM and passes them 
    through strict government loan rules.
    
    GOVERNMENT RULE: (Land < 5.0 acres) AND (Income < 300,000 INR)
    """
    print("🧠 1. Receiving Neural Network Probabilities...")
    
    # Extract Land Data
    extracted_land = neural_extraction_data["land_acres"]["value"]
    land_confidence = neural_extraction_data["land_acres"]["confidence"]
    
    # Strict Symbolic Rule 1: Must be less than 5 acres
    is_land_eligible = extracted_land < 5.0 
    land_node = NeuroSymbolicNode(
        name="Land Verification",
        condition_met=is_land_eligible,
        confidence=land_confidence,
        details=f"Extracted: {extracted_land} acres (Rule: < 5.0)"
    )

    # Extract Income Data
    extracted_income = neural_extraction_data["annual_income"]["value"]
    income_confidence = neural_extraction_data["annual_income"]["confidence"]
    
    # Strict Symbolic Rule 2: Must be less than 3,00,000 INR
    is_income_eligible = extracted_income < 300000
    income_node = NeuroSymbolicNode(
        name="Income Verification",
        condition_met=is_income_eligible,
        confidence=income_confidence,
        details=f"Extracted: ₹{extracted_income} (Rule: < ₹3,00,000)"
    )

    print("⚙️ 2. Executing Symbolic Logic Engine...")
    # Execute the Mathematical AND Gate
    result_tree = logical_AND(land_node, income_node, "Marginal Farmer Subsidy 2026")
    
    return result_tree

# ==========================================
# 3. TEST THE ARCHITECTURE
# ==========================================
if __name__ == "__main__":
    # Simulate the output from your Gemini Vision LLM reading a blurry document
    mock_vision_llm_output = {
        "land_acres": {
            "value": 3.0, 
            "confidence": 0.90  # 90% sure it says 3.0 because of a coffee stain
        },
        "annual_income": {
            "value": 250000,
            "confidence": 0.80  # 80% sure it says 2.5L because of bad handwriting
        }
    }

    # Run the Neuro-Symbolic Engine
    decision_tree = evaluate_farmer_eligibility(mock_vision_llm_output)
    
    # Print the "Logic Proof Tree" for the terminal
    print("\n" + "="*50)
    print(f"🏛️  LOAN DECISION: {decision_tree['rule']}")
    print("="*50)
    
    for branch in decision_tree['proof_tree']:
        print(f" ├── [{branch['node']}]")
        print(f" │    ↳ Symbolic Rule: {branch['status']} ({branch['details']})")
        print(f" │    ↳ Neural Confidence: {branch['neural_confidence']}")
        print(" │")
    
    print(f" └── [LOGICAL {decision_tree['operator']} GATE]")
    print(f"      ↳ FINAL ELIGIBILITY SCORE: {decision_tree['final_eligibility_score']}%")
    print("="*50)