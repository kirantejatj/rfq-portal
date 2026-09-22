from datetime import datetime
import shutil
import io
import os
import zipfile
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.dependencies import get_current_user, require_applicant, require_ce
from app.models.schema import (
    Application, RFQTender, Applicant, ApplicationDocument,
    TechnicalFinancialCapability, TechnicalProposalItem,
    EMDPayment, ApplicationStatusHistory, ApplicationJob, RFQJob, ApplicantDocument
)
from app.schemas.application import (
    ApplicationSubmitRequest, ApplicationStatusUpdate, ApplicationOut,
    CapabilityItemSchema, ProposalItemSchema, ApplicationDocumentOut,
    EMDPaymentSchema, ApplicationStatusHistoryOut, ApplicationJobOut, ApplicationJobSchema
)

router = APIRouter(prefix="/api/applications", tags=["Applications"])

def build_application_out(app_obj: Application, db: Session) -> ApplicationOut:
    applicant = db.query(Applicant).filter(Applicant.applicant_id == app_obj.applicant_id).first()
    tender = db.query(RFQTender).filter(RFQTender.tender_id == app_obj.tender_id).first()
    capabilities = db.query(TechnicalFinancialCapability).filter(
        TechnicalFinancialCapability.application_id == app_obj.application_id
    ).order_by(TechnicalFinancialCapability.sl_no).all()
    proposal_items = db.query(TechnicalProposalItem).filter(
        TechnicalProposalItem.application_id == app_obj.application_id
    ).order_by(TechnicalProposalItem.sl_no).all()
    documents = db.query(ApplicationDocument).filter(
        ApplicationDocument.application_id == app_obj.application_id
    ).all()
    emd = db.query(EMDPayment).filter(
        EMDPayment.application_id == app_obj.application_id
    ).first()
    history = db.query(ApplicationStatusHistory).filter(
        ApplicationStatusHistory.application_id == app_obj.application_id
    ).order_by(ApplicationStatusHistory.changed_at.desc()).all()

    # Fetch selected jobs with RFQJob metadata
    app_jobs = db.query(ApplicationJob).filter(
        ApplicationJob.application_id == app_obj.application_id
    ).order_by(ApplicationJob.application_job_id.asc()).all()

    selected_jobs_out = []
    for aj in app_jobs:
        job_meta = db.query(RFQJob).filter(RFQJob.job_id == aj.job_id).first()
        selected_jobs_out.append(
            ApplicationJobOut(
                application_job_id=aj.application_job_id,
                application_id=aj.application_id,
                job_id=aj.job_id,
                quoted_amount=float(aj.quoted_amount) if aj.quoted_amount is not None else None,
                remarks=aj.remarks,
                status=aj.status,
                created_at=aj.created_at,
                job_code=job_meta.job_code if job_meta else None,
                job_name=job_meta.job_name if job_meta else f"Job #{aj.job_id}",
                category=job_meta.category if job_meta else None,
                estimated_quantity=float(job_meta.estimated_quantity) if job_meta and job_meta.estimated_quantity is not None else None,
                unit=job_meta.unit if job_meta else None,
                estimated_cost=float(job_meta.estimated_cost) if job_meta and job_meta.estimated_cost is not None else None,
                completion_period=job_meta.completion_period if job_meta else None
            )
        )

    return ApplicationOut(
        application_id=app_obj.application_id,
        tender_id=app_obj.tender_id,
        applicant_id=app_obj.applicant_id,
        application_no=app_obj.application_no,
        covering_letter_date=app_obj.covering_letter_date,
        signatory_name=app_obj.signatory_name,
        signatory_designation=app_obj.signatory_designation,
        quoted_amount=float(app_obj.quoted_amount) if app_obj.quoted_amount is not None else None,
        status=app_obj.status,
        remarks=app_obj.remarks,
        submitted_at=app_obj.submitted_at,
        created_at=app_obj.created_at,
        updated_at=app_obj.updated_at,
        firm_name=applicant.firm_name if applicant else None,
        mobile_no=applicant.mobile_no if applicant else None,
        email=applicant.email if applicant else None,
        gstin=applicant.gstin if applicant else None,
        pan_no=applicant.pan_no if applicant else None,
        turnover=applicant.turnover or applicant.md_ceo_name if applicant else None,
        work_experience=applicant.work_experience or applicant.chairperson_name if applicant else None,
        registration_type=applicant.registration_type if applicant else None,
        prime_line_business=applicant.prime_line_business if applicant else None,
        tender_title=tender.title if tender else None,
        tender_ref_no=tender.tender_ref_no if tender else None,
        selected_jobs=selected_jobs_out,
        capabilities=[
            CapabilityItemSchema(
                sl_no=c.sl_no,
                work_description=c.work_description,
                client_name=c.client_name,
                cost_lakhs=float(c.cost_lakhs) if c.cost_lakhs is not None else None,
                financial_year=c.financial_year
            ) for c in capabilities
        ],
        proposal_items=[
            ProposalItemSchema(
                sl_no=p.sl_no,
                job_id=p.job_id,
                item_description=p.item_description,
                unit=p.unit,
                quantity=float(p.quantity) if p.quantity is not None else None,
                rate_per_unit=float(p.rate_per_unit) if p.rate_per_unit is not None else None,
                amount=float(p.amount) if p.amount is not None else None,
                remarks=p.remarks
            ) for p in proposal_items
        ],
        documents=[ApplicationDocumentOut.from_orm(d) for d in documents],
        emd=EMDPaymentSchema(
            amount=float(emd.amount),
            payment_mode=emd.payment_mode,
            transaction_ref=emd.transaction_ref,
            payment_date=emd.payment_date
        ) if emd else None,
        history=[ApplicationStatusHistoryOut.from_orm(h) for h in history]
    )

@router.post("", response_model=ApplicationOut)
def submit_application(
    payload: ApplicationSubmitRequest,
    current_user: dict = Depends(require_applicant),
    db: Session = Depends(get_db)
):
    applicant_id = current_user["id"]
    tender_id = payload.tender_id

    # 1. Vendor Eligibility Validation
    applicant = db.query(Applicant).filter(Applicant.applicant_id == applicant_id).first()
    if not applicant:
        raise HTTPException(status_code=404, detail="Vendor profile not found")

    v_type = (applicant.vendor_type or applicant.registration_type or "").strip()
    eligible_set = {
        "MANUFACTURER", "AUTHORISED_DEALER", "AUTHORISED_DISTRIBUTOR", "CONTRACTOR",
        "AUTHORIZED DEALER", "AUTHORIZED DISTRIBUTOR",
        "Manufacturer", "Authorised Dealer", "Authorised Distributor", "Contractor"
    }
    is_eligible = (v_type in eligible_set) or (v_type.upper().replace(" ", "_") in eligible_set)
    if not is_eligible:
        raise HTTPException(
            status_code=400,
            detail="Eligibility criteria not met: Only registered Manufacturers, Authorised Dealers, Authorised Distributors, or Contractors are permitted to submit quotations."
        )

    # 2. Check tender window
    tender = db.query(RFQTender).filter(RFQTender.tender_id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Quotation/RFQ not found")

    now = datetime.now()
    if tender.status != "PUBLISHED":
        raise HTTPException(status_code=400, detail=f"RFQ is not published (current status: {tender.status})")
    
    if now < tender.quotation_from_date or now > tender.quotation_to_date:
        raise HTTPException(
            status_code=400,
            detail=f"Quotation window is closed. Submissions allowed between {tender.quotation_from_date} and {tender.quotation_to_date}"
        )

    # 3. Check if already submitted
    existing = db.query(Application).filter(
        Application.tender_id == tender_id,
        Application.applicant_id == applicant_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a quotation for this RFQ.")

    # 4. Check RFQ items
    tender_jobs = db.query(RFQJob).filter(RFQJob.tender_id == tender_id, RFQJob.status == "ACTIVE").all()
    valid_job_ids = {j.job_id for j in tender_jobs}

    if tender_jobs and not payload.selected_jobs:
        raise HTTPException(status_code=400, detail="Please select at least one job from this tender to submit your quotation.")

    if payload.selected_jobs:
        for sj in payload.selected_jobs:
            if valid_job_ids and sj.job_id not in valid_job_ids:
                raise HTTPException(status_code=400, detail=f"Invalid job_id {sj.job_id} for tender {tender_id}")

    # Calculate total quoted amount from proposal items or selected jobs
    calc_proposal_total = 0.0
    for item in payload.proposal_items:
        if item.quantity and item.rate_per_unit:
            calc_proposal_total += float(item.quantity) * float(item.rate_per_unit)
        elif item.amount:
            calc_proposal_total += float(item.amount)

    calc_job_total = sum((float(sj.quoted_amount) for sj in payload.selected_jobs if sj.quoted_amount), 0.0)

    if payload.quoted_amount is not None:
        quoted_amount = payload.quoted_amount
    elif calc_proposal_total > 0:
        quoted_amount = calc_proposal_total
    elif calc_job_total > 0:
        quoted_amount = calc_job_total
    else:
        quoted_amount = 0.0

    app_no = f"APP-{tender_id}-{applicant_id}-{int(datetime.now().timestamp())}"

    app_obj = Application(
        tender_id=tender_id,
        applicant_id=applicant_id,
        application_no=app_no,
        covering_letter_date=payload.covering_letter_date or datetime.now().date(),
        signatory_name=payload.signatory_name,
        signatory_designation=payload.signatory_designation,
        quoted_amount=quoted_amount,
        status="SUBMITTED",
        remarks=payload.remarks
    )
    db.add(app_obj)
    db.flush()

    # Save Selected Application Jobs
    for s_job in payload.selected_jobs:
        # Calculate job-specific quoted amount from proposal items if not specified
        job_proposal_amt = sum(
            ((float(p.quantity or 1) * float(p.rate_per_unit or 0)) if (p.quantity and p.rate_per_unit) else float(p.amount or 0))
            for p in payload.proposal_items
            if p.job_id == s_job.job_id
        )
        job_amount = s_job.quoted_amount if s_job.quoted_amount is not None else (job_proposal_amt if job_proposal_amt > 0 else None)

        app_job = ApplicationJob(
            application_id=app_obj.application_id,
            job_id=s_job.job_id,
            quoted_amount=job_amount,
            remarks=s_job.remarks,
            status="SUBMITTED"
        )
        db.add(app_job)

    # Save Annexure II items
    for item in payload.capabilities:
        cap = TechnicalFinancialCapability(
            application_id=app_obj.application_id,
            sl_no=item.sl_no,
            work_description=item.work_description,
            client_name=item.client_name,
            cost_lakhs=item.cost_lakhs,
            financial_year=item.financial_year
        )
        db.add(cap)

    # Save Annexure III items
    for item in payload.proposal_items:
        item_amt = item.amount
        if item_amt is None and item.quantity and item.rate_per_unit:
            item_amt = item.quantity * item.rate_per_unit
        prop = TechnicalProposalItem(
            application_id=app_obj.application_id,
            job_id=item.job_id,
            sl_no=item.sl_no,
            item_description=item.item_description,
            unit=item.unit,
            quantity=item.quantity,
            rate_per_unit=item.rate_per_unit,
            amount=item_amt,
            remarks=item.remarks
        )
        db.add(prop)

    # Save EMD Payment (optional)
    if payload.emd and (payload.emd.amount or payload.emd.transaction_ref):
        emd_record = EMDPayment(
            application_id=app_obj.application_id,
            amount=payload.emd.amount or 0.0,
            payment_mode=payload.emd.payment_mode or "ONLINE_PORTAL",
            transaction_ref=payload.emd.transaction_ref or f"TXN-{int(datetime.now().timestamp())}",
            payment_date=payload.emd.payment_date or datetime.now(),
            status="SUCCESS"
        )
        db.add(emd_record)

    # Record initial status in history
    hist = ApplicationStatusHistory(
        application_id=app_obj.application_id,
        old_status=None,
        new_status="SUBMITTED",
        remarks="Quotation submitted by applicant"
    )
    db.add(hist)

    db.commit()
    db.refresh(app_obj)
    return build_application_out(app_obj, db)


@router.post("/{application_id}/documents")
def upload_application_document(
    application_id: int,
    document_type: str = Form("OTHER"),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app_obj = db.query(Application).filter(Application.application_id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    # Security check: only applicant owner or CE can upload
    if current_user["role"] == "APPLICANT" and app_obj.applicant_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    safe_filename = f"app_{application_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename.replace(' ', '_')}"
    file_dest = settings.UPLOAD_DIR / safe_filename

    with open(file_dest, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size_kb = int(file_dest.stat().st_size / 1024)

    doc = ApplicationDocument(
        application_id=application_id,
        document_type=document_type,
        file_name=file.filename,
        file_path=f"/uploads/{safe_filename}",
        file_size_kb=file_size_kb
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.get("/{application_id}/download-all")
def download_all_application_documents(
    application_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app_obj = db.query(Application).filter(Application.application_id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    # Security: Applicant only downloads their own, CE downloads any
    if current_user["role"] == "APPLICANT" and app_obj.applicant_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    docs = db.query(ApplicationDocument).filter(ApplicationDocument.application_id == application_id).all()
    applicant_docs = db.query(ApplicantDocument).filter(ApplicantDocument.applicant_id == app_obj.applicant_id).all()

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        added_names = set()
        # Add application documents (Annexure III, EMD, Signed RFQ, etc.)
        for doc in docs:
            filename_clean = os.path.basename(doc.file_path)
            real_path = os.path.join(settings.UPLOAD_DIR, filename_clean)
            if os.path.exists(real_path):
                arcname = f"Application_{doc.document_type}_{doc.file_name}"
                count = 1
                while arcname in added_names:
                    arcname = f"Application_{doc.document_type}_{count}_{doc.file_name}"
                    count += 1
                added_names.add(arcname)
                zip_file.write(real_path, arcname=arcname)

        # Add applicant profile documents (Turnover, Registration, Experience)
        for adoc in applicant_docs:
            filename_clean = os.path.basename(adoc.file_path)
            real_path = os.path.join(settings.UPLOAD_DIR, filename_clean)
            if os.path.exists(real_path):
                arcname = f"Applicant_{adoc.document_type}_{adoc.file_name}"
                count = 1
                while arcname in added_names:
                    arcname = f"Applicant_{adoc.document_type}_{count}_{adoc.file_name}"
                    count += 1
                added_names.add(arcname)
                zip_file.write(real_path, arcname=arcname)

        if not added_names:
            # Add a readme text file if no files exist yet
            zip_file.writestr("README.txt", f"No documents were attached for Application {app_obj.application_no or application_id}.")

    zip_buffer.seek(0)
    safe_app_no = (app_obj.application_no or f"App_{application_id}").replace(" ", "_").replace("/", "_")
    filename = f"Quotation_Documents_{safe_app_no}.zip"
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/my", response_model=List[ApplicationOut])
def get_my_applications(
    current_user: dict = Depends(require_applicant),
    db: Session = Depends(get_db)
):
    applicant_id = current_user["id"]
    apps = db.query(Application).filter(Application.applicant_id == applicant_id).order_by(Application.submitted_at.desc()).all()
    return [build_application_out(a, db) for a in apps]

@router.get("/officer/all", response_model=List[ApplicationOut])
def get_officer_all_applications(
    current_user: dict = Depends(require_ce),
    db: Session = Depends(get_db)
):
    if current_user["role"] == "SUPER_ADMIN":
        apps = db.query(Application).order_by(Application.submitted_at.desc()).all()
    else:
        ce_tenders = db.query(RFQTender.tender_id).filter(RFQTender.created_by == current_user["id"]).all()
        tender_ids = [t[0] for t in ce_tenders]
        if not tender_ids:
            return []
        apps = db.query(Application).filter(Application.tender_id.in_(tender_ids)).order_by(Application.submitted_at.desc()).all()
    return [build_application_out(a, db) for a in apps]

@router.get("/tender/{tender_id}", response_model=List[ApplicationOut])
def get_tender_applications(
    tender_id: int,
    current_user: dict = Depends(require_ce),
    db: Session = Depends(get_db)
):
    tender = db.query(RFQTender).filter(RFQTender.tender_id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Quotation/RFQ not found")

    # Strict Officer Authorization: Only the Officer who raised the RFQ can view quotations
    if current_user["role"] != "SUPER_ADMIN" and tender.created_by != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail=f"Access forbidden: You do not have authorization to view quotations for RFQ {tender.tender_ref_no or tender_id}. Only the Officer who raised this RFQ has authority to view and approve submitted quotations."
        )

    apps = db.query(Application).filter(Application.tender_id == tender_id).order_by(Application.submitted_at.desc()).all()
    return [build_application_out(a, db) for a in apps]

@router.get("/{application_id}", response_model=ApplicationOut)
def get_application_details(
    application_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app_obj = db.query(Application).filter(Application.application_id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Quotation not found")

    # Access control: APPLICANT sees ONLY their own quotation
    if current_user["role"] == "APPLICANT" and app_obj.applicant_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden: You can only view your own quotation")

    # Access control: CE/Officer sees ONLY quotations for RFQs raised by them (unless SUPER_ADMIN)
    if current_user["role"] in ["CE", "ADMIN"] and current_user["role"] != "SUPER_ADMIN":
        tender = db.query(RFQTender).filter(RFQTender.tender_id == app_obj.tender_id).first()
        if tender and tender.created_by != current_user["id"]:
            raise HTTPException(
                status_code=403,
                detail=f"Access forbidden: Only the Officer who created RFQ {tender.tender_ref_no or tender.tender_id} has authority to review this quotation."
            )

    return build_application_out(app_obj, db)

@router.patch("/{application_id}/status")
def update_application_status(
    application_id: int,
    payload: ApplicationStatusUpdate,
    current_user: dict = Depends(require_ce),
    db: Session = Depends(get_db)
):
    status_val = "ACCEPTED" if payload.status == "APPROVED" else payload.status
    valid_statuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'APPROVED', 'REJECTED', 'WITHDRAWN']
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    app_obj = db.query(Application).filter(Application.application_id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Quotation not found")

    # Officer Authorization: Only the Officer who raised this RFQ can approve or reject quotations
    tender = db.query(RFQTender).filter(RFQTender.tender_id == app_obj.tender_id).first()
    if current_user["role"] != "SUPER_ADMIN" and tender and tender.created_by != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail=f"Access forbidden: Only the Officer who raised RFQ {tender.tender_ref_no or tender.tender_id} can approve or reject quotations."
        )

    old_status = app_obj.status
    app_obj.status = status_val
    if payload.remarks:
        app_obj.remarks = payload.remarks
    app_obj.updated_at = datetime.now()

    # Log audit history
    history = ApplicationStatusHistory(
        application_id=application_id,
        old_status=old_status,
        new_status=status_val,
        changed_by_ce=current_user["id"],
        remarks=payload.remarks
    )
    db.add(history)
    db.commit()

    return {"message": "Quotation status updated successfully", "application_id": application_id, "status": status_val}
