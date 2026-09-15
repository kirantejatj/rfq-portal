from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class RFQJobCreate(BaseModel):
    job_code: Optional[str] = None
    job_name: str
    job_description: Optional[str] = None
    category: Optional[str] = "Supply Item" # "Supply Item" or "Only Rate"
    estimated_quantity: Optional[float] = None
    unit: Optional[str] = None
    unit_rate: Optional[float] = None
    amount: Optional[float] = None
    estimated_cost: Optional[float] = None
    completion_period: Optional[str] = None
    status: str = "ACTIVE"

class RFQJobUpdate(BaseModel):
    job_code: Optional[str] = None
    job_name: Optional[str] = None
    job_description: Optional[str] = None
    category: Optional[str] = None
    estimated_quantity: Optional[float] = None
    unit: Optional[str] = None
    unit_rate: Optional[float] = None
    amount: Optional[float] = None
    estimated_cost: Optional[float] = None
    completion_period: Optional[str] = None
    status: Optional[str] = None

class RFQJobOut(BaseModel):
    job_id: int
    tender_id: int
    job_code: Optional[str] = None
    job_name: str
    job_description: Optional[str] = None
    category: Optional[str] = None
    estimated_quantity: Optional[float] = None
    unit: Optional[str] = None
    unit_rate: Optional[float] = None
    amount: Optional[float] = None
    estimated_cost: Optional[float] = None
    completion_period: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TenderDocumentOut(BaseModel):
    tender_document_id: int
    tender_id: int
    document_type: str
    file_name: str
    file_path: str
    file_size_kb: Optional[int] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

class TenderCreate(BaseModel):
    tender_ref_no: str
    title: str
    authority_name: str = "Amaravati Growth and Infrastructure Corporation Limited"
    background: Optional[str] = None
    scope_of_work: Optional[str] = None
    total_elements: Optional[int] = None
    element_types: Optional[int] = None
    max_weight_mt: Optional[float] = None
    min_weight_mt: Optional[float] = None
    avg_weight_mt: Optional[float] = None
    emd_amount: float = 0.0
    completion_period: Optional[str] = None
    quotation_from_date: Optional[datetime] = None
    quotation_to_date: Optional[datetime] = None
    quotation_valid_upto: Optional[datetime] = None
    validity_period: Optional[str] = None
    opening_date: Optional[datetime] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    office_address: Optional[str] = None
    status: str = "DRAFT"
    jobs: Optional[List[RFQJobCreate]] = []

class TenderUpdate(BaseModel):
    title: Optional[str] = None
    background: Optional[str] = None
    scope_of_work: Optional[str] = None
    total_elements: Optional[int] = None
    element_types: Optional[int] = None
    max_weight_mt: Optional[float] = None
    min_weight_mt: Optional[float] = None
    avg_weight_mt: Optional[float] = None
    emd_amount: Optional[float] = None
    completion_period: Optional[str] = None
    quotation_from_date: Optional[datetime] = None
    quotation_to_date: Optional[datetime] = None
    quotation_valid_upto: Optional[datetime] = None
    validity_period: Optional[str] = None
    opening_date: Optional[datetime] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    office_address: Optional[str] = None
    status: Optional[str] = None

class TenderOut(BaseModel):
    tender_id: int
    tender_ref_no: Optional[str] = None
    title: str
    authority_name: str
    background: Optional[str] = None
    scope_of_work: Optional[str] = None
    total_elements: Optional[int] = None
    element_types: Optional[int] = None
    max_weight_mt: Optional[float] = None
    min_weight_mt: Optional[float] = None
    avg_weight_mt: Optional[float] = None
    emd_amount: float
    completion_period: Optional[str] = None
    quotation_from_date: datetime
    quotation_to_date: datetime
    quotation_valid_upto: Optional[datetime] = None
    validity_period: Optional[str] = None
    opening_date: Optional[datetime] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    office_address: Optional[str] = None
    status: str
    created_by: int
    created_at: datetime
    updated_at: datetime
    documents: List[TenderDocumentOut] = []
    jobs: List[RFQJobOut] = []
    is_window_open: bool = False
    submission_count: Optional[int] = 0

    class Config:
        from_attributes = True

