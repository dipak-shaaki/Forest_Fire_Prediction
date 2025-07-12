from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class FireAlert(BaseModel):
    title: str
    message: str
    status: str = "active"
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class UpdateAlert(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None
