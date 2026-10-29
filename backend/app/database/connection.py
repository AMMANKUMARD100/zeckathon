import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from ..configuration.settings import settings

try:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
except PermissionError:
    pass
try:
    os.makedirs(settings.SAMPLE_DATA_DIR, exist_ok=True)
except PermissionError:
    pass

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
