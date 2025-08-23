from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import math
from dotenv import load_dotenv
import os
from fastapi_jwt_auth import AuthJWT
from routes import contact_routes, fire_report_routes, fire_routes, admin_routes, test_mongo, auth_routes
from models.admin import ensure_admin_exists

# --- NEW IMPORTS REQUIRED FOR CUSTOM RANDOM FOREST ---
import numpy as np
import sys

from custom_rf import RandomForest
_ = RandomForest


load_dotenv()

app = FastAPI()

# Allow CORS for development
app.add_middleware(
    CORSMiddleware,
    #  allow_origins=["*"],  ["http://localhost:5173"] # or in production
     allow_origins=["http://localhost:5173"],# or in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include additional route files
app.include_router(fire_routes.router)
app.include_router(admin_routes.router)
app.include_router(test_mongo.router)  
app.include_router(auth_routes.router)
app.include_router(contact_routes.router)
app.include_router(fire_report_routes.router) 

# It's recommended to load the model and scaler once at startup
# and inject them as dependencies rather than loading them in multiple route files.
model = None
scaler = None # Initialize scaler to None
try:
    # This loading logic is duplicated in admin_routes.py. Centralize it.
    model = joblib.load("./model/random_forest_final_model.pkl") # Load the Random Forest model
    if model is None:
        raise ValueError("Model is None, check the file path or model format.")
    scaler = joblib.load("./model/scaler.pkl") # Load the scaler
    print("Random Forest model and scaler loaded.")
except Exception as e:
    print(f"[ERROR] Could not load model or scaler: {e}")

# Feature list expected by the model (matches the order in which X was created in notebook)
features = [
    'latitude', 'longitude', 'temperature', 'humidity',
    'wind_speed', 'precipitation', 'elevation', 'vpd'
]

# Schema for manual prediction input
class ManualInput(BaseModel):
    latitude: float
    longitude: float
    temperature: float
    humidity: float
    wind_speed: float
    precipitation: float
    elevation: float


# ---- Root health check ----
@app.get("/")
async def root():
    return {"message": "API is running!"}



@app.on_event("startup")
async def init_app():
    await ensure_admin_exists()

    
# Predict route
@app.post("/predict-manual")
def predict_manual(data: ManualInput):
    if model is None or scaler is None: # Check if scaler is loaded too
        raise HTTPException(status_code=500, detail="Model or scaler not loaded")

    # Calculate VPD (Vapor Pressure Deficit)
    # Using the same formula as in the notebook's calculate_vpd function
    try:
        es = 0.6108 * math.exp((17.27 * data.temperature) / (data.temperature + 237.3))
        ea = (data.humidity / 100) * es
        vpd = round(es - ea, 3)
    except Exception:
        vpd = None # Or handle more robustly if VPD calculation fails

    enriched = {
        "latitude": data.latitude,
        "longitude": data.longitude,
        "temperature": data.temperature,
        "humidity": data.humidity,
        "wind_speed": data.wind_speed,
        "precipitation": data.precipitation,
        "elevation": data.elevation,
        "vpd": vpd
    }

    # DataFrame for prediction - Ensure column order matches training
    X_input = pd.DataFrame([enriched], columns=features) # Use the defined 'features' list for column order

    # IMPORTANT: Scale the input data before prediction
    try:
        X_scaled = scaler.transform(X_input)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scaling input data: {e}")


    # Predict fire probability
    # Assuming your custom RandomForest model has predict_proba
    proba = model.predict_proba(X_scaled)[0][1]
    fire_flag = int(proba >= 0.5)

    # Risk classification
    # NOTE: This logic is inconsistent with the logic in admin_routes.py.
    # This should be centralized in a single utility function.
    if proba >= 0.75:
        risk_level = "High"
    elif proba >= 0.40:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    # Natural-language confidence level
    confidence = (
        "High confidence" if proba > 0.75 else
        "Moderate confidence" if proba > 0.50 else
        "Low confidence" if proba > 0.25 else
        "Very low confidence"
    )

    # Explanation engine - Enhanced
    explanation_points = []
    
    # Temperature
    if data.temperature >= 35:
        explanation_points.append("Extremely high temperatures significantly increase the likelihood of ignition and rapid spread.")
    elif data.temperature > 30:
        explanation_points.append("High temperatures increase the likelihood of ignition.")
    elif data.temperature < 15:
        explanation_points.append("Lower temperatures reduce the chances of fire ignition.")

    # Humidity
    if data.humidity <= 20:
        explanation_points.append("Very low humidity leads to extremely dry fuels, accelerating fire spread.")
    elif data.humidity < 40:
        explanation_points.append("Low humidity indicates dry air, increasing fire risk.")
    elif data.humidity > 80:
        explanation_points.append("High humidity helps suppress fire spread due to moisture in the air.")
    elif data.humidity > 60:
        explanation_points.append("Moderate to high humidity conditions somewhat reduce fire risk.")

    # Wind Speed
    if data.wind_speed >= 15:
        explanation_points.append("Very strong winds can fan flames, carry embers, and drastically aid fire growth.")
    elif data.wind_speed > 8:
        explanation_points.append("Strong winds can fan flames and aid fire growth.")
    elif data.wind_speed < 2:
        explanation_points.append("Calm winds help limit fire spread.")

    # Precipitation
    if data.precipitation >= 25:
        explanation_points.append("Significant recent rainfall (heavy) almost eliminates immediate ignition chances.")
    elif data.precipitation >= 5:
        explanation_points.append("Recent precipitation helps lower ignition chances.")
    elif data.precipitation == 0:
        explanation_points.append("No recent precipitation contributes to drier conditions.")

    # VPD
    if vpd is not None:
        if vpd >= 3.0:
            explanation_points.append(f"VPD value of {vpd} kPa indicates extremely dry air and vegetation.")
        elif vpd >= 1.8:
            explanation_points.append(f"VPD value of {vpd} kPa indicates very dry air conditions, highly conducive to fire.")
        elif vpd >= 0.8:
            explanation_points.append(f"VPD value of {vpd} kPa indicates moderately dry air conditions.")
        else:
            explanation_points.append(f"VPD value of {vpd} kPa indicates moist air conditions, reducing fire risk.")
    
    # Elevation - Could add rules based on elevation and typical vegetation for that elevation
    # Example: if data.elevation > 1500: explanation_points.append("Higher elevations might have different vegetation types and weather patterns affecting fire risk.")

    # Summary headline (keep existing)
    summary = {
        "High": "Multiple dry‑and‑windy indicators suggest rapid ignition and spread.",
        "Moderate": "Some dryness exists, but moderating influences are present.",
        "Low": "Moist conditions or recent rain keep fire risk minimal."
    }[risk_level]

    # Risk message
    risk_message = {
        "High": " High fire risk! Take precautions.",
        "Moderate": "Moderate risk: Be alert.",
        "Low": "Your forest is safe. Low fire risk."
    }[risk_level]

    # Final explanation sentence
    explanation_text = (
        f"{summary} " +
        (" ".join(explanation_points) if explanation_points else "No specific dominant factors observed based on current rules.") +
        f" Overall, the fire risk here is {risk_level.lower()}."
    )

    return {
        "fire_occurred": fire_flag,
        "risk_level": risk_level,
        "confidence": confidence,
        "probability": float(proba),
        "input": enriched,
        "explanation": explanation_text,
        "risk_message": risk_message
    }


class Settings(BaseModel):
    authjwt_secret_key: str = os.getenv("SECRET_KEY")

@AuthJWT.load_config
def get_config():
    return Settings()