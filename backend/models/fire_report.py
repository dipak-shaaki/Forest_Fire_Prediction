from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

class FireReport(BaseModel):
    name: str
    email: EmailStr
    province: str
    district: str
    location_details: str
    fire_date: date
    description: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    status: Optional[str] = "new"
