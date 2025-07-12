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
from routes import contact_routes

load_dotenv()

#routes
from routes import fire_routes
from routes import admin_routes
from routes import test_mongo
from routes import auth_routes

app = FastAPI()

# Allow CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"] in production
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


# Load model
try:
    model = joblib.load("./model/catboost_final_model.pkl")
except Exception as e:
    model = None
    print(f"[ERROR] Could not load model: {e}")

# Feature list expected by the model
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


# Predict route
@app.post("/predict-manual")
def predict_manual(data: ManualInput):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    # Calculate VPD (Vapor Pressure Deficit)
    try:
        vpd = round(
            (0.6108 * math.exp((17.27 * data.temperature) / (data.temperature + 237.3))) *
            (1 - data.humidity / 100),
            3
        )
    except Exception:
        vpd = None

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

    # DataFrame for prediction
    X = pd.DataFrame([enriched])

    # Predict fire probability
    proba = model.predict_proba(X[features])[0][1]
    fire_flag = int(proba >= 0.5)

    # Risk classification
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

    # Explanation engine
    explanation = []

    if data.temperature > 30:
        explanation.append("High temperature increases the likelihood of ignition.")
    if data.humidity > 80:
        explanation.append("High humidity helps suppress fire spread.")
    if data.wind_speed > 10:
        explanation.append("Strong winds can fan flames and aid fire growth.")
    if data.precipitation >= 20:
        explanation.append("Heavy recent rainfall lowers ignition chances.")
    if vpd is not None:
        explanation.append(f"VPD value of {vpd} indicates {'dry' if vpd > 1.5 else 'moist'} air conditions.")

    # Summary headline
    summary = {
        "High": "Multiple dry‑and‑windy indicators suggest rapid ignition and spread.",
        "Moderate": "Some dryness exists, but moderating influences are present.",
        "Low": "Moist conditions or recent rain keep fire risk minimal."
    }[risk_level]

    # Final explanation sentence
    explanation_text = (
        f"{summary} " +
        " ".join(explanation) +
        f" Overall, the fire risk here is {risk_level.lower()}."
    )

    return {
        "fire_occurred": fire_flag,
        "risk_level": risk_level,
        "confidence": confidence,
        "input": enriched,
        "explanation": explanation_text
    }


class Settings(BaseModel):
    authjwt_secret_key: str = os.getenv("SECRET_KEY")

@AuthJWT.load_config
def get_config():
    return Settings()