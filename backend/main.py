from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import joblib
import pandas as pd
import math
import csv
import io
import requests
from fastapi.middleware.cors import CORSMiddleware

from utils.enrich import enrich_point

app = FastAPI(title="Nepal Forest Fire Risk API")

# CORS policy
app.add_middleware( CORSMiddleware, allow_origins=["*"], allow_credentials=True, 
allow_methods=["*"], 
allow_headers=["*"], )

# Load model
try:
    model = joblib.load("./model/catboost_final_model.pkl")
except Exception as e:
    model = None
    print(f"[ERROR] Failed to load model: {e}")

features = ['latitude', 'longitude', 'temperature', 'humidity',
            'wind_speed', 'precipitation', 'elevation', 'vpd']

@app.get("/")
def root():
    return {"message": "Nepal Forest Fire Risk API is live and ready!"}

@app.get("/health")
def health():
    return {"status": "API is running!"}

@app.get("/api/fires")
def get_fires():
    FIRMS_TOKEN = "eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6ImRpcGFrMjIiLCJleHAiOjE3NTY2NTc3ODAsImlhdCI6MTc1MTQ3Mzc4MCwiaXNzIjoiaHR0cHM6Ly91cnMuZWFydGhkYXRhLm5hc2EuZ292IiwiaWRlbnRpdHlfcHJvdmlkZXIiOiJlZGxfb3BzIiwiYWNyIjoiZWRsIiwiYXNzdXJhbmNlX2xldmVsIjozfQ.N0aH9ghBlyBlboVNlMDju45MTC8kjD860Gh80Sipp4BOEYLPIZ_8VvpanorY53GD77jSNGCcRKeD0Fr9C30HNxfqw_-mcwc6dS7Hbb3JUUcfLi-4InXrHLRpGWjsxW_33KMeCKjFveEjIMn3FO_7HCmYOdLvNxPHP5XVIXj6iEW9ntFJJcYz1RCtXM4LosKl_zXK10VfFCa68ZY5IapOhaIsSKmhcbqTfWNJKw5wfIXQlztB4XfJa4biVrBgvRZwJVBPI3zMrjmHIrgOdO8DJIGhAWHzSqVpGkzXVg04jdZLPN4x2KIzBcbBV9ZpA9WPy-zLKxegFVeU-QP7YY42ww"
   
    try:
        url = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Nepal_7d.csv"
        
        headers = {
        "Authorization": f"Bearer {FIRMS_TOKEN}"
    }
        res = requests.get(url, headers=headers, timeout=10)

        if res.status_code != 200:
            return JSONResponse(status_code=500, content={"error": f"Failed to fetch FIRMS data: Status {res.status_code}"})

        decoded = res.content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded))
        data = [row for row in csv_reader]

        return JSONResponse(content=data)

    except Exception as e:
        print(f"[ERROR] in get_fires: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

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
