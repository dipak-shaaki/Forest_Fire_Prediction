from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import joblib
import pandas as pd
import math
from fastapi.middleware.cors import CORSMiddleware
from routes import fire_routes
from fastapi import HTTPException

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
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    # ---------- compute VPD ----------
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

    X = pd.DataFrame([enriched])

    # ---------- model prediction ----------
    proba = model.predict_proba(X[features])[0][1]   # probability of fire (class 1)
    fire_flag = int(proba >= 0.5)

    # ---------- risk level purely from probability ----------
    if proba >= 0.75:
        risk_level = "High"
    elif proba >= 0.40:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    # ---------- build human explanation (rule‑based text only) ----------
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

    summary = {
        "High": "Multiple dry‑and‑windy indicators suggest rapid ignition and spread.",
        "Moderate": "Mixed factors: some dryness but also moderating influences.",
        "Low": "Moist conditions or recent rain keep fire risk minimal."
    }[risk_level]

    explanation_text = summary + " " + " ".join(explanation)

    return {
        "fire_occurred": fire_flag,             # 1 or 0
        "probability": round(proba, 3),         # send to frontend if desired
        "risk_level": risk_level,               # consistent with probability
        "input": enriched,
        "explanation": explanation_text
    }