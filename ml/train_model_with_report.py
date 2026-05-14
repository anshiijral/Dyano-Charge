import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder

# 1. Load dataset
df = pd.read_csv("dyanocharge_dataset.csv")

# 2. Clean column names
df.columns = df.columns.str.strip()

# 3. Clean text values
for column in df.columns:
    df[column] = df[column].apply(
        lambda x: str(x).strip().upper() if isinstance(x, str) else x
    )

target_column = "RECOMMENDED"

if target_column not in df.columns:
    raise ValueError("RECOMMENDED column not found in dataset")

# -----------------------------
# Extra engineered features
# These help the model compare A, B, and C more clearly
# -----------------------------

df["A_SCORE"] = (
    df["A_LOAD"] * 0.45 +
    df["A_WAITING_TIME"] * 0.30 +
    df["A_DISTANCE"] * 0.20 +
    df["A_OCCUPANCY"] * 15
)

df["B_SCORE"] = (
    df["B_LOAD"] * 0.45 +
    df["B_WAITING_TIME"] * 0.30 +
    df["B_DISTANCE"] * 0.20 +
    df["B_OCCUPANCY"] * 15
)

df["C_SCORE"] = (
    df["C_LOAD"] * 0.45 +
    df["C_WAITING_TIME"] * 0.30 +
    df["C_DISTANCE"] * 0.20 +
    df["C_OCCUPANCY"] * 15
)

df["BEST_SCORE"] = df[["A_SCORE", "B_SCORE", "C_SCORE"]].min(axis=1)

df["A_SCORE_DIFF"] = df["A_SCORE"] - df["BEST_SCORE"]
df["B_SCORE_DIFF"] = df["B_SCORE"] - df["BEST_SCORE"]
df["C_SCORE_DIFF"] = df["C_SCORE"] - df["BEST_SCORE"]

df["A_SAFE"] = (
    (df["A_LOAD"] < 95) &
    (df["A_OCCUPANCY"] < 3) &
    (df["A_WAITING_TIME"] <= 45)
).astype(int)

df["B_SAFE"] = (
    (df["B_LOAD"] < 95) &
    (df["B_OCCUPANCY"] < 3) &
    (df["B_WAITING_TIME"] <= 45)
).astype(int)

df["C_SAFE"] = (
    (df["C_LOAD"] < 95) &
    (df["C_OCCUPANCY"] < 3) &
    (df["C_WAITING_TIME"] <= 45)
).astype(int)

df["SAFE_STATION_COUNT"] = df["A_SAFE"] + df["B_SAFE"] + df["C_SAFE"]

# 4. Split features and target
X = df.drop(columns=[target_column]).copy()
y = df[target_column].copy()

# 5. Encode text columns robustly
feature_encoders = {}

for column in X.columns:
    try:
        X[column] = pd.to_numeric(X[column])
    except ValueError:
        print(f"Encoding text column: {column}")
        encoder = LabelEncoder()
        X[column] = encoder.fit_transform(X[column].astype(str))
        feature_encoders[column] = encoder

# 6. Encode target/output column
target_encoder = LabelEncoder()
y_encoded = target_encoder.fit_transform(y.astype(str))

# 7. Split into training and testing
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

# 8. Train model
model = DecisionTreeClassifier(
    criterion="entropy",
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    random_state=42
)

model.fit(X_train, y_train)

# 9. Test model
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

report = classification_report(
    y_test,
    y_pred,
    target_names=target_encoder.classes_
)

matrix = confusion_matrix(y_test, y_pred)

rules = export_text(model, feature_names=list(X.columns))

# 10. Save files
joblib.dump(model, "dyanocharge_decision_tree_model.pkl")
joblib.dump(feature_encoders, "feature_encoders.pkl")
joblib.dump(target_encoder, "target_encoder.pkl")

with open("decision_tree_rules.txt", "w") as file:
    file.write(rules)

with open("model_report.txt", "w") as file:
    file.write("DYANOCHARGE DECISION TREE MODEL REPORT\n")
    file.write("=" * 50 + "\n\n")

    file.write(f"Dataset shape: {df.shape}\n")
    file.write(f"Training rows: {len(X_train)}\n")
    file.write(f"Testing rows: {len(X_test)}\n\n")

    file.write("Input features:\n")
    for feature in X.columns:
        file.write(f"- {feature}\n")

    file.write("\nOutput classes:\n")
    for label in target_encoder.classes_:
        file.write(f"- {label}\n")

    file.write(f"\nAccuracy: {round(accuracy * 100, 2)}%\n\n")

    file.write("Classification Report:\n")
    file.write(report)

    file.write("\nConfusion Matrix:\n")
    file.write(str(matrix))

    file.write("\n\nDecision Tree Rules:\n")
    file.write(rules)

print()
print("Model trained successfully")
print("Dataset shape:", df.shape)
print("Accuracy:", round(accuracy * 100, 2), "%")
print("Output classes:", list(target_encoder.classes_))
print()
print("Encoded text columns:", list(feature_encoders.keys()))
print()
print("Files saved:")
print("dyanocharge_decision_tree_model.pkl")
print("feature_encoders.pkl")
print("target_encoder.pkl")
print("decision_tree_rules.txt")
print("model_report.txt")