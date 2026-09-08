from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine
from app.models.schema import Base
from app.routers import auth, tenders, applications, clarifications, stats

# Create tables if not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="RFQ Applicant Submission Portal REST API for PostgreSQL RFQ_DB",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for static file access
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(tenders.router)
app.include_router(applications.router)
app.include_router(clarifications.router)
app.include_router(stats.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to RFQ Applicant Submission Portal API",
        "docs_url": "/docs",
        "status": "online"
    }
