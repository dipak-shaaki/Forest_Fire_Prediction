from fastapi import FastAPI, Query
from pydantic import BaseModel
import joblib
import pandas as pd
import math
from utils.enrich import enrich_point

app = FastAPI(title="Nepal Forest Fire Risk API")

# Try to load model
try:
    model = joblib.load("./model/catboost_final_model.pkl")
except Exception as e:
    model = None
    print(f"[ERROR] Failed to load model: {e}")

# Define expected features
features = ['latitude', 'longitude', 'temperature', 'humidity',
            'wind_speed', 'precipitation', 'elevation', 'vpd']

# Root endpoint
@app.get("/")
def root():
    return {"message": "🔥 Nepal Forest Fire Risk API is live and ready!"}

# Health check
@app.get("/health")
def health():
    return {"status": "API is running!"}

# Manual prediction input schema
class ManualInput(BaseModel):
    latitude: float
    longitude: float
    temperature: float
    humidity: float
    wind_speed: float
    precipitation: float
    elevation: float

# Real-time prediction with live data
@app.get("/predict-fire")
def predict_fire(lat: float = Query(...), lon: float = Query(...), date: str = Query(...)):
    if not model:
        return {"error": "Model not loaded."}

    enriched = enrich_point(lat, lon, date)
    if not enriched:
        return {"error": f"Failed to enrich data for location ({lat}, {lon}) on {date}"}

    X = pd.DataFrame([enriched])
    y_pred = model.predict(X[features])[0]

    # You can change this mapping if your model predicts differently
    risk_mapping = {0: "Low", 1: "Moderate", 2: "High"}
    risk_level = risk_mapping.get(y_pred, "Unknown")

    return {
        "fire_occurred": int(y_pred),
        "risk_level": risk_level,
        "features": enriched
    }

# Manual input prediction (no enrichment)
@app.post("/predict-manual")
def predict_manual(data: ManualInput):
    if not model:
        return {"error": "Model not loaded."}

    try:
        vpd = round(
            (0.6108 * math.exp((17.27 * data.temperature) / (data.temperature + 237.3))) *
            (1 - data.humidity / 100),
            3
        )
    except:
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

    X = pd.DataFrame([enriched])
    y_pred = model.predict(X[features])[0]

    return {
        "fire_occurred": int(y_pred),
        "input": enriched
    }
