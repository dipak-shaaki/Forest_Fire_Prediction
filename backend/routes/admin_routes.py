from fastapi import APIRouter, HTTPException
from fastapi import Depends
from fastapi_jwt_auth import AuthJWT

from models.alert_model import FireAlert, UpdateAlert
from database.mongo import alerts_collection
from bson import ObjectId

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
