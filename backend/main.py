from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import joblib
import pandas as pd
import math
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

    return {
        "fire_occurred": int(y_pred),
        "input": enriched
    }
