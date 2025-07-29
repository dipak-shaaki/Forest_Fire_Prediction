from fastapi import APIRouter, HTTPException
from fastapi import Depends
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



router = APIRouter(prefix="/admin", tags=["Admin Alerts"])

def serialize_alert(alert):
    alert['id'] = str(alert['_id'])
    del alert['_id']
    return alert

def admin_required(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()   # raises 401 if no/invalid token



@router.post("/alerts")
async def create_alert(alert: FireAlert):
    new_alert = alert.dict()
    result = await alerts_collection.insert_one(new_alert)
    alert_from_db = await alerts_collection.find_one({"_id": result.inserted_id})
    return serialize_alert(alert_from_db)

@router.get("/alerts")
async def get_all_alerts():
    alerts = await alerts_collection.find().to_list(100)
    return [serialize_alert(alert) for alert in alerts]

@router.get("/alerts/{alert_id}")
async def get_alert(alert_id: str):
    alert = await alerts_collection.find_one({"_id": ObjectId(alert_id)})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return serialize_alert(alert)

@router.put("/alerts/{alert_id}")
async def update_alert(alert_id: str, update: UpdateAlert):
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    result = await alerts_collection.update_one({"_id": ObjectId(alert_id)}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="No update made.")
    updated = await alerts_collection.find_one({"_id": ObjectId(alert_id)})
    return serialize_alert(updated)

@router.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: str):
    result = await alerts_collection.delete_one({"_id": ObjectId(alert_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert deleted"}


class EmailReply(BaseModel):
    to_email: EmailStr
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


# Admin routes for managing fire reports
report_collection = db["fire_reports"]
router = APIRouter(tags=["Admin Reports"])

@router.put("/reports/{report_id}/resolve")
async def mark_report_resolved(report_id: str, status: UpdateReportStatus):
    result = await report_collection.update_one(
        {"_id": ObjectId(report_id)},
        {"$set": {"resolved": status.resolved}}
    )
    if result.modified_count == 0:
        raise HTTPException(404, detail="Report not found or unchanged.")
    return {"message": "Report status updated"}

@router.post("/admin/scan-nepal")
def full_scan(user=Depends(admin_required)):
    results = scan_nepal_and_generate_alerts()
    return { "message": "Scan completed", "alerts": results }

@router.post("/admin/approve-user/{email}")
async def approve_user(email: str, admin = Depends(admin_required)):
    res = await db["users"].update_one({"email": email}, {"$set": {"is_approved": True}})
    if res.modified_count == 0:
        return {"message": "No user found or already approved"}
    return {"message": f" {email} approved"}

# Endpoint: Run full Nepal scan and return high-risk districts (admin only)
@router.post("/scan-nepal", dependencies=[Depends(admin_required)])
async def scan_nepal():
    high_risk = scan_nepal_only()
    return {"high_risk_districts": high_risk}

# Endpoint: Create alerts for selected districts (admin only)
from models.alert_model import FireAlert

class DistrictAlertRequest(BaseModel):
    district: str
    location: dict
    risk: str
    details: dict
    reason: str

@router.post("/alerts/bulk", dependencies=[Depends(admin_required)])
async def create_bulk_alerts(alerts: list[DistrictAlertRequest]):
    created = []
    for alert in alerts:
        alert_doc = FireAlert(
            title=f"🔥 Fire Alert: {alert.district}",
            message=alert.reason,
            status="active"
        ).dict()
        alert_doc["district"] = alert.district
        alert_doc["location"] = alert.location
        alert_doc["risk"] = alert.risk
        alert_doc["details"] = alert.details
        result = await alerts_collection.insert_one(alert_doc)
        alert_from_db = await alerts_collection.find_one({"_id": result.inserted_id})
        created.append(serialize_alert(alert_from_db))
    return {"created_alerts": created}