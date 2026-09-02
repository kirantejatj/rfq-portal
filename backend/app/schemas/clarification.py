from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ClarificationCreate(BaseModel):
    tender_id: int
    question: str

class ClarificationAnswer(BaseModel):
    answer: str

class ClarificationOut(BaseModel):
    clarification_id: int
    tender_id: int
    applicant_id: Optional[int] = None
    firm_name: Optional[str] = None
    question: str
    answer: Optional[str] = None
    answered_by_ce: Optional[int] = None
    asked_at: datetime
    answered_at: Optional[datetime] = None

    class Config:
        from_attributes = True
