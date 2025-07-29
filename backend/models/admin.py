from passlib.context import CryptContext
from database.mongo import db
from pydantic import BaseModel, EmailStr

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def ensure_admin_exists():
    admin_email = "admin@gmail.com"
    existing = await db["users"].find_one({"email": admin_email})

    if not existing:
        hashed = pwd_context.hash("example")  # Choose a strong password
        await db["users"].insert_one({
            "email": admin_email,
            "password": hashed,
            "role": "admin",
            "is_approved": True,
            "reset_token": None
        })
        print("Admin user created")
    else:
        print("Admin already exists")

class AdminLogin(BaseModel):
    email: EmailStr
    password: str
