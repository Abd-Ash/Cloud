import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import schemas, models, database
from ..utils.auth import get_current_user
from ..utils.storage import save_upload_file, move_file

router = APIRouter()

@router.post("/folders", response_model=schemas.Folder)
async def create_folder(
    folder: schemas.FolderCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # Verify parent folder exists and belongs to user if specified
    if folder.parent_folder_id:
        parent = db.query(models.Folder).filter(
            models.Folder.id == folder.parent_folder_id,
            models.Folder.user_id == current_user.id
        ).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent folder not found")
    
    db_folder = models.Folder(
        name=folder.name,
        user_id=current_user.id,
        parent_folder_id=folder.parent_folder_id
    )
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    return db_folder

@router.post("/upload", response_model=List[schemas.Media])
async def upload_files(
    files: List[UploadFile] = File(...),
    folder_id: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # Verify folder exists and belongs to user if specified
    if folder_id:
        folder = db.query(models.Folder).filter(
            models.Folder.id == folder_id,
            models.Folder.user_id == current_user.id
        ).first()
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
    
    media_items = []
    
    for file in files:
        content_type = file.content_type
        if content_type.startswith('image/'):
            media_type = 'image'
        elif content_type.startswith('video/'):
            media_type = 'video'
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        file_path = await save_upload_file(file, current_user.id, folder_id)
        
        media = models.Media(
            filename=file.filename,
            file_path=file_path,
            media_type=media_type,
            user_id=current_user.id,
            folder_id=folder_id
        )
        
        db.add(media)
        media_items.append(media)
    
    db.commit()
    for media in media_items:
        db.refresh(media)
    
    return media_items

@router.get("/folders", response_model=List[schemas.Folder])
def get_folders(
    parent_id: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Folder).filter(models.Folder.user_id == current_user.id)
    if parent_id:
        query = query.filter(models.Folder.parent_folder_id == parent_id)
    else:
        query = query.filter(models.Folder.parent_folder_id.is_(None))
    return query.all()

@router.get("/", response_model=List[schemas.Media])
def get_user_media(
    folder_id: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Media).filter(models.Media.user_id == current_user.id)
    if folder_id:
        query = query.filter(models.Media.folder_id == folder_id)
    return query.all()

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
    
    return FileResponse(media.file_path,  headers={
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache"
        })

@router.put("/{media_id}/move")
async def move_media(
    media_id: str,
    folder_id: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    media = db.query(models.Media).filter(
        models.Media.id == media_id,
        models.Media.user_id == current_user.id
    ).first()
    
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    if folder_id:
        folder = db.query(models.Folder).filter(
            models.Folder.id == folder_id,
            models.Folder.user_id == current_user.id
        ).first()
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
    
    new_path = move_file(media.file_path, current_user.id, folder_id)
    media.file_path = new_path
    media.folder_id = folder_id
    
    db.commit()
    db.refresh(media)
    
    return {"message": "Media moved successfully"}