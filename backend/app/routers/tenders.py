from datetime import datetime
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.dependencies import get_current_user, require_ce
from app.models.schema import RFQTender, TenderDocument, Application, RFQJob
from app.schemas.tender import (
    TenderCreate, TenderUpdate, TenderOut, TenderDocumentOut,
    RFQJobCreate, RFQJobUpdate, RFQJobOut
)

router = APIRouter(prefix="/api/tenders", tags=["Tenders"])

def build_tender_out(tender: RFQTender, db: Session) -> TenderOut:
    now = datetime.now()
    is_open = (tender.status == "PUBLISHED") and (tender.quotation_from_date <= now <= tender.quotation_to_date)
    sub_count = db.query(Application).filter(Application.tender_id == tender.tender_id).count()
    docs = db.query(TenderDocument).filter(TenderDocument.tender_id == tender.tender_id).all()
    jobs = db.query(RFQJob).filter(RFQJob.tender_id == tender.tender_id).order_by(RFQJob.job_id.asc()).all()
    
    return TenderOut(
        tender_id=tender.tender_id,
        tender_ref_no=tender.tender_ref_no,
        title=tender.title,
        authority_name=tender.authority_name,
        background=tender.background,
        scope_of_work=tender.scope_of_work,
        total_elements=tender.total_elements,
        element_types=tender.element_types,
        max_weight_mt=float(tender.max_weight_mt) if tender.max_weight_mt is not None else None,
        min_weight_mt=float(tender.min_weight_mt) if tender.min_weight_mt is not None else None,
        avg_weight_mt=float(tender.avg_weight_mt) if tender.avg_weight_mt is not None else None,
        emd_amount=float(tender.emd_amount),
        completion_period=tender.completion_period,
        quotation_from_date=tender.quotation_from_date,
        quotation_to_date=tender.quotation_to_date,
        opening_date=tender.opening_date,
        contact_person=tender.contact_person,
        contact_email=tender.contact_email,
        contact_phone=tender.contact_phone,
        office_address=tender.office_address,
        status=tender.status,
        created_by=tender.created_by,
        created_at=tender.created_at,
        updated_at=tender.updated_at,
        documents=[TenderDocumentOut.from_orm(d) for d in docs],
        jobs=[RFQJobOut.from_orm(j) for j in jobs],
        is_window_open=is_open,
        submission_count=sub_count
    )

@router.get("", response_model=List[TenderOut])
def list_tenders(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(RFQTender)
    if status_filter and status_filter != "ALL":
        query = query.filter(RFQTender.status == status_filter)
    tenders = query.order_by(RFQTender.created_at.desc()).all()
    return [build_tender_out(t, db) for t in tenders]

@router.get("/{tender_id}", response_model=TenderOut)
def get_tender(tender_id: int, db: Session = Depends(get_db)):
    tender = db.query(RFQTender).filter(RFQTender.tender_id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    return build_tender_out(tender, db)

@router.post("", response_model=TenderOut)
def create_tender(
    payload: TenderCreate,
    current_user: dict = Depends(require_ce),
    db: Session = Depends(get_db)
):
    if payload.quotation_to_date <= payload.quotation_from_date:
        raise HTTPException(status_code=400, detail="quotation_to_date must be after quotation_from_date")

    tender = RFQTender(
        tender_ref_no=payload.tender_ref_no.strip(),
        title=payload.title.strip(),
        authority_name=payload.authority_name.strip(),
        background=payload.background,
        scope_of_work=payload.scope_of_work,
        total_elements=payload.total_elements,
        element_types=payload.element_types,
        max_weight_mt=payload.max_weight_mt,
        min_weight_mt=payload.min_weight_mt,
        avg_weight_mt=payload.avg_weight_mt,
        emd_amount=payload.emd_amount,
        completion_period=payload.completion_period,
        quotation_from_date=payload.quotation_from_date,
        quotation_to_date=payload.quotation_to_date,
        opening_date=payload.opening_date,
        contact_person=payload.contact_person,
        contact_email=payload.contact_email,
        contact_phone=payload.contact_phone,
        office_address=payload.office_address,
        status=payload.status,
        created_by=current_user["id"]
    )
    db.add(tender)
    db.flush()

    # Add jobs if provided
    if payload.jobs:
        for idx, job_data in enumerate(payload.jobs):
            job_code = job_data.job_code or f"JOB-{tender.tender_id}-{idx + 1}"
            job_obj = RFQJob(
                tender_id=tender.tender_id,
                job_code=job_code,
                job_name=job_data.job_name,
                job_description=job_data.job_description,
                category=job_data.category,
                estimated_quantity=job_data.estimated_quantity,
                unit=job_data.unit,
                estimated_cost=job_data.estimated_cost,
                completion_period=job_data.completion_period,
                status=job_data.status or "ACTIVE"
            )
            db.add(job_obj)

    db.commit()
    db.refresh(tender)
    return build_tender_out(tender, db)

@router.post("/{tender_id}/jobs", response_model=RFQJobOut)
def add_job_to_tender(
    tender_id: int,
    payload: RFQJobCreate,
    current_user: dict = Depends(require_ce),
    db: Session = Depends(get_db)
):
    tender = db.query(RFQTender).filter(RFQTender.tender_id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    job_count = db.query(RFQJob).filter(RFQJob.tender_id == tender_id).count()
    job_code = payload.job_code or f"JOB-{tender_id}-{job_count + 1}"

    job_obj = RFQJob(
        tender_id=tender_id,
        job_code=job_code,
        job_name=payload.job_name,
        job_description=payload.job_description,
        category=payload.category,
        estimated_quantity=payload.estimated_quantity,
        unit=payload.unit,
        estimated_cost=payload.estimated_cost,
        completion_period=payload.completion_period,
        status=payload.status or "ACTIVE"
    )
    db.add(job_obj)
    db.commit()
    db.refresh(job_obj)
    return RFQJobOut.from_orm(job_obj)

@router.delete("/{tender_id}/jobs/{job_id}")
def delete_tender_job(
    tender_id: int,
    job_id: int,
    current_user: dict = Depends(require_ce),
    db: Session = Depends(get_db)
):
    job_obj = db.query(RFQJob).filter(RFQJob.job_id == job_id, RFQJob.tender_id == tender_id).first()
    if not job_obj:
        raise HTTPException(status_code=404, detail="Job not found")

    db.delete(job_obj)
    db.commit()
    return {"message": "Job deleted successfully", "job_id": job_id}

@router.patch("/{tender_id}/status")
def update_tender_status(
    tender_id: int,
    new_status: str,
    current_user: dict = Depends(require_ce),
    db: Session = Depends(get_db)
):
    valid_statuses = ["DRAFT", "PUBLISHED", "CLOSED", "CANCELLED"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    tender = db.query(RFQTender).filter(RFQTender.tender_id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    tender.status = new_status
    tender.updated_at = datetime.now()
    db.commit()
    return {"message": "Status updated successfully", "tender_id": tender_id, "status": new_status}

@router.post("/{tender_id}/documents")
def upload_tender_document(
    tender_id: int,
    document_type: str = Form("RFQ_DOCUMENT"),
    file: UploadFile = File(...),
    current_user: dict = Depends(require_ce),
    db: Session = Depends(get_db)
):
    tender = db.query(RFQTender).filter(RFQTender.tender_id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    safe_filename = f"tender_{tender_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    file_dest = settings.UPLOAD_DIR / safe_filename

    with open(file_dest, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size_kb = int(file_dest.stat().st_size / 1024)

    doc = TenderDocument(
        tender_id=tender_id,
        document_type=document_type,
        file_name=file.filename,
        file_path=f"/uploads/{safe_filename}",
        file_size_kb=file_size_kb,
        uploaded_by=current_user["id"]
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

