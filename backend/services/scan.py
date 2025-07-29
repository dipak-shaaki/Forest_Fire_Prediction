import json
import joblib
from services.weather import get_weather_for_location
from utils.elevation import get_elevation
from models.alert_model import FireAlert

# Load model
model = joblib.load("model/random_forest_final_model.pkl")

# Load districts
with open("data/mock_response_centers_nepal.json") as f:
    
    DISTRICTS = json.load(f)

def scan_nepal_and_generate_alerts():
    results = []

    for dist in DISTRICTS:
        lat, lon = dist["location"]["lat"], dist["location"]["lon"]
        district = dist["district"]

        try:
            weather = get_weather_for_location(lat, lon)
            elevation = get_elevation(lat, lon)

            features = [[
                weather["temperature"],
                weather["humidity"],
                weather["wind_speed"],
                weather["precipitation"],
                elevation
            ]]

            risk = model.predict(features)[0]

            if risk == "High":
                results.append({
                    "district": district,
                    "location": { "lat": lat, "lon": lon },
                    "risk": risk,
                    "details": { **weather, "elevation": elevation }
                })

        except Exception as e:
            print(f"Error in {district}:", e)

    # Sort by temp and take top 12
    top_districts = sorted(results, key=lambda d: -d["details"]["temperature"])[:12]

    # Create alerts
    for r in top_districts:
        FireAlert(
            district=r["district"],
            risk_level=r["risk"],
            location=r["location"],
            reason=f"🔥 High fire risk due to temp {r['details']['temperature']}°C and low humidity {r['details']['humidity']}%"
        )

    return top_districts

# New function: scan Nepal and return high-risk districts only (no alert creation)
def scan_nepal_only():
    results = []
    for dist in DISTRICTS:
        lat, lon = dist["location"]["lat"], dist["location"]["lon"]
        district = dist["district"]
        try:
            weather = get_weather_for_location(lat, lon)
            elevation = get_elevation(lat, lon)
            features = [[
                weather["temperature"],
                weather["humidity"],
                weather["wind_speed"],
                weather["precipitation"],
                elevation
            ]]
            risk = model.predict(features)[0]
            if risk == "High":
                results.append({
                    "district": district,
                    "location": { "lat": lat, "lon": lon },
                    "risk": risk,
                    "details": { **weather, "elevation": elevation }
                })
        except Exception as e:
            print(f"Error in {district}:", e)
    # Sort by temp and take top 12
    top_districts = sorted(results, key=lambda d: -d["details"]["temperature"])[:12]
    return top_districts
