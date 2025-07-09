from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import joblib
import pandas as pd
import math
from fastapi.middleware.cors import CORSMiddleware
from routes import fire_routes

app = FastAPI()

app.include_router(fire_routes.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
try:
    model = joblib.load("./model/catboost_final_model.pkl")
except Exception as e:
    model = None
    print(f"[ERROR] Could not load model: {e}")

features = ['latitude', 'longitude', 'temperature', 'humidity',
            'wind_speed', 'precipitation', 'elevation', 'vpd']

class ManualInput(BaseModel):
    latitude: float
    longitude: float
    temperature: float
    humidity: float
    wind_speed: float
    precipitation: float
    elevation: float

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

    # 🔍 Explanation logic (simple rule-based for now)
    explanation = []
    risk_level = "Low"

    if data.temperature > 30:
        explanation.append("High temperature increases fire risk.")
    if data.humidity > 80:
        explanation.append("High humidity suppresses fire spread.")
    if data.wind_speed > 10:
        explanation.append("High wind speed may escalate fire risk.")
    if data.precipitation > 1:
        explanation.append("Recent precipitation reduces ignition chances.")
    if vpd is not None:
        if vpd > 2:
            explanation.append("High VPD indicates dryness and higher fire potential.")
        else:
            explanation.append("Low VPD suggests moist conditions, reducing risk.")

    # Simple rule-based risk level (tune as needed)
    if vpd and vpd > 2.5 and data.temperature > 30 and data.humidity < 40:
        risk_level = "High"
    elif vpd and vpd > 1.5:
        risk_level = "Moderate"

    return {
        "fire_occurred": int(y_pred),
        "input": enriched,
        "risk_level": risk_level,
        "explanation": " ".join(explanation)
    }
