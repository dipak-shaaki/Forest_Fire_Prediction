from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class FireAlert(BaseModel):
    title: str
    message: str
    district: str
    latitude: float
    longitude: float
    risk_level: str  # "Low", "Moderate", "High", "Critical"
    probability: float
    weather_data: Dict[str, Any]
    precautions: str
    status: str = "active"  # "active", "expired", "cancelled"
    created_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_by: Optional[str] = None  # admin email

class CreateAlertRequest(BaseModel):
    title: str
    message: str
    district: str
    latitude: float
    longitude: float
    risk_level: str
    probability: float
    weather_data: Dict[str, Any]
    precautions: str
    expires_at: Optional[datetime] = None

class UpdateAlert(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None
    precautions: Optional[str] = None
    expires_at: Optional[datetime] = None

class BulkAlertRequest(BaseModel):
    alerts: list[CreateAlertRequest]
