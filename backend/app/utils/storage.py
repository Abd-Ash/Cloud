import os
import uuid
import shutil
import stat
from fastapi import UploadFile
from typing import Optional

def ensure_user_directory(user_id: str, folder_id: Optional[str] = None) -> str:
    """Create and return the path to user's upload directory"""
    base_path = os.path.join("../../uploads", user_id)
    if folder_id:
        base_path = os.path.join(base_path, folder_id)
    
    os.makedirs(base_path, exist_ok=True)
    # Ensure directory permissions (755 = rwxr-xr-x)
    os.chmod(base_path, stat.S_IRWXU | stat.S_IRGRP | stat.S_IXGRP | stat.S_IROTH | stat.S_IXOTH)
    return base_path

def ensure_file_permissions(file_path: str):
    """Ensure proper file permissions for web server access"""
    try:
        # Set file permissions to 644 (rw-r--r--)
        os.chmod(file_path, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IROTH)
    except Exception as e:
        raise Exception(f"Failed to set file permissions: {str(e)}")

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
    
    # Set proper file permissions
    ensure_file_permissions(file_path)
    
    return file_path

def move_file(file_path: str, user_id: str, new_folder_id: Optional[str]) -> str:
    """Move a file to a new folder and return the new path"""
    new_dir = ensure_user_directory(user_id, new_folder_id)
    filename = os.path.basename(file_path)
    new_path = os.path.join(new_dir, filename)
    
    shutil.move(file_path, new_path)
    ensure_file_permissions(new_path)
    return new_path