import pandas as pd
import joblib

print("--- Starting Prediction ---")
model = joblib.load("dyanocharge_decision_tree_model.pkl")
feature_encoders = joblib.load("feature_encoders.pkl")
target_encoder = joblib.load("target_encoder.pkl")

sample = {
    "A_LOAD": 45, "A_LOAD_STATUS": "GREEN", "A_OCCUPANCY": 0, "A_DISTANCE": 0.5, "A_WAITING_TIME": 3.0,
    "B_LOAD": 75, "B_LOAD_STATUS": "YELLOW", "B_OCCUPANCY": 1, "B_DISTANCE": 1.2, "B_WAITING_TIME": 12.0,
    "C_LOAD": 90, "C_LOAD_STATUS": "RED", "C_OCCUPANCY": 2, "C_DISTANCE": 2.1, "C_WAITING_TIME": 25.0,
    "GRID_HEADROOM": 40.0, "GRID_STATUS": "GREEN", "BATTERY": 55
}

sample_df = pd.DataFrame([sample])

for column in sample_df.columns:
    if sample_df[column].dtype == "object":
        sample_df[column] = sample_df[column].astype(str).str.strip().str.upper()

for column, encoder in feature_encoders.items():
    if column in sample_df.columns:
        sample_df[column] = encoder.transform(sample_df[column])

sample_df = sample_df.astype(float)
prediction_encoded = model.predict(sample_df)[0]
prediction = target_encoder.inverse_transform([prediction_encoded])[0]

print(f"Recommended Decision: {prediction}")
