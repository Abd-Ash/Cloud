from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_USER = "admin-ash"
DB_PASSWORD = "admin-ash"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = os.getenv("DB_NAME", "Cloud")

# Connection URLs
#POSTGRES_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}"
#DATABASE_URL = f"{POSTGRES_URL}/{DB_NAME}"

# Connection URL for initial connection to postgres database
POSTGRES_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/postgres"

# Connection URL for the application database
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def create_database():
    """Create database if it doesn't exist"""
    engine = create_engine(POSTGRES_URL)
    conn = engine.connect()
    conn.execute(text("commit"))  # Close any open transactions
    
    # Check if database exists
    result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'"))
    if not result.scalar():
        conn.execute(text(f"CREATE DATABASE \"{DB_NAME}\""))
        print(f"Database {DB_NAME} created successfully")
    
    conn.close()
    engine.dispose()

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)