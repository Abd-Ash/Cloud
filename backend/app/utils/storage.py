import os
import uuid
from fastapi import UploadFile

async def save_upload_file(upload_file: UploadFile, upload_dir: str) -> str:
    """Save an upload file to disk and return the file path."""
    content = await upload_file.read()
    
    # Create a unique filename
    file_extension = os.path.splitext(upload_file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save the file
    with open(file_path, "wb") as f:
        f.write(content)
    
    return file_path