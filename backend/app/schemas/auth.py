from typing import Optional
from pydantic import BaseModel, EmailStr

class SendOTPRequest(BaseModel):
    mobile_no: str
    purpose: str = "LOGIN"

class VerifyOTPRequest(BaseModel):
    mobile_no: str
    otp_code: str
    purpose: str = "LOGIN"

class ApplicantRegisterRequest(BaseModel):
    mobile_no: str
    firm_name: str
    registration_type: Optional[str] = None
    prime_line_business: Optional[str] = None
    turnover: Optional[str] = None
    work_experience: Optional[str] = None
    chairperson_name: Optional[str] = None
    md_ceo_name: Optional[str] = None
    postal_address: Optional[str] = None
    email: Optional[EmailStr] = None
    gstin: Optional[str] = None
    pan_no: Optional[str] = None
    password: Optional[str] = None

class ApplicantLoginRequest(BaseModel):
    mobile_no: str
    password: str

class CELoginRequest(BaseModel):
    mobile_no: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    name: str
    mobile: str
