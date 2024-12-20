from sqlalchemy.orm import Session
from .. import models
from .auth import get_password_hash

def create_admin_user(db: Session):
    # Check if admin already exists
    admin = db.query(models.User).filter(models.User.email == "admin@exemple.com").first()
    if not admin:
        # Create admin user
        admin = models.User(
            email="admin@exemple.com",
            hashed_password=get_password_hash("admin")
        )
        db.add(admin)
        db.commit()
        print("Admin user created successfully")