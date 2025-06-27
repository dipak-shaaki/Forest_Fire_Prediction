import requests
import math
from datetime import datetime

def enrich_point(lat, lon, date_str):
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d").date()

        # WEATHER from Open-Meteo Forecast API
        url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&daily=temperature_2m_max,precipitation_sum,windspeed_10m_max,relative_humidity_2m_max"
            f"&timezone=auto&start_date={date}&end_date={date}"
        )

        r = requests.get(url)
        r.raise_for_status()
        data = r.json()

        if not data.get("daily") or not data["daily"]["temperature_2m_max"]:
            print(f"Enrichment failed: No weather data for {date_str}")
            return None

        temp = data["daily"]["temperature_2m_max"][0]
        humidity = data["daily"]["relative_humidity_2m_max"][0]
        wind = data["daily"]["windspeed_10m_max"][0]
        precip = data["daily"]["precipitation_sum"][0]

        # ELEVATION from OpenTopodata
        elev = fetch_elevation(lat, lon)

        # VPD Calculation
        es = 0.6108 * math.exp((17.27 * temp) / (temp + 237.3))
        ea = es * (humidity / 100.0)
        vpd = round(es - ea, 3)

        return {
            "latitude": lat,
            "longitude": lon,
            "temperature": temp,
            "humidity": humidity,
            "wind_speed": wind,
            "precipitation": precip,
            "elevation": elev,
            "vpd": vpd
        }

    except Exception as e:
        print(f"Enrichment failed: {e}")
        return None

def fetch_elevation(lat, lon):
    try:
        url = f"https://api.opentopodata.org/v1/srtm90m?locations={lat},{lon}"
        r = requests.get(url)
        r.raise_for_status()
        return r.json()["results"][0]["elevation"]
    except Exception as e:
        print(f"Elevation fetch failed: {e}")
        return None
