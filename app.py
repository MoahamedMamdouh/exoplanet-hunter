# 1. Import necessary libraries
from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO)

# 2. Initialize the Flask Application
app = Flask(__name__)

# 3. Load the model and preprocessing objects
try:
    model = joblib.load('ml_models/exoplanet_model.joblib')
    scaler = joblib.load('ml_models/scaler.joblib')
    label_encoder = joblib.load('ml_models/label_encoder.joblib')
    feature_names = joblib.load('ml_models/feature_names.joblib')
    
    # This is a temporary print statement for debugging your feature list.
    # It helps you see the exact feature names and order your model expects.
    logging.info("--- Model expects the following features: ---")
    logging.info(feature_names)
    logging.info("---------------------------------------------")
    
    logging.info("Model and preprocessing objects loaded successfully.")

except Exception as e:
    logging.error(f"Error loading model files: {e}")
    model = None

# 4. Define the home page route
@app.route('/')
def home():
    """Renders the main HTML page for the user interface."""
    return render_template('index.html')

# 5. Define the prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    """Receives data from the frontend, makes a prediction, and returns it."""
    
    if model is None:
        return jsonify({"error": "Model not loaded. Check server logs."}), 500

    # Get the JSON data sent from the JavaScript
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input: No data provided"}), 400

    try:
        # Reconstruct the feature array in the exact order the model was trained on
        input_features = [data[feature] for feature in feature_names]
        
        # Convert to a NumPy array for scaling and prediction
        input_array = np.array([input_features])
        
        # Scale the data using the loaded scaler
        input_scaled = scaler.transform(input_array)
        
        # Make the prediction
        prediction_numeric = model.predict(input_scaled)
        
        # Convert the numeric label back to the original string (e.g., 'CONFIRMED')
        prediction_label = label_encoder.inverse_transform(prediction_numeric)[0]

        # Return the result as JSON
        return jsonify({
            'prediction': prediction_label
        })
        
    except KeyError as e:
        # This error occurs if the incoming JSON is missing a required feature
        logging.error(f"KeyError: {e}")
        return jsonify({"error": f"Missing feature in input data: {e}"}), 400
    except Exception as e:
        # Handle any other unexpected errors during prediction
        logging.error(f"Prediction Error: {e}")
        return jsonify({"error": f"An error occurred during prediction: {str(e)}"}), 500

# 6. Run the application
if __name__ == '__main__':
    # debug=True automatically reloads the server when you save the file.
    app.run(debug=True)