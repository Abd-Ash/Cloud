from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class MediaBase(BaseModel):
    filename: str
    media_type: str

class MediaCreate(MediaBase):
    file_path: str
    user_id: str

class Media(MediaBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True