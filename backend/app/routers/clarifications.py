from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_applicant, require_ce
from app.models.schema import Clarification, RFQTender, Applicant
from app.schemas.clarification import ClarificationCreate, ClarificationAnswer, ClarificationOut

router = APIRouter(prefix="/api/clarifications", tags=["Clarifications"])

@router.get("/tender/{tender_id}", response_model=List[ClarificationOut])
def get_tender_clarifications(tender_id: int, db: Session = Depends(get_db)):
    clarifications = db.query(Clarification).filter(Clarification.tender_id == tender_id).order_by(Clarification.asked_at.desc()).all()
    results = []
    for c in clarifications:
        firm_name = None
        if c.applicant_id:
            app = db.query(Applicant).filter(Applicant.applicant_id == c.applicant_id).first()
            if app:
                firm_name = app.firm_name
        results.append(ClarificationOut(
            clarification_id=c.clarification_id,
            tender_id=c.tender_id,
            applicant_id=c.applicant_id,
            firm_name=firm_name,
            question=c.question,
            answer=c.answer,
            answered_by_ce=c.answered_by_ce,
            asked_at=c.asked_at,
            answered_at=c.answered_at
        ))
    return results

@router.post("", response_model=ClarificationOut)
def ask_clarification(
    payload: ClarificationCreate,
    current_user: dict = Depends(require_applicant),
    db: Session = Depends(get_db)
):
    tender = db.query(RFQTender).filter(RFQTender.tender_id == payload.tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    c = Clarification(
        tender_id=payload.tender_id,
        applicant_id=current_user["id"],
        question=payload.question.strip()
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return ClarificationOut(
        clarification_id=c.clarification_id,
        tender_id=c.tender_id,
        applicant_id=c.applicant_id,
        firm_name=current_user["name"],
        question=c.question,
        answer=c.answer,
        answered_by_ce=c.answered_by_ce,
        asked_at=c.asked_at,
        answered_at=c.answered_at
    )

@router.post("/{clarification_id}/answer", response_model=ClarificationOut)
def answer_clarification(
    clarification_id: int,
    payload: ClarificationAnswer,
    current_user: dict = Depends(require_ce),
    db: Session = Depends(get_db)
):
    c = db.query(Clarification).filter(Clarification.clarification_id == clarification_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Clarification not found")

    c.answer = payload.answer.strip()
    c.answered_by_ce = current_user["id"]
    c.answered_at = datetime.now()
    db.commit()
    db.refresh(c)

    firm_name = None
    if c.applicant_id:
        app = db.query(Applicant).filter(Applicant.applicant_id == c.applicant_id).first()
        if app:
            firm_name = app.firm_name

    return ClarificationOut(
        clarification_id=c.clarification_id,
        tender_id=c.tender_id,
        applicant_id=c.applicant_id,
        firm_name=firm_name,
        question=c.question,
        answer=c.answer,
        answered_by_ce=c.answered_by_ce,
        asked_at=c.asked_at,
        answered_at=c.answered_at
    )
