from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, media
from .database import create_database, create_tables, SessionLocal
from .utils.admin import create_admin_user

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database and tables
create_database()
create_tables()

# Create admin user
db = SessionLocal()
create_admin_user(db)
db.close()

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(media.router, prefix="/media", tags=["media"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5151)