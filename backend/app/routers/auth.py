from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import schemas, models, database
from ..utils import auth

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/token", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/reset-password-request")
async def request_password_reset(
    email: str,
    db: Session = Depends(database.get_db)
):
    """Request password reset"""
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        # Return success even if user doesn't exist to prevent email enumeration
        return {"message": "If your email is registered, you will receive a password reset link"}
    
    # Generate reset token
    token = create_access_token({"sub": email}, expires_delta=timedelta(hours=1))
    
    # Send reset email
    try:
        send_reset_email(email, token)
        return {"message": "Password reset email sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send reset email")

@router.post("/reset-password/{token}")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(database.get_db)
):
    """Reset password using token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token")
            
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        user.hashed_password = get_password_hash(new_password)
        db.commit()
        
        return {"message": "Password reset successfully"}
        
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")