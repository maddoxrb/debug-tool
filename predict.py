import sys
import pandas as pd
import numpy as np
import joblib
import json

# Load the trained model
with open('trained_model.pkl', 'rb') as f:
    model = joblib.load('trained_model.pkl')

# Read input data from stdin
input_json = sys.stdin.read()
input_data = json.loads(input_json)

# Convert input data to DataFrame
df = pd.DataFrame([input_data])

# Convert columns to appropriate numeric types
numeric_columns = ['cpu_perc', 'mem_usage', 'mem_limit', 'mem_perc', 'pids']
for col in numeric_columns:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Handle missing values
df = df.fillna(0)

scaler = joblib.load('scaler.pkl')
# Apply scaling to the input features
df_scaled = scaler.transform(df[numeric_columns])
prediction = model.predict(df_scaled)

# Output the prediction
print(int(prediction[0]))
