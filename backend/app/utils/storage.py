import os
import uuid
import shutil
from fastapi import UploadFile
from typing import Optional

def ensure_user_directory(user_id: str, folder_id: Optional[str] = None) -> str:
    """Create and return the path to user's upload directory"""
    base_path = os.path.join("uploads", user_id)
    if folder_id:
        base_path = os.path.join(base_path, folder_id)
    
    os.makedirs(base_path, exist_ok=True)
    return base_path

async def save_upload_file(
    upload_file: UploadFile,
    user_id: str,
    folder_id: Optional[str] = None
) -> str:
    """Save an upload file to the user's directory and return the file path."""
    upload_dir = ensure_user_directory(user_id, folder_id)
    
    # Create a unique filename
    file_extension = os.path.splitext(upload_file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save the file
    content = await upload_file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    return file_path

def move_file(file_path: str, user_id: str, new_folder_id: Optional[str]) -> str:
    """Move a file to a new folder and return the new path"""
    new_dir = ensure_user_directory(user_id, new_folder_id)
    filename = os.path.basename(file_path)
    new_path = os.path.join(new_dir, filename)
    
    shutil.move(file_path, new_path)
    return new_path