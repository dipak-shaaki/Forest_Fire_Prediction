from pydantic import BaseModel, EmailStr

class UserMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ReplyMessage(BaseModel):
    reply: str

