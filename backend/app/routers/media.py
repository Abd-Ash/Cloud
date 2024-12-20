import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, database
from ..utils.auth import get_current_user
from ..utils.storage import save_upload_file

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=List[schemas.Media])
async def upload_files(
    files: List[UploadFile] = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    media_items = []
    
    for file in files:
        # Determine media type
        content_type = file.content_type
        if content_type.startswith('image/'):
            media_type = 'image'
        elif content_type.startswith('video/'):
            media_type = 'video'
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        # Save file
        file_path = await save_upload_file(file, UPLOAD_DIR)
        
        # Create media record
        media = models.Media(
            filename=file.filename,
            file_path=file_path,
            media_type=media_type,
            user_id=current_user.id
        )
        
        db.add(media)
        media_items.append(media)
    
    db.commit()
    for media in media_items:
        db.refresh(media)
    
    return media_items

@router.get("/", response_model=List[schemas.Media])
def get_user_media(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Media).filter(models.Media.user_id == current_user.id).all()

@router.get("/{media_id}")
async def get_media_file(
    media_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    media = db.query(models.Media).filter(
        models.Media.id == media_id,
        models.Media.user_id == current_user.id
    ).first()
    
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    return FileResponse(media.file_path)