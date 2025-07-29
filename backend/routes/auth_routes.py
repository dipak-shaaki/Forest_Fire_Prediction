
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.hash import bcrypt
from fastapi_jwt_auth import AuthJWT
from database.mongo import db
from models.admin import AdminLogin
from models.user import User
from pydantic import BaseModel, EmailStr
from bson import ObjectId
import datetime, secrets
from utils.hashing import hash_password, verify_password
from utils.jwt import create_jwt
from email.mime.text import MIMEText
import os
import smtplib

router = APIRouter(tags=["Auth"])
admins_collection = db["admins"]

class UserRegisterRequest(BaseModel):
    email: EmailStr
    username: str
    nid: str
    password: str

class UserLoginRequest(BaseModel):
    identifier: str  # email or username
    password: str

class OTPVerificationRequest(BaseModel):
    email: str
    otp: str

class ResendOTPRequest(BaseModel):
    email: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordOTPRequest(BaseModel):
    email: str
    otp: str
    new_password: str

# Admin signup (only one allowed)
@router.post("/admin/signup")
async def admin_signup(payload: AdminLogin):
    if await admins_collection.count_documents({}) >= 1:
        raise HTTPException(400, "Admin already exists")
    hashed_pw = bcrypt.hash(payload.password)
    admin = {"email": payload.email, "password": hashed_pw, "created": datetime.datetime.utcnow()}
    await admins_collection.insert_one(admin)
    return {"msg": "Admin created"}

# Debug endpoint to check user status (remove in production)
@router.get("/debug/user/{email}")
async def debug_user_status(email: str):
    user = await db["users"].find_one({"email": email})
    if not user:
        return {"exists": False, "message": "User not found"}
    
    return {
        "exists": True,
        "email": user["email"],
        "username": user["username"],
        "role": user["role"],
        "is_verified": user.get("is_verified", False),
        "is_approved": user.get("is_approved", False),
        "has_verification_token": "verification_token" in user and user["verification_token"] is not None
    }

# User Registration with OTP
@router.post("/register")
async def register_user(user: UserRegisterRequest):
    # Check for duplicate email (case-insensitive)
    existing_user = await db["users"].find_one({"email": {"$regex": f"^{user.email}$", "$options": "i"}})
    if existing_user:
        raise HTTPException(400, "An account with this email address already exists. Please use a different email or try logging in.")
    
    # Check for duplicate username
    if await db["users"].find_one({"username": user.username}):
        raise HTTPException(400, "Username already taken. Please choose a different username.")
    
    # Check for duplicate NID
    if await db["users"].find_one({"nid": user.nid}):
        raise HTTPException(400, "An account with this NID already exists.")
    
    # Generate 6-digit OTP
    otp = str(secrets.randbelow(900000) + 100000)  # 6-digit number
    
    user_dict = {
        "email": user.email.lower(),  # Store email in lowercase
        "username": user.username,
        "nid": user.nid,
        "password": hash_password(user.password),
        "role": "user",
        "is_approved": False,
        "reset_token": None,
        "is_verified": False,
        "otp": otp,
        "otp_created_at": datetime.datetime.utcnow(),
        "created_at": datetime.datetime.utcnow()
    }
    await db["users"].insert_one(user_dict)
    
    # Send OTP email
    sender = os.getenv("SMTP_SENDER")
    password = os.getenv("SMTP_PASSWORD")
    subject = "Email Verification OTP - Nepal WildFire Watch"
    message = f"Hello {user.username},\n\nYour email verification OTP is: {otp}\n\nEnter this OTP to verify your email address.\n\nIf you did not register, ignore this email.\n\nThis OTP will expire in 10 minutes."
    try:
        msg = MIMEText(message)
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = user.email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.send_message(msg)
    except Exception as e:
        print("Failed to send OTP email:", e)
        # Remove the user if email fails
        await db["users"].delete_one({"email": user.email.lower()})
        raise HTTPException(500, "Failed to send verification email. Please try again.")
    
    return {"message": "Registration successful. Please check your email for the OTP to verify your account.", "email": user.email}

# OTP Verification Endpoint
@router.post("/verify-otp")
async def verify_otp(payload: OTPVerificationRequest):
    user = await db["users"].find_one({"email": payload.email.lower()})
    if not user:
        raise HTTPException(400, "User not found.")
    
    if user.get("is_verified", False):
        raise HTTPException(400, "Email is already verified.")
    
    if user.get("otp") != payload.otp:
        raise HTTPException(400, "Invalid OTP. Please check your email and try again.")
    
    # Check if OTP is expired (10 minutes)
    otp_created_at = user.get("otp_created_at")
    if otp_created_at:
        time_diff = datetime.datetime.utcnow() - otp_created_at
        if time_diff.total_seconds() > 600:  # 10 minutes
            raise HTTPException(400, "OTP has expired. Please register again to get a new OTP.")
    
    # Mark email as verified and remove OTP
    await db["users"].update_one(
        {"email": payload.email.lower()}, 
        {"$set": {"is_verified": True}, "$unset": {"otp": "", "otp_created_at": ""}}
    )
    
    return {"message": "Email verified successfully! You can now log in."}

# Resend OTP Endpoint
@router.post("/resend-otp")
async def resend_otp(payload: ResendOTPRequest):
    user = await db["users"].find_one({"email": payload.email.lower()})
    if not user:
        raise HTTPException(400, "User not found.")
    
    if user.get("is_verified", False):
        raise HTTPException(400, "Email is already verified.")
    
    # Generate new OTP
    otp = str(secrets.randbelow(900000) + 100000)
    
    # Update user with new OTP
    await db["users"].update_one(
        {"email": payload.email.lower()},
        {"$set": {"otp": otp, "otp_created_at": datetime.datetime.utcnow()}}
    )
    
    # Send new OTP email
    sender = os.getenv("SMTP_SENDER")
    password = os.getenv("SMTP_PASSWORD")
    subject = "New Email Verification OTP - Nepal WildFire Watch"
    message = f"Hello {user['username']},\n\nYour new email verification OTP is: {otp}\n\nEnter this OTP to verify your email address.\n\nThis OTP will expire in 10 minutes."
    try:
        msg = MIMEText(message)
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = user["email"]
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.send_message(msg)
    except Exception as e:
        print("Failed to send OTP email:", e)
        raise HTTPException(500, "Failed to send OTP. Please try again.")
    
    return {"message": "New OTP sent to your email."}

# User Login
@router.post("/login")
async def login_user(data: UserLoginRequest, Authorize: AuthJWT = Depends()):
    try:
        # Allow login with either email or username
        user = await db["users"].find_one({"$or": [
            {"email": data.identifier},
            {"username": data.identifier}
        ]})
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if not verify_password(data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Check if user is verified (only for normal users, not admin)
        if user["role"] == "user" and not user.get("is_verified", False):
            raise HTTPException(status_code=403, detail="Please verify your email before logging in. Check your email for the verification link.")
        
        # Create JWT token
        token = Authorize.create_access_token(subject=user["email"], user_claims={
            "role": user["role"],
            "is_approved": True  # Always set to True since we don't need admin approval
        })
        
        return {"access_token": token, "role": user["role"]}
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during login")

# Admin Login
@router.post("/admin/login")
async def admin_login(form: OAuth2PasswordRequestForm = Depends(), Authorize: AuthJWT = Depends()):
    email = form.username
    password = form.password
    admin = await admins_collection.find_one({"email": email})
    if not admin or not bcrypt.verify(password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = Authorize.create_access_token(subject=email, user_claims={"role": "admin", "is_approved": True})
    return {"access_token": token}

# Forgot Password with OTP
@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    user = await db["users"].find_one({"email": payload.email.lower()})
    if not user:
        # Always return generic message for security
        return {"message": "If your email is registered, a password reset OTP will be sent."}
    
    # Generate 6-digit OTP for password reset
    reset_otp = str(secrets.randbelow(900000) + 100000)
    
    # Update user with reset OTP
    await db["users"].update_one(
        {"email": payload.email.lower()},
        {"$set": {"reset_otp": reset_otp, "reset_otp_created_at": datetime.datetime.utcnow()}}
    )
    
    # Send reset OTP email
    sender = os.getenv("SMTP_SENDER")
    password = os.getenv("SMTP_PASSWORD")
    subject = "Password Reset OTP - Nepal WildFire Watch"
    message = f"Hello {user['username']},\n\nYour password reset OTP is: {reset_otp}\n\nEnter this OTP to reset your password.\n\nIf you did not request this, ignore this email.\n\nThis OTP will expire in 10 minutes."
    try:
        msg = MIMEText(message)
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = user["email"]
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.send_message(msg)
    except Exception as e:
        print("Failed to send password reset OTP:", e)
        # Remove the reset OTP if email fails
        await db["users"].update_one(
            {"email": payload.email.lower()},
            {"$unset": {"reset_otp": "", "reset_otp_created_at": ""}}
        )
        raise HTTPException(500, "Failed to send password reset OTP. Please try again.")
    
    return {"message": "If your email is registered, a password reset OTP will be sent."}

# Reset Password with OTP
@router.post("/reset-password")
async def reset_password(payload: ResetPasswordOTPRequest):
    user = await db["users"].find_one({"email": payload.email.lower()})
    if not user:
        raise HTTPException(400, "User not found.")
    
    if user.get("reset_otp") != payload.otp:
        raise HTTPException(400, "Invalid OTP. Please check your email and try again.")
    
    # Check if OTP is expired (10 minutes)
    reset_otp_created_at = user.get("reset_otp_created_at")
    if reset_otp_created_at:
        time_diff = datetime.datetime.utcnow() - reset_otp_created_at
        if time_diff.total_seconds() > 600:  # 10 minutes
            raise HTTPException(400, "OTP has expired. Please request a new password reset.")
    
    # Hash new password and update user
    hashed_password = hash_password(payload.new_password)
    await db["users"].update_one(
        {"email": payload.email.lower()},
        {"$set": {"password": hashed_password}, "$unset": {"reset_otp": "", "reset_otp_created_at": ""}}
    )
    
    return {"message": "Password reset successful! You can now log in with your new password."}