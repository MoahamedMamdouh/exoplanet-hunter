import pandas as pd
import numpy as np
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from joblib import dump

def train():
    print("--- Starting model training script (v2 with selective scaling) ---")

    df = pd.read_csv('cumulative_2025.10.02_01.49.37.csv', comment='#')
    df_cleaned = df.dropna(axis='columns', thresh=len(df) * 0.75).dropna().reset_index(drop=True)
    
    features_to_drop = [col for col in ['rowid', 'kepid', 'kepoi_name', 'kepler_name', 'koi_disposition', 'koi_pdisposition', 'koi_score', 'koi_tce_delivname'] if col in df_cleaned.columns]
    X = df_cleaned.drop(columns=features_to_drop).select_dtypes(include=['number'])
    y_raw = df_cleaned['koi_disposition']
    
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y_raw)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # --- NEW: Separate flag columns from continuous columns ---
    flag_columns = [col for col in X_train.columns if 'flag' in col]
    continuous_columns = [col for col in X_train.columns if 'flag' not in col]
    
    X_train_continuous = X_train[continuous_columns]
    X_test_continuous = X_test[continuous_columns]
    X_train_flags = X_train[flag_columns].values
    X_test_flags = X_test[flag_columns].values
    
    # Scale ONLY the continuous features
    scaler = StandardScaler()
    X_train_continuous_scaled = scaler.fit_transform(X_train_continuous)
    X_test_continuous_scaled = scaler.transform(X_test_continuous)
    
    # Recombine the scaled continuous features with the unscaled flag features
    X_train_processed = np.concatenate([X_train_continuous_scaled, X_train_flags], axis=1)
    X_test_processed = np.concatenate([X_test_continuous_scaled, X_test_flags], axis=1)
    
    print("Training RandomForestClassifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_processed, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test_processed)
    
    report = classification_report(y_test, y_pred, target_names=label_encoder.classes_, output_dict=True)
    conf_matrix = confusion_matrix(y_test, y_pred).tolist()
    
    stats = {
        "classification_report": report,
        "confusion_matrix": conf_matrix,
        "class_labels": label_encoder.classes_.tolist()
    }
    
    # Save all preprocessors and column lists in a single dictionary
    preprocessors = {
        'scaler': scaler,
        'label_encoder': label_encoder,
        'flag_columns': flag_columns,
        'continuous_columns': continuous_columns
    }
    
    print("Saving model, preprocessors, and stats...")
    dump(model, 'ml_models/exoplanet_model.joblib')
    dump(preprocessors, 'ml_models/preprocessors.joblib')
    
    with open('ml_models/model_stats.json', 'w') as f:
        json.dump(stats, f, indent=4)
        
    print("--- Training complete and all files saved. ---")

if __name__ == '__main__':
    train()