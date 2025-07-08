
from fastapi import APIRouter
import requests
import csv
import io

from services.fire_stats import (
    get_confidence_level_counts,
    get_yearly_fire_counts,
    get_monthly_fire_counts,
  
)

router = APIRouter()

#  Live NASA FIRMS API (real-time fires)
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


#  Local CSV-based Historical Stats
@router.get("/fires/yearly")
def yearly_fire_counts():
    return get_yearly_fire_counts()

@router.get("/fires/monthly")
def monthly_fire_counts():
    return get_monthly_fire_counts()

@router.get("/fires/confidence")
def confidence():
    return get_confidence_level_counts()
