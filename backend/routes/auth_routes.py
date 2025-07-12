from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.hash import bcrypt
from fastapi_jwt_auth import AuthJWT
from database.mongo import db
from models.admin import AdminLogin
import datetime
from bson import ObjectId

router = APIRouter(tags=["Auth"])

admins_collection = db["admins"]  # collection for admin user(s)


# ---------- helper ----------
def serialize_admin(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


# ---------- one‑time signup (only first run) ----------
@router.post("/admin/signup", status_code=status.HTTP_201_CREATED)
async def admin_signup(payload: AdminLogin):
    if await admins_collection.count_documents({}) >= 1:
        raise HTTPException(400, "Admin already exists")

    hashed_pw = bcrypt.hash(payload.password)
    admin = {
        "email": payload.email,
        "password": hashed_pw,
        "created": datetime.datetime.utcnow(),
    }
    await admins_collection.insert_one(admin)
    return {"msg": "Admin created"}


# ---------- login ----------
@router.post("/admin/login")
async def admin_login(
    form: OAuth2PasswordRequestForm = Depends(), Authorize: AuthJWT = Depends()
):
    # OAuth2PasswordRequestForm -> field names are `username` and `password`
    email = form.username
    password = form.password

    admin = await admins_collection.find_one({"email": email})
    if not admin or not bcrypt.verify(password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = Authorize.create_access_token(subject=str(admin["_id"]))
    return {"access_token": access_token, "token_type": "bearer"}
