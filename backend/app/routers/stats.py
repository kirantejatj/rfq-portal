from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import require_ce, require_applicant
from app.models.schema import RFQTender, Application, Applicant, EMDPayment

router = APIRouter(prefix="/api/stats", tags=["Dashboard Statistics"])

@router.get("/ce")
def get_ce_stats(
    current_user: dict = Depends(require_ce),
    db: Session = Depends(get_db)
):
    now = datetime.now()
    total_tenders = db.query(RFQTender).count()
    active_tenders = db.query(RFQTender).filter(
        RFQTender.status == "PUBLISHED",
        RFQTender.quotation_from_date <= now,
        RFQTender.quotation_to_date >= now
    ).count()
    
    total_applications = db.query(Application).count()
    under_review = db.query(Application).filter(Application.status == "UNDER_REVIEW").count()
    accepted = db.query(Application).filter(Application.status == "ACCEPTED").count()
    rejected = db.query(Application).filter(Application.status == "REJECTED").count()
    total_applicants = db.query(Applicant).count()
    
    total_quoted = db.query(func.sum(Application.quoted_amount)).scalar() or 0.0
    total_emd = db.query(func.sum(EMDPayment.amount)).scalar() or 0.0

    return {
        "total_tenders": total_tenders,
        "active_tenders": active_tenders,
        "total_applications": total_applications,
        "under_review_applications": under_review,
        "accepted_applications": accepted,
        "rejected_applications": rejected,
        "total_registered_applicants": total_applicants,
        "total_quoted_amount": float(total_quoted),
        "total_emd_collected": float(total_emd)
    }

@router.get("/applicant")
def get_applicant_stats(
    current_user: dict = Depends(require_applicant),
    db: Session = Depends(get_db)
):
    applicant_id = current_user["id"]
    my_applications = db.query(Application).filter(Application.applicant_id == applicant_id).count()
    submitted = db.query(Application).filter(Application.applicant_id == applicant_id, Application.status == "SUBMITTED").count()
    under_review = db.query(Application).filter(Application.applicant_id == applicant_id, Application.status == "UNDER_REVIEW").count()
    accepted = db.query(Application).filter(Application.applicant_id == applicant_id, Application.status == "ACCEPTED").count()

    return {
        "my_total_applications": my_applications,
        "submitted": submitted,
        "under_review": under_review,
        "accepted": accepted
    }
