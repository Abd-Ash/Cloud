from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

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

class FolderBase(BaseModel):
    name: str
    parent_folder_id: Optional[str] = None

class FolderCreate(FolderBase):
    pass

class Folder(FolderBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class MediaBase(BaseModel):
    filename: str
    media_type: str
    folder_id: Optional[str] = None

class MediaCreate(MediaBase):
    file_path: str
    user_id: str

class Media(MediaBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True