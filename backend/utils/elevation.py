import requests

def get_elevation(lat, lon):
    url = f"https://api.opentopodata.org/v1/test-dataset?locations={lat},{lon}"
    res = requests.get(url).json()
    return res["results"][0]["elevation"]
