from fastapi import APIRouter, HTTPException
from database.mongo import alerts_collection
from bson import ObjectId

router = APIRouter() 

def _serialize(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@router.get("/test/mongo/insert")
async def insert_sample():
    res = await alerts_collection.insert_one({
        "title": "Test Alert",
        "message": "Testing MongoDB insert route",
        "severity": "info"
    })
    return {"inserted_id": str(res.inserted_id)}

@router.get("/test/mongo/read")
async def read_all():
    docs = await alerts_collection.find().to_list(100)
    return [_serialize(d) for d in docs]

@router.get("/test/mongo/update/{doc_id}")
async def update(doc_id: str):
    upd = await alerts_collection.update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": {"title": "Updated title"}}
    )
    if upd.matched_count == 0:
        raise HTTPException(404, "Not found")
    doc = await alerts_collection.find_one({"_id": ObjectId(doc_id)})
    return _serialize(doc)

@router.get("/test/mongo/delete/{doc_id}")
async def delete(doc_id: str):
    res = await alerts_collection.delete_one({"_id": ObjectId(doc_id)})
    return {"deleted": res.deleted_count}
