"""Add folder_id column to media table"""
from sqlalchemy import text
from ..database import engine

def run_migration():
    with engine.connect() as conn:
        conn.execute(text("""
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'media' AND column_name = 'folder_id'
                ) THEN
                    ALTER TABLE media ADD COLUMN folder_id VARCHAR REFERENCES folders(id);
                END IF;
            END $$;
        """))
        conn.commit()