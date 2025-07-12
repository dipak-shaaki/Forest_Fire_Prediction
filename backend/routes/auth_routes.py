from fastapi import APIRouter, Depends, HTTPException
from fastapi import status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.hash import bcrypt
from database.mongo import db  # your mongo.py should expose db or admins_collection
from fastapi_jwt_auth import AuthJWT
from models.admin import AdminLogin
from bson import ObjectId
import datetime, os

router = APIRouter(tags=["Auth"])

admins_collection = db['admins']   # one‑time collection for admin user(s)

# Utility to serialize _id
def serial_admin(doc):
    doc["id"] = str(doc["_id"]); del doc["_id"]; return doc

@router.post("/admin/signup", status_code=status.HTTP_201_CREATED)
async def admin_signup(payload: AdminLogin):
    # one‑time setup: allow only one admin
    if await admins_collection.count_documents({}) >= 1:
        raise HTTPException(400, "Admin already exists")
    hashed_pw = bcrypt.hash(payload.password)
    admin = {"email": payload.email, "password": hashed_pw, "created": datetime.datetime.utcnow()}
    await admins_collection.insert_one(admin)
    return {"msg": "Admin created"}

@router.post("/admin/login", tags=["Auth"])
async def admin_login(payload: AdminLogin, Authorize: AuthJWT = Depends()):
    admin = await admins_collection.find_one({"email": payload.email})
    if not admin or not bcrypt.verify(payload.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = Authorize.create_access_token(subject=str(admin["_id"]))
    return {"access_token": token, "token_type": "bearer"}