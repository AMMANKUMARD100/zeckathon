from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    APP_NAME: str = "FinPilot AI — Compliant RIA Advisory Co-pilot"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./finpilot.db"
    
    # Document storage
    UPLOAD_DIR: str = "./uploads"
    SAMPLE_DATA_DIR: str = "./sample_data"
    
    # LLM Provider Configuration
    LLM_PROVIDER: str = "gemini" # options: gemini, openai, local_fallback
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    LLM_MODEL_NAME: str = "gemini-1.5-flash"
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173", "http://127.0.0.1:5173", "*"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
