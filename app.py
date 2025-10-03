import json
import logging
import numpy as np
import pandas as pd
import joblib
import subprocess
from flask import Flask, request, jsonify, render_template
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

# Configure basic logging
logging.basicConfig(level=logging.INFO)

# Initialize the Flask Application
app = Flask(__name__)

# Load the model and all preprocessing objects
try:
    model = joblib.load('ml_models/exoplanet_model.joblib')
    preprocessors = joblib.load('ml_models/preprocessors.joblib')
    
    scaler = preprocessors['scaler']
    label_encoder = preprocessors['label_encoder']
    flag_columns = preprocessors['flag_columns']
    continuous_columns = preprocessors['continuous_columns']
    
    logging.info("Model and preprocessors loaded successfully.")

except Exception as e:
    logging.error(f"Error loading model files: {e}")
    model = None

@app.route('/')
def home():
    """Renders the main HTML page for the user interface."""
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    """Receives data, performs selective scaling, and returns a prediction."""
    if model is None: 
        return jsonify({"error": "Model not loaded. Check server logs."}), 500
    
    data = request.get_json()
    if not data: 
        return jsonify({"error": "Invalid input: No data provided"}), 400
    
    try:
        input_continuous_list = [data[feature] for feature in continuous_columns]
        input_flags_list = [data[feature] for feature in flag_columns]
        
        input_continuous_array = np.array([input_continuous_list])
        input_flags_array = np.array([input_flags_list])
        
        input_continuous_scaled = scaler.transform(input_continuous_array)
        
        input_processed = np.concatenate([input_continuous_scaled, input_flags_array], axis=1)

        prediction_numeric = model.predict(input_processed)
        prediction_label = label_encoder.inverse_transform(prediction_numeric)[0]
        
        return jsonify({'prediction': prediction_label})
        
    except Exception as e:
        logging.error(f"Prediction Error: {e}")
        return jsonify({"error": f"An error occurred during prediction: {str(e)}"}), 500

@app.route('/stats')
def get_stats():
    """Endpoint to serve the model's performance statistics."""
    try:
        with open('ml_models/model_stats.json', 'r') as f:
            stats = json.load(f)
        return jsonify(stats)
    except FileNotFoundError:
        return jsonify({"error": "Statistics file not found. Please run the training script."}), 404

@app.route('/retrain', methods=['POST'])
def retrain():
    """Retrains a new model on-the-fly based on user-provided hyperparameters."""
    logging.info("Retraining request received.")
    try:
        params = request.get_json()
        n_estimators = int(params.get('n_estimators', 100))
        max_depth = int(params.get('max_depth', 10))
        
        df = pd.read_csv('cumulative_2025.10.02_01.49.37.csv', comment='#')
        df_cleaned = df.dropna(axis='columns', thresh=len(df) * 0.75).dropna().reset_index(drop=True)
        
        features_to_drop = [col for col in ['rowid', 'kepid', 'kepoi_name', 'kepler_name', 'koi_disposition', 'koi_pdisposition', 'koi_score', 'koi_tce_delivname'] if col in df_cleaned.columns]
        X = df_cleaned.drop(columns=features_to_drop).select_dtypes(include=['number'])
        y_raw = df_cleaned['koi_disposition']
        
        label_encoder_retrain = preprocessors['label_encoder']
        y = label_encoder_retrain.transform(y_raw)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        X_train_continuous = X_train[continuous_columns]
        X_test_continuous = X_test[continuous_columns]
        X_train_flags = X_train[flag_columns].values
        X_test_flags = X_test[flag_columns].values

        scaler_retrain = StandardScaler().fit(X_train_continuous)
        X_train_continuous_scaled = scaler_retrain.transform(X_train_continuous)
        X_test_continuous_scaled = scaler_retrain.transform(X_test_continuous)
        
        X_train_processed = np.concatenate([X_train_continuous_scaled, X_train_flags], axis=1)
        X_test_processed = np.concatenate([X_test_continuous_scaled, X_test_flags], axis=1)

        logging.info(f"Training new model with n_estimators={n_estimators}, max_depth={max_depth}")
        temp_model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth, random_state=42)
        temp_model.fit(X_train_processed, y_train)
        
        y_pred = temp_model.predict(X_test_processed)
        report = classification_report(y_test, y_pred, target_names=label_encoder_retrain.classes_, output_dict=True)
        
        logging.info("Retraining and evaluation complete.")
        return jsonify(report)
    except Exception as e:
        logging.error(f"Error during retraining: {e}")
        return jsonify({"error": str(e)}), 500
# In app.py

@app.route('/upload_and_retrain', methods=['POST'])
def upload_and_retrain():
    """
    Accepts a new labeled CSV, appends it to the main dataset,
    and triggers the training script.
    """
    logging.info("New data upload request received.")

    if 'new_data_file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['new_data_file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if file and file.filename.endswith('.csv'):
        try:
            # Read the main dataset
            main_df_path = 'cumulative_2025.10.02_01.49.37.csv' # Your correct filename
            main_df = pd.read_csv(main_df_path, comment='#')
            
            # Read the newly uploaded data, IGNORING COMMENTS
            new_data_df = pd.read_csv(file, comment='#')
            
            # --- IMPORTANT: Append new data and save ---
            # A quick check to make sure columns align
            if not all(main_df.columns == new_data_df.columns):
                return jsonify({"error": "Uploaded CSV columns do not match the main dataset."}), 400

            combined_df = pd.concat([main_df, new_data_df], ignore_index=True)
            combined_df.to_csv(main_df_path, index=False)
            logging.info(f"Appended {len(new_data_df)} new rows to the main dataset.")

            # --- Trigger the training script as a background process ---
            logging.info("Triggering background training process...")
            subprocess.Popen(['python', 'scripts/train_model.py'])

            return jsonify({"message": "File received. Appending data and starting model retraining in the background. This may take several minutes."})

        except Exception as e:
            logging.error(f"Error during file processing and retraining: {e}")
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Invalid file type. Please upload a .csv file."}), 400
if __name__ == '__main__':
    # We added use_reloader=False to help debug the server startup issue.
    app.run(debug=True, use_reloader=False)