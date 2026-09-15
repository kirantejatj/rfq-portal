from sqlalchemy import (
    Column, BigInteger, Integer, String, Text, Numeric, Boolean,
    Date, DateTime, ForeignKey, text
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class CEUser(Base):
    __tablename__ = "ce_users"

    ce_id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    mobile_no = Column(String(15), nullable=False, unique=True, index=True)
    email = Column(String(150), nullable=True)
    password_hash = Column(Text, nullable=False)
    designation = Column(String(100), default="Chief Engineer")
    role = Column(String(20), nullable=False, default="CE")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime, server_default=text("now()"), nullable=False)


class Applicant(Base):
    __tablename__ = "applicants"

    applicant_id = Column(BigInteger, primary_key=True, index=True)
    mobile_no = Column(String(15), nullable=False, unique=True, index=True)
    firm_name = Column(String(255), nullable=False)
    registration_type = Column(String(100), nullable=True)
    vendor_type = Column(String(100), nullable=True)
    prime_line_business = Column(String(255), nullable=True)
    turnover = Column(String(100), nullable=True)
    work_experience = Column(Text, nullable=True)
    chairperson_name = Column(String(150), nullable=True)
    md_ceo_name = Column(String(150), nullable=True)
    postal_address = Column(Text, nullable=True)
    email = Column(String(150), nullable=True)
    gstin = Column(String(20), nullable=True)
    pan_no = Column(String(20), nullable=True)
    password_hash = Column(Text, nullable=True)
    mobile_verified = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime, server_default=text("now()"), nullable=False)


class ApplicantDocument(Base):
    __tablename__ = "applicant_documents"

    document_id = Column(BigInteger, primary_key=True, index=True)
    applicant_id = Column(BigInteger, nullable=False, index=True)
    document_type = Column(String(50), nullable=False, default="REGISTRATION_DOC")
    file_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_size_kb = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime, server_default=text("now()"), nullable=False)



class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    otp_id = Column(BigInteger, primary_key=True, index=True)
    mobile_no = Column(String(15), nullable=False, index=True)
    otp_code = Column(String(10), nullable=False)
    purpose = Column(String(20), nullable=False, default="LOGIN")
    is_verified = Column(Boolean, nullable=False, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=text("now()"), nullable=False)


class RFQTender(Base):
    __tablename__ = "rfq_tenders"

    tender_id = Column(BigInteger, primary_key=True, index=True)
    tender_ref_no = Column(String(50), unique=True, index=True)
    title = Column(Text, nullable=False)
    authority_name = Column(String(255), nullable=False, default="Amaravati Growth and Infrastructure Corporation Limited")
    background = Column(Text, nullable=True)
    scope_of_work = Column(Text, nullable=True)
    total_elements = Column(Integer, nullable=True)
    element_types = Column(Integer, nullable=True)
    max_weight_mt = Column(Numeric(8, 2), nullable=True)
    min_weight_mt = Column(Numeric(8, 2), nullable=True)
    avg_weight_mt = Column(Numeric(8, 2), nullable=True)
    emd_amount = Column(Numeric(12, 2), nullable=False, default=0)
    completion_period = Column(String(50), nullable=True)
    quotation_from_date = Column(DateTime, nullable=False)
    quotation_to_date = Column(DateTime, nullable=False)
    quotation_valid_upto = Column(DateTime, nullable=True)
    validity_period = Column(String(100), nullable=True)
    opening_date = Column(DateTime, nullable=True)
    contact_person = Column(String(150), nullable=True)
    contact_email = Column(String(150), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    office_address = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="DRAFT", index=True)
    created_by = Column(BigInteger, nullable=False)
    created_at = Column(DateTime, server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime, server_default=text("now()"), nullable=False)


class RFQJob(Base):
    __tablename__ = "rfq_jobs"

    job_id = Column(BigInteger, primary_key=True, index=True)
    tender_id = Column(BigInteger, nullable=False, index=True)
    job_code = Column(String(30), nullable=True)
    job_name = Column(String(255), nullable=False)
    job_description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    estimated_quantity = Column(Numeric(12, 2), nullable=True)
    unit = Column(String(30), nullable=True)
    unit_rate = Column(Numeric(16, 2), nullable=True)
    amount = Column(Numeric(16, 2), nullable=True)
    estimated_cost = Column(Numeric(16, 2), nullable=True)
    completion_period = Column(String(50), nullable=True)
    status = Column(String(20), nullable=False, default="ACTIVE")
    created_at = Column(DateTime, server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime, server_default=text("now()"), nullable=False)


class TenderDocument(Base):
    __tablename__ = "tender_documents"

    tender_document_id = Column(BigInteger, primary_key=True, index=True)
    tender_id = Column(BigInteger, nullable=False, index=True)
    document_type = Column(String(50), nullable=False, default="RFQ_DOCUMENT")
    file_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_size_kb = Column(Integer, nullable=True)
    uploaded_by = Column(BigInteger, nullable=True)
    uploaded_at = Column(DateTime, server_default=text("now()"), nullable=False)


class Application(Base):
    __tablename__ = "applications"

    application_id = Column(BigInteger, primary_key=True, index=True)
    tender_id = Column(BigInteger, nullable=False, index=True)
    applicant_id = Column(BigInteger, nullable=False, index=True)
    application_no = Column(String(50), unique=True)
    covering_letter_date = Column(Date, nullable=True)
    signatory_name = Column(String(150), nullable=True)
    signatory_designation = Column(String(150), nullable=True)
    quoted_amount = Column(Numeric(16, 2), nullable=True)
    status = Column(String(30), nullable=False, default="SUBMITTED", index=True)
    remarks = Column(Text, nullable=True)
    submitted_at = Column(DateTime, server_default=text("now()"), nullable=False)
    created_at = Column(DateTime, server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime, server_default=text("now()"), nullable=False)


class ApplicationJob(Base):
    __tablename__ = "application_jobs"

    application_job_id = Column(BigInteger, primary_key=True, index=True)
    application_id = Column(BigInteger, nullable=False, index=True)
    job_id = Column(BigInteger, nullable=False, index=True)
    quoted_amount = Column(Numeric(16, 2), nullable=True)
    remarks = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="SUBMITTED")
    created_at = Column(DateTime, server_default=text("now()"), nullable=False)


class ApplicationDocument(Base):
    __tablename__ = "application_documents"

    document_id = Column(BigInteger, primary_key=True, index=True)
    application_id = Column(BigInteger, nullable=False, index=True)
    document_type = Column(String(50), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_size_kb = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime, server_default=text("now()"), nullable=False)


class TechnicalFinancialCapability(Base):
    __tablename__ = "technical_financial_capability"

    capability_id = Column(BigInteger, primary_key=True, index=True)
    application_id = Column(BigInteger, nullable=False, index=True)
    sl_no = Column(Integer, nullable=False)
    work_description = Column(Text, nullable=False)
    client_name = Column(String(255), nullable=True)
    cost_lakhs = Column(Numeric(14, 2), nullable=True)
    financial_year = Column(String(20), nullable=True)
    created_at = Column(DateTime, server_default=text("now()"), nullable=False)


class TechnicalProposalItem(Base):
    __tablename__ = "technical_proposal_items"

    proposal_item_id = Column(BigInteger, primary_key=True, index=True)
    application_id = Column(BigInteger, nullable=False, index=True)
    job_id = Column(BigInteger, nullable=True, index=True)
    sl_no = Column(Integer, nullable=False)
    item_description = Column(Text, nullable=False)
    unit = Column(String(30), nullable=True)
    quantity = Column(Numeric(14, 2), nullable=True)
    rate_per_unit = Column(Numeric(14, 2), nullable=True)
    amount = Column(Numeric(16, 2), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=text("now()"), nullable=False)


class EMDPayment(Base):
    __tablename__ = "emd_payments"

    emd_id = Column(BigInteger, primary_key=True, index=True)
    application_id = Column(BigInteger, nullable=False, unique=True, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    payment_mode = Column(String(30), nullable=True)
    transaction_ref = Column(String(100), nullable=True)
    payment_date = Column(DateTime, nullable=True)
    status = Column(String(20), nullable=False, default="PENDING")
    created_at = Column(DateTime, server_default=text("now()"), nullable=False)


class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    history_id = Column(BigInteger, primary_key=True, index=True)
    application_id = Column(BigInteger, nullable=False, index=True)
    old_status = Column(String(30), nullable=True)
    new_status = Column(String(30), nullable=False)
    changed_by_ce = Column(BigInteger, nullable=True)
    remarks = Column(Text, nullable=True)
    changed_at = Column(DateTime, server_default=text("now()"), nullable=False)


class Clarification(Base):
    __tablename__ = "clarifications"

    clarification_id = Column(BigInteger, primary_key=True, index=True)
    tender_id = Column(BigInteger, nullable=False, index=True)
    applicant_id = Column(BigInteger, nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    answered_by_ce = Column(BigInteger, nullable=True)
    asked_at = Column(DateTime, server_default=text("now()"), nullable=False)
    answered_at = Column(DateTime, nullable=True)
