from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.openapi.utils import get_openapi
from app.core.config import settings
from app.core.database import engine
from app.models.schema import Base
from app.routers import auth, tenders, applications, clarifications, stats

# Create tables if not exist
Base.metadata.create_all(bind=engine)

tags_metadata = [
    {
        "name": "Authentication",
        "description": "Applicant OTP request/verification, registration, CE login, profile retrieval, and document attachments.",
    },
    {
        "name": "Tenders",
        "description": "Tender lifecycle management, multi-job items creation/deletion, status updates, and RFQ document uploads.",
    },
    {
        "name": "Applications",
        "description": "Quotation submission (Annexures II & III, custom amounts, multi-job selections, EMD), document downloads (ZIP), status workflow, and review.",
    },
    {
        "name": "Clarifications",
        "description": "Applicant queries on published tenders and CE responses.",
    },
    {
        "name": "Dashboard Statistics",
        "description": "Metrics and analytics for Chief Engineer and Applicant dashboards.",
    },
]

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
# RFQ Applicant Submission & Quotation Portal API
### Government of Andhra Pradesh | Amaravati Growth & Infrastructure Corporation (AGIC)

Welcome to the interactive REST API documentation for the **RFQ Portal**.
This interface allows you to inspect, test, and execute all backend endpoints directly against the database.

---
### Quick Authentication Credentials:
- **Chief Engineer (CE)**: Mobile `9876543210` / Password `ce123`
- **Applicant 1**: Mobile `9111222333` / Password `app123`
- **Applicant 2**: Mobile `9222333444` / Password `app123`
""",
    version="2.0.0",
    openapi_tags=tags_metadata,
    swagger_ui_parameters={"persistAuthorization": True, "displayRequestDuration": True}
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

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
        tags=tags_metadata
    )
    # Ensure Bearer JWT security scheme is available
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}
    if "securitySchemes" not in openapi_schema["components"]:
        openapi_schema["components"]["securitySchemes"] = {}
    
    openapi_schema["components"]["securitySchemes"]["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Enter your JWT token directly (e.g. obtained from /api/auth/ce/login or /api/auth/applicant/login)"
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get("/")
def root():
    return {
        "message": "Welcome to RFQ Applicant Submission Portal API",
        "swagger_docs": "/docs",
        "redoc_docs": "/redoc",
        "scalar_docs": "/scalar",
        "openapi_json": "/openapi.json",
        "status": "online",
        "version": "2.0.0"
    }

@app.get("/scalar", response_class=HTMLResponse, include_in_schema=False)
def scalar_docs():
    return """
    <!doctype html>
    <html lang="en">
      <head>
        <title>RFQ Portal API Reference</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
      </head>
      <body>
        <script
          id="api-reference"
          data-url="/openapi.json"
          data-configuration='{"theme":"purple","layout":"modern"}'
        ></script>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>
    """

