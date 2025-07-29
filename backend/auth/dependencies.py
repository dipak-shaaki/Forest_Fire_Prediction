from fastapi import Depends, HTTPException
from fastapi_jwt_auth import AuthJWT

def get_current_user(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    user_email = Authorize.get_jwt_subject()
    raw_jwt = Authorize.get_raw_jwt()
    return {
        "email": user_email,
        "role": raw_jwt.get("role"),
        "is_approved": raw_jwt.get("is_approved", False)
    }

def admin_required(current_user=Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def approved_user_required(current_user=Depends(get_current_user)):
    if not current_user["is_approved"]:
        raise HTTPException(status_code=403, detail="User not approved yet")
    return current_user
