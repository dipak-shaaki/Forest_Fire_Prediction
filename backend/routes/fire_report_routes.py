# routes/fire_report_routes.py
import datetime
from fastapi import APIRouter, HTTPException
from bson import ObjectId

from models.fire_report import FireReport
from database.mongo import db          # << import db
fire_reports = db["fire_reports"]      # collection handle

router = APIRouter(prefix="/reports", tags=["Fire Reports"])


def serialize(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

# ------------------------------------------------------------------
# CREATE report   POST /reports/
# ------------------------------------------------------------------
@router.post("/", response_model=dict)
async def create_fire_report(report: FireReport):
    # Convert fire_date (datetime.date) → datetime.datetime
    data = report.dict()
    if isinstance(data["fire_date"], datetime.date):
        data["fire_date"] = datetime.datetime.combine(
            data["fire_date"], datetime.time()
        )

    try:
        result = await fire_reports.insert_one(data)
        return {"message": "Fire report submitted", "id": str(result.inserted_id)}
    except Exception as e:
        print("🔥 Error inserting fire report:", e)
        raise HTTPException(status_code=500, detail="Failed to submit fire report")

# ------------------------------------------------------------------
# LIST reports   GET /reports/
# ------------------------------------------------------------------
@router.get("/", response_model=list)
async def list_reports():
    docs = await fire_reports.find().sort("fire_date", -1).to_list(length=100)
    return [serialize(d) for d in docs]

# ------------------------------------------------------------------
# GET one report   GET /reports/{report_id}
# ------------------------------------------------------------------
@router.get("/{report_id}", response_model=dict)
async def get_report(report_id: str):
    doc = await fire_reports.find_one({"_id": ObjectId(report_id)})
    if not doc:
        raise HTTPException(404, detail="Report not found")
    return serialize(doc)

# ------------------------------------------------------------------
# UPDATE status   PUT /reports/{report_id}?status=resolved
# ------------------------------------------------------------------
@router.put("/{report_id}", response_model=dict)
async def update_report_status(report_id: str, status: str):
    res = await fire_reports.update_one(
        {"_id": ObjectId(report_id)},
        {"$set": {"status": status}}
    )
    if res.modified_count == 0:
        raise HTTPException(400, detail="Nothing updated")
    updated = await fire_reports.find_one({"_id": ObjectId(report_id)})
    return serialize(updated)

# ------------------------------------------------------------------
# DELETE report   DELETE /reports/{report_id}
# ------------------------------------------------------------------
@router.delete("/{report_id}")
async def delete_report(report_id: str):
    res = await fire_reports.delete_one({"_id": ObjectId(report_id)})
    if res.deleted_count == 0:
        raise HTTPException(404, detail="Report not found")
    return {"message": "Report deleted"}
