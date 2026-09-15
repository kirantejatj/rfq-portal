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
    officer_id = current_user["id"]
    is_super = current_user.get("role") == "SUPER_ADMIN"

    tenders_query = db.query(RFQTender)
    if not is_super:
        tenders_query = tenders_query.filter(RFQTender.created_by == officer_id)

    total_tenders = tenders_query.count()
    active_tenders = tenders_query.filter(
        RFQTender.status == "PUBLISHED",
        RFQTender.quotation_from_date <= now,
        RFQTender.quotation_to_date >= now
    ).count()

    officer_tender_ids = [t.tender_id for t in tenders_query.all()]
    
    app_query = db.query(Application)
    if not is_super:
        app_query = app_query.filter(Application.tender_id.in_(officer_tender_ids) if officer_tender_ids else False)

    total_applications = app_query.count() if (is_super or officer_tender_ids) else 0
    under_review = app_query.filter(Application.status == "UNDER_REVIEW").count() if (is_super or officer_tender_ids) else 0
    accepted = app_query.filter(Application.status == "ACCEPTED").count() if (is_super or officer_tender_ids) else 0
    rejected = app_query.filter(Application.status == "REJECTED").count() if (is_super or officer_tender_ids) else 0
    total_applicants = db.query(Applicant).count()
    
    total_quoted = app_query.with_entities(func.sum(Application.quoted_amount)).scalar() if (is_super or officer_tender_ids) else 0.0
    
    return {
        "total_tenders": total_tenders,
        "active_tenders": active_tenders,
        "total_applications": total_applications,
        "under_review_applications": under_review,
        "accepted_applications": accepted,
        "rejected_applications": rejected,
        "total_registered_applicants": total_applicants,
        "total_quoted_amount": float(total_quoted or 0.0),
        "total_emd_collected": 0.0
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
