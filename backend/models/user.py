from pydantic import BaseModel, EmailStr, Field

class User(BaseModel):
    email: EmailStr
    username: str
    nid: str
    password: str
    role: str = "user"        # or "admin"
    is_approved: bool = False
    reset_token: str | None = None
    is_verified: bool = False
    verification_token: str | None = None
