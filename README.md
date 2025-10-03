# Exoplanet Hunter AI 🪐

This project is a full-stack web application that uses a machine learning model to classify celestial objects from NASA's Kepler mission, helping to automate and accelerate the process of scientific discovery.

## Demo 🎥

![Exoplanet Hunter AI Demo](demo1.gif)

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)

## Project Overview
The exponential growth of astrophysical data from sky survey missions like Kepler presents a significant data analysis challenge. The manual vetting of stellar transit data is a slow, labor-intensive bottleneck that limits the pace of new discoveries. This project's objective is to streamline this discovery pipeline by developing a reliable classification tool that can rapidly distinguish between genuine exoplanet candidates and false positives.

The solution is an end-to-end machine learning system consisting of a Python-based data processing pipeline, a RESTful API built with Flask to serve predictions, and a dynamic web interface for user interaction.

## Features
- **Exoplanet Classification:** Predicts if a celestial object is a `CONFIRMED` planet, `CANDIDATE`, or `FALSE POSITIVE`.
- **Model Performance Viewer:** An interactive modal displays the model's classification report and confusion matrix.
- **Hyperparameter Tuning:** Allows users to experiment with model settings (`n_estimators`, `max_depth`) and retrain a temporary model on-the-fly to see how performance is affected.
- **Data Ingestion:** A researcher-focused feature to upload new labeled CSV data, append it to the main dataset, and trigger a full retraining of the primary model.

## Tech Stack
- **Backend:** Python, Flask, Scikit-learn, Pandas, NumPy, XGBoost
- **Frontend:** HTML, CSS, JavaScript, Bootstrap 5
- **Development:** Jupyter Lab, Git & GitHub
- **Data Source:** NASA Exoplanet Archive (Kepler Objects of Interest)

## Project Structure
exoplanet-hunter/


├── ml_models/               # Stores the serialized ML model and preprocessing objects

├── notebooks/               # Contains the Jupyter Notebook for EDA and model experimentation

├── scripts/                 # Holds the standalone model training script

├── static/                  # Frontend assets (CSS, JavaScript)

├── templates/               # HTML templates for the Flask application

├── .gitignore               # Specifies files for Git to ignore

├── app.py                   # The main Flask application script (backend)

├── README.md                # Project documentation (this file)

└── requirements.txt         # Python package dependencies

## Setup and Installation

Follow these steps to run the project on your local machine.

1. *Clone the repository:*
   
   git clone [https://github.com/MoahamedMamdouh/exoplanet-hunter.git]

   cd exoplanet-hunter

2.*Create and activate a virtual environment:*

   python -m venv venv

   .\venv\Scripts\activate

3.*Install dependencies:*

  pip install -r requirements.txt

4.*Generate Model Files:*

  python scripts/train_model.py

5.*Run the application:*

  python app.py

6.*Access the application:*

  Open your web browser and navigate to http://127.0.0.1:5000/.