import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import schemas, models, database
from ..utils.auth import get_current_user
from ..utils.storage import save_upload_file, move_file, ensure_file_permissions
from ..utils.logger import get_logger
from ..services.media_service import MediaService

router = APIRouter()
logger = get_logger(__name__)

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
    logger.info(f"////11111/////Attempting to retrieve media {folder_id}")

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
    logger.info(f"Attempting to retrieve media {media_id} for user {current_user.id}")
    
    try:
        media = MediaService.get_media_by_id(db, media_id, current_user)
        ensure_file_permissions(media.file_path)
        
        logger.info(f"Successfully serving media file: {media.file_path}")
        return FileResponse(
            media.file_path,
            media_type=f"{media.media_type}/{os.path.splitext(media.filename)[1][1:]}",
            filename=media.filename,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache",
                "Access-Control-Allow-Credentials": "true"
            }
        )
    except Exception as e:
        logger.error(f"Error retrieving media {media_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving media file")

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

@router.delete("/{media_id}")
async def delete_media(
    media_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    logger.info(f"Attempting to delete media {media_id} for user {current_user.id}")
    
    try:
        # Get media item
        media = db.query(models.Media).filter(
            models.Media.id == media_id,
            models.Media.user_id == current_user.id
        ).first()
        
        if not media:
            logger.warning(f"Media {media_id} not found for user {current_user.id}")
            raise HTTPException(status_code=404, detail="Media not found")
        
        # Delete file from filesystem
        try:
            if os.path.exists(media.file_path):
                os.remove(media.file_path)
        except Exception as e:
            logger.error(f"Error deleting file {media.file_path}: {str(e)}")
            # Continue with database deletion even if file deletion fails
        
        # Delete from database
        db.delete(media)
        db.commit()
        
        logger.info(f"Successfully deleted media {media_id}")
        return {"message": "Media deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting media {media_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting media file")
    
@router.delete("/folders/{folder_id}")
async def delete_folder(
    folder_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Delete a folder and all its contents"""
    logger.info(f"Attempting to delete folder {folder_id} for user {current_user.id}")
    
    try:
        # Get folder
        folder = db.query(models.Folder).filter(
            models.Folder.id == folder_id,
            models.Folder.user_id == current_user.id
        ).first()
        
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
        
        # Get all media in folder
        media_items = db.query(models.Media).filter(
            models.Media.folder_id == folder_id,
            models.Media.user_id == current_user.id
        ).all()
        
        # Delete media files
        for media in media_items:
            try:
                if os.path.exists(media.file_path):
                    os.remove(media.file_path)
            except Exception as e:
                logger.error(f"Error deleting file {media.file_path}: {str(e)}")
        
        # Delete folder contents from database
        for media in media_items:
            db.delete(media)
        
        # Delete folder
        db.delete(folder)
        db.commit()
        
        # Try to remove empty directory
        folder_path = os.path.join("../../uploads", current_user.id, folder_id)
        if os.path.exists(folder_path):
            try:
                os.rmdir(folder_path)
            except Exception as e:
                logger.error(f"Error removing folder directory: {str(e)}")
        
        return {"message": "Folder deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting folder {folder_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting folder")

    