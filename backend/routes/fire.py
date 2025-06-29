
from fastapi import APIRouter
import requests
import csv
import io

router = APIRouter()

@router.get("/fires")
def get_fires():
    url = "https://firms.modaps.eosdis.nasa.gov/api/area/csv/?bbox=80,26,89,30"
    auth = ("your_earthdata_username", "your_earthdata_password")
    response = requests.get(url, auth=auth)
    if response.status_code != 200:
        return {"error": "Failed to fetch fire data"}
    
    csv_text = response.text
    reader = csv.DictReader(io.StringIO(csv_text))
    data = list(reader)
    return {"fires": data}
