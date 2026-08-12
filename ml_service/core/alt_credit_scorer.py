import os
import pandas as pd
import numpy as np
import joblib
import shap
from xgboost import XGBRegressor
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split

# Paths for Models and our new LIVE DATABASE
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'xgboost_credit_model.pkl')
ANOMALY_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'isolation_forest_model.pkl')
DATA_CSV_PATH = os.path.join(os.path.dirname(__file__), 'live_farmer_database.csv')

def generate_base_data_if_missing():
    """Creates the initial starting data if the app is run for the very first time."""
    if os.path.exists(DATA_CSV_PATH):
        return # Database already exists, skip!

    print("🌱 Initializing Base Database for Cold Start...")
    np.random.seed(42)
    n_samples = 2000
    
    land_size = np.random.uniform(1, 25, n_samples)
    experience = np.random.randint(1, 40, n_samples)
    yield_per_acre = np.random.normal(100000, 15000, n_samples)
    turnover = (land_size * yield_per_acre) + (experience * 2000)
    existing_loans = turnover * np.random.uniform(0.0, 0.8, n_samples)
    
    # We use a strict financial formula as the "Ground Truth" label for the AI to learn from
    base_score = 500
    debt_to_income = existing_loans / turnover
    score_boost = (turnover / 50000) * 2 + (experience * 3) - (debt_to_income * 200)
    credit_scores = np.clip(base_score + score_boost, 300, 900)

    # Save to our live CSV
    df = pd.DataFrame({
        'land_size': land_size, 'turnover': turnover,
        'existing_loans': existing_loans, 'experience': experience,
        'true_credit_score': credit_scores # The target variable
    })
    df.to_csv(DATA_CSV_PATH, index=False)
    print("✅ Base Database Created!")

def train_and_save_model():
    """Trains the AI models using the LIVE CSV Database (which includes user inputs)."""
    generate_base_data_if_missing()
    
    print("🧠 Training Models on Live Database...")
    df = pd.read_csv(DATA_CSV_PATH)
    
    X = df[['land_size', 'turnover', 'existing_loans', 'experience']]
    y = df['true_credit_score']

    # 1. Train Anomaly Detector
    iso_forest = IsolationForest(contamination=0.05, random_state=42)
    iso_forest.fit(X)
    joblib.dump(iso_forest, ANOMALY_MODEL_PATH)

    # 2. Train XGBoost
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = XGBRegressor(n_estimators=150, learning_rate=0.05, max_depth=4, random_state=42)
    model.fit(X_train, y_train)
    joblib.dump(model, MODEL_PATH)
    
    print(f"🚀 AI Trained Successfully on {len(df)} total records!")

def log_user_input(land_size, turnover, existing_loans, experience, predicted_score):
    """Saves the real user's input into our database so the AI can learn from it next time."""
    new_data = pd.DataFrame({
        'land_size': [land_size], 'turnover': [turnover],
        'existing_loans': [existing_loans], 'experience': [experience],
        'true_credit_score': [predicted_score] # Assuming the prediction is our best proxy until bank approval
    })
    # Append to the existing CSV
    new_data.to_csv(DATA_CSV_PATH, mode='a', header=not os.path.exists(DATA_CSV_PATH), index=False)
    print("📝 User data safely logged to database for future AI training!")

def predict_farmer_score(land_size, turnover, existing_loans, experience):
    """Predicts score, explains it, and logs the user data."""
    if not os.path.exists(MODEL_PATH) or not os.path.exists(ANOMALY_MODEL_PATH):
        train_and_save_model()
        
    model = joblib.load(MODEL_PATH)
    iso_forest = joblib.load(ANOMALY_MODEL_PATH)
    
    new_farmer = pd.DataFrame({
        'land_size': [land_size], 'turnover': [turnover],
        'existing_loans': [existing_loans], 'experience': [experience]
    })
    
    # 1. Check for fake/anomalous data
    is_anomaly = iso_forest.predict(new_farmer)[0] == -1 
    
    # 2. Predict Score
    score = int(model.predict(new_farmer)[0])
    
    # 🌟 3. CONTINUOUS LEARNING: Save this user's data to our live dataset!
    log_user_input(land_size, turnover, existing_loans, experience, score)
    
    # 4. Explainability (SHAP)
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(new_farmer)
    base_value = explainer.expected_value
    
    if isinstance(base_value, (np.ndarray, list)):
        base_val = float(base_value[0])
    else:
        base_val = float(base_value)
        
    explanation = {
        "base_starting_score": int(base_val),
        "impact_land_size": round(float(shap_values[0][0]), 2),
        "impact_turnover": round(float(shap_values[0][1]), 2),
        "impact_debts": round(float(shap_values[0][2]), 2),
        "impact_experience": round(float(shap_values[0][3]), 2)
    }
    
    # Risk Categorization
    if score >= 750:
        risk, color = "Low Risk (Excellent)", "emerald"
    elif score >= 600:
        risk, color = "Medium Risk (Good)", "amber"
    else:
        risk, color = "High Risk (Needs Collateral)", "rose"
        
    return {
        "alternative_credit_score": score,
        "risk_category": risk,
        "color_code": color,
        "math_breakdown": explanation,
        "data_anomaly_detected": bool(is_anomaly)
    }

if __name__ == "__main__":
    train_and_save_model()