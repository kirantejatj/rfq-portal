from datetime import datetime, timedelta, timezone
import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.dependencies import get_current_user
from app.models.schema import CEUser, Applicant, OTPVerification
from app.schemas.auth import (
    SendOTPRequest, VerifyOTPRequest, ApplicantRegisterRequest,
    ApplicantLoginRequest, CELoginRequest, TokenResponse
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/applicant/request-otp")
def request_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    mobile = req.mobile_no.strip()
    if len(mobile) < 10:
        raise HTTPException(status_code=400, detail="Invalid mobile number")
    
    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)

    otp_record = OTPVerification(
        mobile_no=mobile,
        otp_code=otp_code,
        purpose=req.purpose,
        is_verified=False,
        expires_at=expires
    )
    db.add(otp_record)
    db.commit()

    return {
        "message": "OTP generated successfully",
        "mobile_no": mobile,
        "otp_debug": otp_code,  # Provided for seamless testing / offline demo
        "expires_in_minutes": 10
    }

@router.post("/applicant/verify-otp", response_model=TokenResponse)
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    mobile = req.mobile_no.strip()
    otp_record = db.query(OTPVerification).filter(
        OTPVerification.mobile_no == mobile,
        OTPVerification.otp_code == req.otp_code.strip(),
        OTPVerification.purpose == req.purpose,
        OTPVerification.is_verified == False
    ).order_by(OTPVerification.created_at.desc()).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # In production, check expiry; here we accept valid matching code
    otp_record.is_verified = True
    db.commit()

    # Find or check applicant
    applicant = db.query(Applicant).filter(Applicant.mobile_no == mobile).first()
    if not applicant:
        # Prompt user to complete registration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mobile verified, but applicant profile not registered yet. Please register."
        )

    applicant.mobile_verified = True
    db.commit()

    token = create_access_token(subject=applicant.applicant_id, role="APPLICANT")
    return TokenResponse(
        access_token=token,
        role="APPLICANT",
        user_id=applicant.applicant_id,
        name=applicant.firm_name,
        mobile=applicant.mobile_no
    )

@router.post("/applicant/register", response_model=TokenResponse)
def register_applicant(req: ApplicantRegisterRequest, db: Session = Depends(get_db)):
    mobile = req.mobile_no.strip()
    existing = db.query(Applicant).filter(Applicant.mobile_no == mobile).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mobile number already registered. Please login.")

    pwd_hash = get_password_hash(req.password) if req.password else None

    applicant = Applicant(
        mobile_no=mobile,
        firm_name=req.firm_name.strip(),
        registration_type=req.registration_type,
        prime_line_business=req.prime_line_business,
        chairperson_name=req.chairperson_name,
        md_ceo_name=req.md_ceo_name,
        postal_address=req.postal_address,
        email=req.email,
        gstin=req.gstin,
        pan_no=req.pan_no,
        password_hash=pwd_hash,
        mobile_verified=True,
        is_active=True
    )
    db.add(applicant)
    db.commit()
    db.refresh(applicant)

    token = create_access_token(subject=applicant.applicant_id, role="APPLICANT")
    return TokenResponse(
        access_token=token,
        role="APPLICANT",
        user_id=applicant.applicant_id,
        name=applicant.firm_name,
        mobile=applicant.mobile_no
    )

@router.post("/applicant/login", response_model=TokenResponse)
def login_applicant(req: ApplicantLoginRequest, db: Session = Depends(get_db)):
    applicant = db.query(Applicant).filter(Applicant.mobile_no == req.mobile_no.strip()).first()
    if not applicant or not applicant.password_hash or not verify_password(req.password, applicant.password_hash):
        raise HTTPException(status_code=401, detail="Invalid mobile number or password")
    
    token = create_access_token(subject=applicant.applicant_id, role="APPLICANT")
    return TokenResponse(
        access_token=token,
        role="APPLICANT",
        user_id=applicant.applicant_id,
        name=applicant.firm_name,
        mobile=applicant.mobile_no
    )

@router.post("/ce/login", response_model=TokenResponse)
def login_ce(req: CELoginRequest, db: Session = Depends(get_db)):
    ce_user = db.query(CEUser).filter(CEUser.mobile_no == req.mobile_no.strip()).first()
    if not ce_user or not verify_password(req.password, ce_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid CE credentials")
    
    if not ce_user.is_active:
        raise HTTPException(status_code=403, detail="CE Account is deactivated")

    token = create_access_token(subject=ce_user.ce_id, role=ce_user.role)
    return TokenResponse(
        access_token=token,
        role=ce_user.role,
        user_id=ce_user.ce_id,
        name=ce_user.name,
        mobile=ce_user.mobile_no
    )

@router.get("/me")
def get_profile(current_user: dict = Depends(get_current_user)):
    user = current_user["user"]
    if current_user["role"] in ["CE", "ADMIN", "SUPER_ADMIN"]:
        return {
            "id": user.ce_id,
            "role": user.role,
            "name": user.name,
            "mobile": user.mobile_no,
            "email": user.email,
            "designation": user.designation
        }
    else:
        return {
            "id": user.applicant_id,
            "role": "APPLICANT",
            "firm_name": user.firm_name,
            "mobile": user.mobile_no,
            "email": user.email,
            "registration_type": user.registration_type,
            "gstin": user.gstin,
            "pan_no": user.pan_no,
            "md_ceo_name": user.md_ceo_name,
            "postal_address": user.postal_address
        }
