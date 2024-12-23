from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import Optional
import os
from ..models import Media, User
from ..utils.logger import get_logger

logger = get_logger(__name__)

class MediaService:
    @staticmethod
    def get_media_by_id(db: Session, media_id: str, user: User) -> Optional[Media]:
        """Get media file by ID with user verification"""
        media = db.query(Media).filter(
            Media.id == media_id,
            Media.user_id == user.id
        ).first()
        
        if not media:
            logger.warning(f"Media {media_id} not found for user {user.id}")
            raise HTTPException(status_code=404, detail="Media not found")
            
        if not os.path.exists(media.file_path):
            logger.error(f"File not found at path: {media.file_path}")
            raise HTTPException(status_code=404, detail="File not found on server")
            
        return media