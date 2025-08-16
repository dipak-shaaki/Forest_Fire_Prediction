import datetime
from fastapi import APIRouter, HTTPException, Depends
from fastapi_jwt_auth import AuthJWT
from models.alert_model import FireAlert, UpdateAlert
from database.mongo import alerts_collection
from bson import ObjectId
import smtplib
import os
from email.mime.text import MIMEText
from pydantic import BaseModel, EmailStr
from models.fire_report import UpdateReportStatus
from database.mongo import db
from services.scan import scan_nepal_and_generate_alerts
from auth.dependencies import admin_required
from services.scan import scan_nepal_only
import pandas as pd
import numpy as np
import math
import joblib
from typing import List, Dict, Any
import requests
import time



router = APIRouter(prefix="/admin", tags=["Admin Alerts"])

def serialize_alert(alert):
    alert['id'] = str(alert['_id'])
    del alert['_id']
    return alert

def admin_required(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()   # raises 401 if no/invalid token






class EmailReply(BaseModel):
    to_email: EmailStr
    subject: str
    message: str

class ReportEmailReply(BaseModel):
    report_id: str
    subject: str
    message: str

# This endpoint allows admins to send replies to alerts via email
@router.post("/reply")
def send_reply_email(payload: EmailReply):
    sender = os.getenv("SMTP_SENDER")
    password = os.getenv("SMTP_PASSWORD")

    try:
        msg = MIMEText(payload.message)
        msg['Subject'] = payload.subject
        msg['From'] = sender
        msg['To'] = payload.to_email

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.send_message(msg)

        return {"msg": "Reply sent successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

# This endpoint allows admins to send replies to fire reports via email
@router.post("/reply-report")
async def send_report_reply(payload: ReportEmailReply, user=Depends(admin_required)):
    try:
        # Get the report to get reporter's email
        report = await report_collection.find_one({"_id": ObjectId(payload.report_id)})
        if not report:
            raise HTTPException(404, detail="Report not found")
        
        if not report.get("email"):
            raise HTTPException(400, detail="No email found for this report")
        
        sender = os.getenv("SMTP_SENDER")
        password = os.getenv("SMTP_PASSWORD")

        msg = MIMEText(payload.message)
        msg['Subject'] = payload.subject
        msg['From'] = sender
        msg['To'] = report['email']

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.send_message(msg)

        return {"msg": "Reply sent successfully to reporter"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")


# Load model and scaler
try:
    model = joblib.load("model/random_forest_final_model.pkl")
    scaler = joblib.load("model/scaler.pkl")
    print("Model and scaler loaded for admin routes")
except Exception as e:
    print(f"Error loading model: {e}")
    try:
        # Try alternative path
        model = joblib.load("./model/random_forest_final_model.pkl")
        scaler = joblib.load("./model/scaler.pkl")
        print("Model and scaler loaded with alternative path")
    except Exception as e2:
        print(f"Error loading model with alternative path: {e2}")
        model = None
        scaler = None

# Features expected by the model
features = [
    'latitude', 'longitude', 'temperature', 'humidity',
    'wind_speed', 'precipitation', 'elevation', 'vpd'
]

# Nepal forest/rural districts with coordinates and typical weather data for forest fire prediction
NEPAL_DISTRICTS = [
    {"forest": "Makwanpur Forest", "district": "Makwanpur", "lat": 27.4167, "lng": 85.0333, "elevation": 467, "province": "Bagmati", "location_details": "Central Nepal, Forest region near Hetauda"},
    {"forest": "Chitwan National Park", "district": "Chitwan", "lat": 27.5170, "lng": 84.4167, "elevation": 415, "province": "Bagmati", "location_details": "Central Nepal, Terai forest region"},
    {"forest": "Parsa Wildlife Reserve", "district": "Parsa", "lat": 27.0000, "lng": 84.8667, "elevation": 92, "province": "Madhesh", "location_details": "Central Nepal, Terai forest region"},
    {"forest": "Bardiya National Park", "district": "Bardiya", "lat": 28.0500, "lng": 81.6167, "elevation": 150, "province": "Lumbini", "location_details": "Western Nepal, Terai forest region"},
    {"forest": "Shuklaphanta Wildlife Reserve", "district": "Kanchanpur", "lat": 28.7000, "lng": 80.6000, "elevation": 109, "province": "Sudurpaschim", "location_details": "Far Western Nepal, Terai forest region"},
    {"forest": "Koshi Tappu Wildlife Reserve", "district": "Sunsari", "lat": 26.6667, "lng": 87.2833, "elevation": 95, "province": "Province 1", "location_details": "Eastern Nepal, Terai forest region"},
    {"forest": "Dang Forest", "district": "Dang", "lat": 28.1333, "lng": 82.3000, "elevation": 730, "province": "Lumbini", "location_details": "Western Nepal, Dang Valley forest"},
    {"forest": "Banke National Park", "district": "Banke", "lat": 28.0333, "lng": 82.4833, "elevation": 670, "province": "Lumbini", "location_details": "Western Nepal, forest region"},
    {"forest": "Palpa Forest", "district": "Palpa", "lat": 27.8667, "lng": 83.5500, "elevation": 1372, "province": "Lumbini", "location_details": "Western Nepal, Palpa forest district"},
    {"forest": "Tanahun Forest", "district": "Tanahun", "lat": 27.9833, "lng": 84.2833, "elevation": 457, "province": "Gandaki", "location_details": "Central Nepal, Tanahun forest district"},
    {"forest": "Nepalgunj Forest", "district": "Banke", "lat": 28.0500, "lng": 81.6167, "elevation": 150, "province": "Lumbini", "location_details": "Western Nepal, Terai forest region"},
    {"forest": "Dhangadhi Forest", "district": "Kailali", "lat": 28.7000, "lng": 80.6000, "elevation": 109, "province": "Sudurpaschim", "location_details": "Far Western Nepal, Terai forest region"},
    {"forest": "Janakpur Forest", "district": "Dhanusa", "lat": 26.7271, "lng": 85.9403, "elevation": 78, "province": "Madhesh", "location_details": "Eastern Nepal, Terai forest region"},
    {"forest": "Birgunj Forest", "district": "Parsa", "lat": 27.0000, "lng": 84.8667, "elevation": 92, "province": "Madhesh", "location_details": "Central Nepal, Terai forest region"},
    {"forest": "Itahari Forest", "district": "Sunsari", "lat": 26.6667, "lng": 87.2833, "elevation": 95, "province": "Province 1", "location_details": "Eastern Nepal, Terai forest region"},
    {"forest": "Tulsipur Forest", "district": "Dang", "lat": 28.1333, "lng": 82.3000, "elevation": 730, "province": "Lumbini", "location_details": "Western Nepal, Dang Valley forest"},
    {"forest": "Ghorahi Forest", "district": "Dang", "lat": 28.0333, "lng": 82.4833, "elevation": 670, "province": "Lumbini", "location_details": "Western Nepal, Dang Valley forest"},
    {"forest": "Tansen Forest", "district": "Palpa", "lat": 27.8667, "lng": 83.5500, "elevation": 1372, "province": "Lumbini", "location_details": "Western Nepal, Palpa forest district"},
    {"forest": "Damauli Forest", "district": "Tanahun", "lat": 27.9833, "lng": 84.2833, "elevation": 457, "province": "Gandaki", "location_details": "Central Nepal, Tanahun forest district"},
    {"forest": "Gorkha Forest", "district": "Gorkha", "lat": 28.0000, "lng": 84.6333, "elevation": 1135, "province": "Gandaki", "location_details": "Central Nepal, Gorkha forest district"},
    {"forest": "Lamjung Forest", "district": "Lamjung", "lat": 28.2333, "lng": 84.3833, "elevation": 1740, "province": "Gandaki", "location_details": "Central Nepal, Lamjung forest district"},
    {"forest": "Kaski Forest", "district": "Kaski", "lat": 28.3000, "lng": 83.8167, "elevation": 827, "province": "Gandaki", "location_details": "Central Nepal, Pokhara Valley forest"},
    {"forest": "Syangja Forest", "district": "Syangja", "lat": 28.1000, "lng": 83.8167, "elevation": 1000, "province": "Gandaki", "location_details": "Central Nepal, Syangja forest district"},
    {"forest": "Tanahun Forest", "district": "Tanahun", "lat": 27.9333, "lng": 84.2333, "elevation": 457, "province": "Gandaki", "location_details": "Central Nepal, Tanahun forest district"},
    {"forest": "Palpa Forest", "district": "Palpa", "lat": 27.8667, "lng": 83.5500, "elevation": 1372, "province": "Lumbini", "location_details": "Western Nepal, Palpa forest district"},
    {"forest": "Gulmi Forest", "district": "Gulmi", "lat": 28.0667, "lng": 83.3000, "elevation": 1524, "province": "Lumbini", "location_details": "Western Nepal, Gulmi forest district"},
    {"forest": "Arghakhanchi Forest", "district": "Arghakhanchi", "lat": 27.9000, "lng": 83.2000, "elevation": 1524, "province": "Lumbini", "location_details": "Western Nepal, Arghakhanchi forest district"},
    {"forest": "Pyuthan Forest", "district": "Pyuthan", "lat": 28.1000, "lng": 82.8667, "elevation": 1372, "province": "Lumbini", "location_details": "Western Nepal, Pyuthan forest district"},
    {"forest": "Rolpa Forest", "district": "Rolpa", "lat": 28.3500, "lng": 82.5500, "elevation": 1372, "province": "Lumbini", "location_details": "Western Nepal, Rolpa forest district"},
    {"forest": "Rukum Forest", "district": "Rukum", "lat": 28.7000, "lng": 82.6000, "elevation": 1524, "province": "Karnali", "location_details": "Western Nepal, Rukum forest district"},
    {"forest": "Salyan Forest", "district": "Salyan", "lat": 28.3833, "lng": 82.1667, "elevation": 1524, "province": "Karnali", "location_details": "Western Nepal, Salyan forest district"},
    {"forest": "Dang Forest", "district": "Dang", "lat": 28.1167, "lng": 82.3000, "elevation": 730, "province": "Lumbini", "location_details": "Western Nepal, Dang Valley forest"},
    {"forest": "Banke Forest", "district": "Banke", "lat": 28.0500, "lng": 81.6167, "elevation": 150, "province": "Lumbini", "location_details": "Western Nepal, forest region"},
    {"forest": "Bardiya Forest", "district": "Bardiya", "lat": 28.3000, "lng": 81.2000, "elevation": 150, "province": "Lumbini", "location_details": "Western Nepal, forest region"},
    {"forest": "Surkhet Forest", "district": "Surkhet", "lat": 28.6000, "lng": 81.6333, "elevation": 730, "province": "Karnali", "location_details": "Western Nepal, Surkhet forest district"},
    {"district": "Dailekh", "lat": 28.8500, "lng": 81.7000, "elevation": 1372},
    {"district": "Jajarkot", "lat": 28.7000, "lng": 82.2000, "elevation": 1372},
    {"district": "Dolpa", "lat": 29.1667, "lng": 82.9333, "elevation": 3658},
    {"district": "Jumla", "lat": 29.2833, "lng": 82.1833, "elevation": 2514},
    {"district": "Kalikot", "lat": 29.2333, "lng": 81.7833, "elevation": 2134},
    {"district": "Mugu", "lat": 29.5500, "lng": 82.0833, "elevation": 3658},
    {"district": "Humla", "lat": 29.7833, "lng": 81.8333, "elevation": 3658},
    {"district": "Bajura", "lat": 29.5000, "lng": 81.5000, "elevation": 2134},
    {"district": "Bajhang", "lat": 29.5500, "lng": 81.2000, "elevation": 2134},
    {"district": "Achham", "lat": 29.0500, "lng": 81.3000, "elevation": 1372},
    {"district": "Doti", "lat": 29.3000, "lng": 80.9500, "elevation": 2134},
    {"district": "Kailali", "lat": 28.6833, "lng": 80.6000, "elevation": 109},
    {"district": "Kanchanpur", "lat": 28.8333, "lng": 80.2000, "elevation": 109},
    {"district": "Dadeldhura", "lat": 29.3000, "lng": 80.6000, "elevation": 2134},
    {"district": "Baitadi", "lat": 29.5500, "lng": 80.4000, "elevation": 2134},
    {"district": "Darchula", "lat": 29.8500, "lng": 80.5500, "elevation": 2134},
    {"district": "Bhojpur", "lat": 27.1667, "lng": 87.0500, "elevation": 1740},
    {"district": "Dhankuta", "lat": 26.9833, "lng": 87.3333, "elevation": 1740},
    {"district": "Ilam", "lat": 26.9000, "lng": 87.9333, "elevation": 1740},
    {"district": "Jhapa", "lat": 26.6500, "lng": 87.9500, "elevation": 72},
    {"district": "Khotang", "lat": 27.2000, "lng": 86.7833, "elevation": 1740},
    {"district": "Morang", "lat": 26.6500, "lng": 87.2833, "elevation": 72},
    {"district": "Okhaldhunga", "lat": 27.3167, "lng": 86.5000, "elevation": 1740},
    {"district": "Panchthar", "lat": 27.1500, "lng": 87.7000, "elevation": 1740},
    {"district": "Sankhuwasabha", "lat": 27.3500, "lng": 87.2167, "elevation": 1740},
    {"district": "Solukhumbu", "lat": 27.7000, "lng": 86.7167, "elevation": 2743},
    {"district": "Sunsari", "lat": 26.6500, "lng": 87.2833, "elevation": 72},
    {"district": "Taplejung", "lat": 27.3500, "lng": 87.6667, "elevation": 1740},
    {"district": "Terhathum", "lat": 27.1000, "lng": 87.5000, "elevation": 1740},
    {"district": "Udayapur", "lat": 26.8000, "lng": 86.6667, "elevation": 415},
    {"district": "Saptari", "lat": 26.5333, "lng": 86.7500, "elevation": 78},
    {"district": "Siraha", "lat": 26.6500, "lng": 86.2000, "elevation": 78},
    {"district": "Dhanusa", "lat": 26.7833, "lng": 85.9667, "elevation": 78},
    {"district": "Mahottari", "lat": 26.7833, "lng": 85.7833, "elevation": 78},
    {"district": "Sarlahi", "lat": 26.7833, "lng": 85.5000, "elevation": 78},
    {"district": "Bara", "lat": 27.0000, "lng": 85.0000, "elevation": 92},
    {"district": "Parsa", "lat": 27.0000, "lng": 84.8667, "elevation": 92},
    {"district": "Rautahat", "lat": 27.0000, "lng": 85.2833, "elevation": 92},
    {"district": "Makwanpur", "lat": 27.4167, "lng": 85.0333, "elevation": 467},
    {"district": "Nuwakot", "lat": 27.9167, "lng": 85.1667, "elevation": 1000},
    {"district": "Ramechhap", "lat": 27.3333, "lng": 86.0833, "elevation": 1740},
    {"district": "Sindhuli", "lat": 27.2500, "lng": 85.9667, "elevation": 415},
    {"district": "Sindhupalchok", "lat": 27.9167, "lng": 85.5833, "elevation": 1740},
    {"district": "Dolakha", "lat": 27.6667, "lng": 86.0500, "elevation": 1740},
    {"district": "Rasuwa", "lat": 28.1167, "lng": 85.3167, "elevation": 1740},
    {"district": "Dhading", "lat": 28.0000, "lng": 84.9167, "elevation": 1000},
    {"district": "Kavrepalanchok", "lat": 27.5833, "lng": 85.5833, "elevation": 1740},
    {"district": "Myagdi", "lat": 28.3500, "lng": 83.7000, "elevation": 1372},
    {"district": "Parbat", "lat": 28.2000, "lng": 83.7000, "elevation": 1372},
    {"district": "Baglung", "lat": 28.2667, "lng": 83.6000, "elevation": 1372},
    {"district": "Mustang", "lat": 28.7000, "lng": 83.7000, "elevation": 2743},
    {"district": "Manang", "lat": 28.6667, "lng": 84.0167, "elevation": 3658},
    {"district": "Nawalpur", "lat": 27.8667, "lng": 84.2667, "elevation": 457},
]

def calculate_vpd(temperature, humidity):
    """Calculate Vapor Pressure Deficit"""
    try:
        es = 0.6108 * math.exp((17.27 * temperature) / (temperature + 237.3))
        ea = (humidity / 100) * es
        vpd = round(es - ea, 3)
        return vpd
    except:
        return 1.5  # Default value

def predict_fire_risk(lat, lng, elevation, temperature, humidity, wind_speed, precipitation):
    """Predict fire risk for a given location"""
    if model is None or scaler is None:
        return {"error": "Model not loaded"}
    
    try:
        # Calculate VPD
        vpd = calculate_vpd(temperature, humidity)
        
        # Prepare input data
        input_data = {
            'latitude': lat,
            'longitude': lng,
            'temperature': temperature,
            'humidity': humidity,
            'wind_speed': wind_speed,
            'precipitation': precipitation,
            'elevation': elevation,
            'vpd': vpd
        }
        
        # Create DataFrame
        X_input = pd.DataFrame([input_data], columns=features)
        
        # Scale the input
        X_scaled = scaler.transform(X_input)
        
        # Predict probability
        proba = model.predict_proba(X_scaled)[0][1]
        
        return {
            'probability': float(proba),
            'risk_level': 'High' if proba >= 0.60 else 'Moderate' if proba >= 0.30 else 'Low',
            'fire_flag': int(proba >= 0.5)
        }
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}

def get_real_weather_data(lat: float, lng: float) -> Dict[str, float]:
    """
    Get real-time weather data for a location using OpenWeatherMap API
    Returns: temperature, humidity, wind_speed, precipitation
    """
    try:
        # Use the API key from your frontend config
        API_KEY = "5341c37b13eb4a2994bda9c8d710103a"
        
        # Get current weather
        weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={API_KEY}&units=metric"
        response = requests.get(weather_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract weather data
            temperature = data["main"]["temp"]
            humidity = data["main"]["humidity"]
            wind_speed = data["wind"]["speed"]  # m/s, convert to km/h
            wind_speed_kmh = wind_speed * 3.6
            
            # Get precipitation (rain in last hour)
            precipitation = data.get("rain", {}).get("1h", 0)  # mm in last hour
            
            return {
                "temperature": temperature,
                "humidity": humidity,
                "wind_speed": wind_speed_kmh,
                "precipitation": precipitation
            }
        else:
            # Fallback to simulated data if API fails
            print(f"Weather API failed for {lat}, {lng}. Using simulated data.")
            return get_simulated_weather_data(lat, lng)
            
    except Exception as e:
        print(f"Error fetching weather data: {e}. Using simulated data.")
        return get_simulated_weather_data(lat, lng)

def get_simulated_weather_data(lat: float, lng: float) -> Dict[str, float]:
    """
    Fallback function for simulated weather data (current implementation)
    """
    # Find elevation from NEPAL_DISTRICTS
    elevation = 1000  # default
    for district in NEPAL_DISTRICTS:
        if abs(district["lat"] - lat) < 0.1 and abs(district["lng"] - lng) < 0.1:
            elevation = district["elevation"]
            break
    
    # Temperature based on elevation and dry season (more extreme for high risk)
    if elevation > 3000:
        temperature = 22 + np.random.normal(0, 6)  # Warmer in dry season
    elif elevation > 1500:
        temperature = 30 + np.random.normal(0, 8)  # Much warmer in dry season
    else:
        temperature = 38 + np.random.normal(0, 7)  # Very hot in Terai dry season
    
    # Humidity based on elevation and dry season (lower = higher fire risk)
    if elevation > 3000:
        humidity = 40 + np.random.normal(0, 15)  # Lower in dry season
    elif elevation > 1500:
        humidity = 30 + np.random.normal(0, 18)  # Much lower in dry season
    else:
        humidity = 25 + np.random.normal(0, 20)  # Very low in Terai dry season
    
    # Wind speed (higher = higher fire risk)
    wind_speed = 12 + np.random.normal(0, 8)  # Higher wind in dry season
    wind_speed = min(35, max(2, wind_speed))
    
    # Precipitation (very low in dry season)
    precipitation = np.random.exponential(0.5)  # Even lower precipitation
    
    return {
        "temperature": temperature,
        "humidity": humidity,
        "wind_speed": wind_speed,
        "precipitation": precipitation
    }

# Admin routes for managing fire reports
report_collection = db["fire_reports"]
alerts_collection = db["alerts"]

router = APIRouter(tags=["Admin Reports"])

@router.put("/reports/{report_id}/resolve")
async def mark_report_resolved(report_id: str, status: UpdateReportStatus):
    try:
        # First get the report to get reporter's email
        report = await report_collection.find_one({"_id": ObjectId(report_id)})
        if not report:
            raise HTTPException(404, detail="Report not found")
        
        # Update the report status
        result = await report_collection.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": {"resolved": status.resolved}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(404, detail="Report not found")
        
        # Send email notification to reporter
        if report.get("email"):
            try:
                sender = os.getenv("SMTP_SENDER")
                password = os.getenv("SMTP_PASSWORD")
                
                subject = "Fire Report Status Update"
                message = f"""
                Dear {report.get('name', 'User')},
                
                Your fire report for {report.get('location', 'the reported location')} has been marked as {'RESOLVED' if status.resolved else 'PENDING'}.
                
                Report Details:
                - Location: {report.get('location', 'N/A')}
                - Description: {report.get('description', 'N/A')}
                - Status: {'RESOLVED' if status.resolved else 'PENDING'}
                - Updated: {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}
                
                Thank you for reporting this incident.
                
                Best regards,
                Forest Fire Alert System
                """
                
                msg = MIMEText(message)
                msg['Subject'] = subject
                msg['From'] = sender
                msg['To'] = report['email']
                
                with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                    server.login(sender, password)
                    server.send_message(msg)
                    
            except Exception as email_error:
                print(f"Failed to send email notification: {email_error}")
        
        return {"message": "Report status updated successfully"}
    except Exception as e:
        raise HTTPException(500, detail=f"Error updating report: {str(e)}")

@router.get("/reports")
async def get_all_reports():
    try:
        reports = await report_collection.find().to_list(100)
        for report in reports:
            report["id"] = str(report["_id"])
            del report["_id"]
        return reports
    except Exception as e:
        raise HTTPException(500, detail=f"Error fetching reports: {str(e)}")

# Test endpoint to check model status
@router.get("/test-model")
async def test_model(user=Depends(admin_required)):
    """Test if the model is loaded correctly"""
    if model is None or scaler is None:
        return {"status": "error", "message": "Model not loaded"}
    return {"status": "success", "message": "Model loaded successfully"}

# Full Nepal Fire Risk Scan
@router.post("/scan-nepal")
async def scan_nepal_fire_risk(user=Depends(admin_required)):
    """Scan all Nepal districts for fire risk"""
    try:
        if model is None or scaler is None:
            raise HTTPException(500, detail="Fire prediction model not loaded")
        
        results = []
        
        # Get real-time weather data for each district
        for district in NEPAL_DISTRICTS:
            elevation = district["elevation"]
            
            # Get real weather data (with fallback to simulation)
            weather_data = get_real_weather_data(district["lat"], district["lng"])
            
            temperature = weather_data["temperature"]
            humidity = weather_data["humidity"]
            wind_speed = weather_data["wind_speed"]
            precipitation = weather_data["precipitation"]
            
            # Predict fire risk
            prediction = predict_fire_risk(
                district["lat"], district["lng"], elevation,
                temperature, humidity, wind_speed, precipitation
            )
            
            if "error" not in prediction:
                results.append({
                    "forest": district.get("forest", district.get("district", "Unknown Forest")),
                    "district": district.get("district", "Unknown District"),
                    "latitude": district["lat"],
                    "longitude": district["lng"],
                    "elevation": elevation,
                    "province": district.get("province", "Unknown"),
                    "location_details": district.get("location_details", "Nepal"),
                    "weather_data": {
                        "temperature": round(temperature, 1),
                        "humidity": round(humidity, 1),
                        "wind_speed": round(wind_speed, 1),
                        "precipitation": round(precipitation, 1)
                    },
                    "fire_risk": prediction["risk_level"],
                    "probability": prediction["probability"],
                    "fire_flag": prediction["fire_flag"]
                })
        
        # Sort by probability (highest risk first)
        results.sort(key=lambda x: x["probability"], reverse=True)
        
        # Separate high and moderate risk districts
        high_risk_districts = [
            district for district in results 
            if district["fire_risk"] == "High"
        ]
        
        moderate_risk_districts = [
            district for district in results 
            if district["fire_risk"] == "Moderate"
        ]
        
        # Combine: High risk first, then moderate, up to 10 total
        top_districts = high_risk_districts + moderate_risk_districts
        top_districts = top_districts[:10]
        
        return {
            "message": f"Scan completed. Found {len(top_districts)} high-risk districts.",
            "total_districts_scanned": len(results),
            "high_risk_districts": top_districts,
            "all_results": results
        }
        
    except Exception as e:
        raise HTTPException(500, detail=f"Scan failed: {str(e)}")

# Alert Management
@router.post("/alerts")
async def create_alert(alert_data: dict, user=Depends(admin_required)):
    """Create a new fire alert"""
    try:
        current_time = datetime.datetime.utcnow()
        alert_data["created_at"] = current_time
        
        # Set alert validity period (default 3 days, or use provided duration)
        duration_days = alert_data.get("duration_days", 3)
        alert_data["expires_at"] = current_time + datetime.timedelta(days=duration_days)
        
        alert_data["status"] = "active"
        
        result = await alerts_collection.insert_one(alert_data)
        
        # Create response without ObjectId
        response_data = alert_data.copy()
        response_data["id"] = str(result.inserted_id)
        
        return response_data
    except Exception as e:
        raise HTTPException(500, detail=f"Error creating alert: {str(e)}")

@router.get("/alerts")
async def get_all_alerts(user=Depends(admin_required)):
    """Get all fire alerts (Admin only)"""
    try:
        alerts = await alerts_collection.find().sort("created_at", -1).to_list(100)
        for alert in alerts:
            alert["id"] = str(alert["_id"])
            del alert["_id"]
        return alerts
    except Exception as e:
        raise HTTPException(500, detail=f"Error fetching alerts: {str(e)}")

@router.get("/public/alerts")
async def get_public_alerts():
    """Get active fire alerts (Public)"""
    try:
        alerts = await alerts_collection.find({"status": "active"}).sort("created_at", -1).to_list(100)
        for alert in alerts:
            alert["id"] = str(alert["_id"])
            del alert["_id"]
        return alerts
    except Exception as e:
        raise HTTPException(500, detail=f"Error fetching alerts: {str(e)}")

@router.put("/alerts/{alert_id}")
async def update_alert(alert_id: str, alert_data: dict, user=Depends(admin_required)):
    """Update an existing alert"""
    try:
        result = await alerts_collection.update_one(
            {"_id": ObjectId(alert_id)},
            {"$set": alert_data}
        )
        if result.modified_count == 0:
            raise HTTPException(404, detail="Alert not found")
        return {"message": "Alert updated successfully"}
    except Exception as e:
        raise HTTPException(500, detail=f"Error updating alert: {str(e)}")

@router.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: str, user=Depends(admin_required)):
    """Delete an alert"""
    try:
        result = await alerts_collection.delete_one({"_id": ObjectId(alert_id)})
        if result.deleted_count == 0:
            raise HTTPException(404, detail="Alert not found")
        return {"message": "Alert deleted successfully"}
    except Exception as e:
        raise HTTPException(500, detail=f"Error deleting alert: {str(e)}")

@router.post("/alerts/bulk")
async def create_bulk_alerts(alerts: List[dict], user=Depends(admin_required)):
    """Create multiple alerts at once"""
    try:
        print(f"Received {len(alerts)} alerts for bulk creation")
        current_time = datetime.datetime.utcnow()
        
        for alert in alerts:
            alert["created_at"] = current_time
            
            # Set alert validity period (default 3 days, or use provided duration)
            duration_days = alert.get("duration_days", 3)
            alert["expires_at"] = current_time + datetime.timedelta(days=duration_days)
            
            alert["status"] = "active"
        
        result = await alerts_collection.insert_many(alerts)
        created_alerts = []
        
        for i, alert in enumerate(alerts):
            alert["id"] = str(result.inserted_ids[i])
            created_alerts.append(alert)
        
        print(f"Successfully created {len(created_alerts)} alerts")
        return {
            "message": f"Created {len(created_alerts)} alerts",
            "created_alerts": created_alerts
        }
    except Exception as e:
        print(f"Bulk alert creation error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(500, detail=f"Error creating bulk alerts: {str(e)}")