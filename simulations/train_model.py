import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

# Load the data
data = pd.read_csv('docker_stats.csv')

# Preprocess the data
# Convert columns to appropriate numeric types
numeric_columns = ['cpu_perc', 'mem_usage', 'mem_limit', 'mem_perc', 'pids']
for col in numeric_columns:
    data[col] = pd.to_numeric(data[col], errors='coerce')

# Drop rows with missing values in the numeric columns or label
data = data.dropna(subset=numeric_columns + ['label'])

# Encode labels
data['label'] = data['label'].map({'working': 0, 'error': 1})

# Select features and target
features = data[['cpu_perc', 'mem_usage', 'mem_limit', 'mem_perc', 'pids']]
target = data['label']

# Handle infinite values 
features = features.replace([np.inf, -np.inf], np.nan)
features = features.dropna()

# Ensure target aligns with features after dropping NaNs
target = target.loc[features.index]

from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
features_scaled = scaler.fit_transform(features)

# Split the data
X_train, X_test, y_train, y_test = train_test_split(features_scaled, target, test_size=0.2, random_state=42)

# Train the model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

print("\nClassification Report:")
print(classification_report(y_test, y_pred))
joblib.dump(scaler, 'scaler.pkl')
joblib.dump(model, 'trained_model.pkl')  
print("Model saved as 'trained_model.pkl'")