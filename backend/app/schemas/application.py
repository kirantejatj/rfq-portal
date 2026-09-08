from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel

class CapabilityItemSchema(BaseModel):
    sl_no: int
    work_description: str
    client_name: Optional[str] = None
    cost_lakhs: Optional[float] = None
    financial_year: Optional[str] = None

class ProposalItemSchema(BaseModel):
    sl_no: int
    job_id: Optional[int] = None
    item_description: str
    unit: Optional[str] = None
    quantity: Optional[float] = None
    rate_per_unit: Optional[float] = None
    amount: Optional[float] = None
    remarks: Optional[str] = None

class ApplicationJobSchema(BaseModel):
    job_id: int
    quoted_amount: Optional[float] = None
    remarks: Optional[str] = None

class ApplicationJobOut(BaseModel):
    application_job_id: int
    application_id: int
    job_id: int
    quoted_amount: Optional[float] = None
    remarks: Optional[str] = None
    status: str
    created_at: datetime
    job_code: Optional[str] = None
    job_name: Optional[str] = None
    category: Optional[str] = None
    estimated_quantity: Optional[float] = None
    unit: Optional[str] = None
    estimated_cost: Optional[float] = None
    completion_period: Optional[str] = None

    class Config:
        from_attributes = True

class EMDPaymentSchema(BaseModel):
    amount: float
    payment_mode: Optional[str] = "ONLINE_PORTAL"
    transaction_ref: Optional[str] = None
    payment_date: Optional[datetime] = None

class ApplicationDocumentOut(BaseModel):
    document_id: int
    application_id: int
    document_type: str
    file_name: str
    file_path: str
    file_size_kb: Optional[int] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

class ApplicationSubmitRequest(BaseModel):
    tender_id: int
    covering_letter_date: Optional[date] = None
    signatory_name: Optional[str] = None
    signatory_designation: Optional[str] = None
    quoted_amount: Optional[float] = None
    remarks: Optional[str] = None
    selected_jobs: List[ApplicationJobSchema] = []
    capabilities: List[CapabilityItemSchema] = []
    proposal_items: List[ProposalItemSchema] = []
    emd: Optional[EMDPaymentSchema] = None

class ApplicationStatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None

class ApplicationStatusHistoryOut(BaseModel):
    history_id: int
    application_id: int
    old_status: Optional[str] = None
    new_status: str
    changed_by_ce: Optional[int] = None
    remarks: Optional[str] = None
    changed_at: datetime

    class Config:
        from_attributes = True

class ApplicationOut(BaseModel):
    application_id: int
    tender_id: int
    applicant_id: int
    application_no: Optional[str] = None
    covering_letter_date: Optional[date] = None
    signatory_name: Optional[str] = None
    signatory_designation: Optional[str] = None
    quoted_amount: Optional[float] = None
    status: str
    remarks: Optional[str] = None
    submitted_at: datetime
    created_at: datetime
    updated_at: datetime
    firm_name: Optional[str] = None
    mobile_no: Optional[str] = None
    email: Optional[str] = None
    gstin: Optional[str] = None
    pan_no: Optional[str] = None
    turnover: Optional[str] = None
    work_experience: Optional[str] = None
    registration_type: Optional[str] = None
    prime_line_business: Optional[str] = None
    tender_title: Optional[str] = None
    tender_ref_no: Optional[str] = None
    selected_jobs: List[ApplicationJobOut] = []
    capabilities: List[CapabilityItemSchema] = []
    proposal_items: List[ProposalItemSchema] = []
    documents: List[ApplicationDocumentOut] = []
    emd: Optional[EMDPaymentSchema] = None
    history: List[ApplicationStatusHistoryOut] = []

    class Config:
        from_attributes = True

