import numpy as np
from hmmlearn import hmm

def train_aml_model():
    """
    Trains an HMM on what a 'Normal' farmer's transaction heartbeat looks like.
    Features: [Deposit Amount]
    """
    # NORMAL BEHAVIOR: 
    # One big harvest payment, followed by months of $0 deposits or tiny cash deposits.
    normal_transactions = np.array([
        [150000], # Harvest payout
        [0], [0], [500], [0], [1000], [0], [0], [200], [0]
    ])

    # Initialize a Gaussian Hidden Markov Model
    # 2 Hidden States (e.g., "Harvest Season" vs "Off Season")
    model = hmm.GaussianHMM(n_components=2, covariance_type="diag", n_iter=100)
    model.fit(normal_transactions)
    return model

def detect_smurfing(model, transaction_sequence):
    """
    Calculates the Log-Likelihood of a transaction sequence.
    If the probability is astronomically low compared to normal behavior, it's a fraud anomaly.
    """
    seq_array = np.array(transaction_sequence).reshape(-1, 1)
    
    try:
        # Calculate the log probability of this sequence occurring naturally
        log_likelihood = model.score(seq_array)
        
        # If the log likelihood is highly negative, it deviates from the "Normal" rhythm
        anomaly_threshold = -50.0 
        is_fraud = log_likelihood < anomaly_threshold
        
        return {
            "log_likelihood": round(log_likelihood, 2),
            "is_aml_violation": is_fraud
        }
    except Exception as e:
        return {"error": str(e)}

# ==========================================
# 🧪 TEST THE HIDDEN MARKOV MODEL
# ==========================================
if __name__ == "__main__":
    print("🧠 Training HMM on normal agricultural cash flows...")
    aml_model = train_aml_model()

    # Scenario A: Normal Farmer (Harvest payout, then nothing)
    farmer_seq = [[140000], [0], [200], [0], [0]]
    
    # Scenario B: Fraudster "Smurfing" (Depositing just under 50k every day)
    smurf_seq = [[49000], [48500], [49900], [49200], [48000]]

    print("\n🕵️ Running AML Sequence Analysis...")
    
    res_normal = detect_smurfing(aml_model, farmer_seq)
    print(f"Farmer Sequence Log-Likelihood: {res_normal['log_likelihood']}")
    print(f"Status: {'🔴 AML VIOLATION' if res_normal['is_aml_violation'] else '🟢 Clean'}")
    
    print("-" * 30)
    
    res_smurf = detect_smurfing(aml_model, smurf_seq)
    print(f"Smurfer Sequence Log-Likelihood: {res_smurf['log_likelihood']}")
    print(f"Status: {'🔴 AML VIOLATION (Structuring Detected)' if res_smurf['is_aml_violation'] else '🟢 Clean'}")