from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RFQ Applicant Submission Portal"
    DATABASE_URL: str = "postgresql+psycopg2://postgres:Admin%40123@localhost:5432/RFQ_DB"
    SECRET_KEY: str = "rfq_portal_super_secret_jwt_key_amaravati_infrastructure_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    UPLOAD_DIR: Path = Path(__file__).resolve().parent.parent.parent / "uploads"

    class Config:
        case_sensitive = True

settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
