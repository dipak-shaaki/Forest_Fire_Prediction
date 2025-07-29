import requests

API_KEY = "YOUR_OPENWEATHER_API_KEY"

def get_weather_for_location(lat, lon):
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    res = requests.get(url).json()

    return {
        "temperature": res["main"]["temp"],
        "humidity": res["main"]["humidity"],
        "wind_speed": res["wind"]["speed"],
        "precipitation": res.get("rain", {}).get("1h", 0)  # fallback
    }
