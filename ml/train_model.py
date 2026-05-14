import pandas as pd
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder

# 1. Load dataset
df = pd.read_csv("dyanocharge_dataset.csv")

print("Dataset loaded successfully")
print("Shape:", df.shape)

# 2. Clean column names
df.columns = df.columns.str.strip()

# 3. Clean text values
for column in df.columns:
    if df[column].dtype == "object":
        df[column] = df[column].astype(str).str.strip().str.upper()

# 4. Target/output column
target_column = "RECOMMENDED"
if target_column not in df.columns:
    raise ValueError(f"{target_column} column not found in dataset")

# 5. Separate input features and output label
X = df.drop(columns=[target_column])
y = df[target_column]

# 6. Encode all text/categorical columns in X
# FIX: Use a more robust check for string data
feature_encoders = {}
for column in X.columns:
    # Check if dtype is object or if the first non-null value is a string
    if X[column].dtype == "object" or isinstance(X[column].dropna().iloc[0], str):
        print(f"Encoding categorical column: {column}")
        encoder = LabelEncoder()
        X[column] = encoder.fit_transform(X[column].astype(str))
        feature_encoders[column] = encoder

# 7. Final safety check: ensure everything is numeric
# This will help identify exactly which column is failing if 'GREEN' persists
try:
    X = X.astype(float)
except ValueError as e:
    print("\nERROR: Conversion to float failed!")
    for col in X.columns:
        try:
            X[col].astype(float)
        except:
            print(f"Column '{col}' still contains non-numeric values like: {X[col].unique()[:3]}")
    raise e

# 8. Encode output labels
target_encoder = LabelEncoder()
y_encoded = target_encoder.fit_transform(y)

print("\nTarget classes:", list(target_encoder.classes_))

# 9. Split into training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

# 10. Create Decision Tree model
model = DecisionTreeClassifier(
    max_depth=5,
    random_state=42
)

# 11. Train model
model.fit(X_train, y_train)

# 12. Test model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("\nModel trained successfully")
print("Accuracy:", round(accuracy * 100, 2), "%")

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=target_encoder.classes_))

# 13. Export readable decision rules
rules = export_text(model, feature_names=list(X.columns))

# 14. Save model and encoders
joblib.dump(model, "dyanocharge_decision_tree_model.pkl")
joblib.dump(feature_encoders, "feature_encoders.pkl")
joblib.dump(target_encoder, "target_encoder.pkl")

with open("decision_tree_rules.txt", "w") as file:
    file.write(rules)

print("\nAll files saved successfully.")