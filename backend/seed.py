from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.schema import CEUser, RFQTender, TenderDocument, RFQJob

def seed():
    db = SessionLocal()
    try:
        print("Seeding initial data into RFQ_DB...")

        # 1. CE User (Chief Engineer)
        ce_mobile = "9876543210"
        ce = db.query(CEUser).filter(CEUser.mobile_no == ce_mobile).first()
        if not ce:
            ce = CEUser(
                name="Chief Engineer Admin",
                mobile_no=ce_mobile,
                email="ce.admin@infrastructure.gov.in",
                password_hash=get_password_hash("Admin@123"),
                designation="Chief Engineer (Infrastructure)",
                role="CE",
                is_active=True
            )
            db.add(ce)
            db.commit()
            db.refresh(ce)
            print(f"Created CE Admin User: {ce.name} (Mobile: {ce.mobile_no}, Pass: Admin@123)")
        else:
            print(f"CE User already exists: {ce.name}")

        # 2. Sample RFQ Tenders
        tenders_data = [
            {
                "tender_ref_no": "RFQ/AGIC/2026/INFRA-01",
                "title": "Design, Fabrication, and Erection of Pre-Engineered Steel Superstructures for Amaravati Administrative Towers",
                "authority_name": "Amaravati Growth and Infrastructure Corporation Limited",
                "background": "State-of-the-art administrative city development requiring precision pre-engineered steel structures.",
                "scope_of_work": "Supply, fabrication, surface preparation, multi-coat epoxy painting, transportation, and crane erection of structural steel components according to IS 800 standards.",
                "total_elements": 450,
                "element_types": 18,
                "max_weight_mt": 12.50,
                "min_weight_mt": 0.85,
                "avg_weight_mt": 4.20,
                "emd_amount": 500000.00,
                "completion_period": "12 Months",
                "quotation_from_date": datetime.now() - timedelta(days=2),
                "quotation_to_date": datetime.now() + timedelta(days=30),
                "opening_date": datetime.now() + timedelta(days=32),
                "contact_person": "Er. K. Ramesh Rao, SE (Tech)",
                "contact_email": "tenders.infra@agic.gov.in",
                "contact_phone": "+91 866 2459800",
                "office_address": "AGIC Bhavan, Sector 4, Capital Complex, Amaravati - 522503",
                "status": "PUBLISHED",
                "jobs": [
                    {
                        "job_code": "JOB-INFRA-01-FAB",
                        "job_name": "Structural Steel Fabrication & Surface Treatment",
                        "job_description": "Shop fabrication of heavy steel columns, trusses, and purlins with shot blasting and zinc-rich epoxy primer.",
                        "category": "Steel Fabrication",
                        "estimated_quantity": 250,
                        "unit": "MT",
                        "estimated_cost": 21500000.00,
                        "completion_period": "6 Months",
                        "status": "ACTIVE"
                    },
                    {
                        "job_code": "JOB-INFRA-01-ERECT",
                        "job_name": "Tower Superstructure Crane Erection & Bolting",
                        "job_description": "Site assembly, heavy crane positioning, alignment, torque tension bolting, and safety netting.",
                        "category": "Site Erection",
                        "estimated_quantity": 250,
                        "unit": "MT",
                        "estimated_cost": 8500000.00,
                        "completion_period": "6 Months",
                        "status": "ACTIVE"
                    },
                    {
                        "job_code": "JOB-INFRA-01-ROOF",
                        "job_name": "Standing Seam Metal Roofing & Wall Cladding",
                        "job_description": "Supply and installation of PVDF-coated high-tensile galvalume standing seam profile sheets.",
                        "category": "Sheeting & Cladding",
                        "estimated_quantity": 12000,
                        "unit": "SQM",
                        "estimated_cost": 14000000.00,
                        "completion_period": "4 Months",
                        "status": "ACTIVE"
                    }
                ]
            },
            {
                "tender_ref_no": "RFQ/AGIC/2026/ROADS-04",
                "title": "Supply and Laying of High-Grade Precast RCC Box Culverts and Stormwater Drainage Elements for Arterial Road N1",
                "authority_name": "Amaravati Growth and Infrastructure Corporation Limited",
                "background": "Capital ring road trunk drainage network expansion.",
                "scope_of_work": "Manufacturing M40 grade heavy duty RCC box culverts, testing, and sequential site installation.",
                "total_elements": 1200,
                "element_types": 6,
                "max_weight_mt": 8.00,
                "min_weight_mt": 1.50,
                "avg_weight_mt": 3.75,
                "emd_amount": 250000.00,
                "completion_period": "8 Months",
                "quotation_from_date": datetime.now() - timedelta(days=1),
                "quotation_to_date": datetime.now() + timedelta(days=25),
                "opening_date": datetime.now() + timedelta(days=27),
                "contact_person": "Er. P. Srinivasa Murthy, EE",
                "contact_email": "drainage.rfq@agic.gov.in",
                "contact_phone": "+91 866 2459812",
                "office_address": "AGIC Bhavan, Sector 4, Capital Complex, Amaravati - 522503",
                "status": "PUBLISHED",
                "jobs": [
                    {
                        "job_code": "JOB-ROADS-04-PRECAST",
                        "job_name": "Precast RCC Box Culvert Segments (M40)",
                        "job_description": "Factory casting and steam curing of heavy precast box culverts with high-yield strength reinforcement.",
                        "category": "Precast Concrete",
                        "estimated_quantity": 600,
                        "unit": "NOS",
                        "estimated_cost": 18000000.00,
                        "completion_period": "5 Months",
                        "status": "ACTIVE"
                    },
                    {
                        "job_code": "JOB-ROADS-04-DRAIN",
                        "job_name": "Excavation, Bedding & Alignment Laying",
                        "job_description": "Bedding preparation with PCC, laying, rubber gasket joint sealing, and backfilling.",
                        "category": "Drainage Laying",
                        "estimated_quantity": 4500,
                        "unit": "RMT",
                        "estimated_cost": 9500000.00,
                        "completion_period": "8 Months",
                        "status": "ACTIVE"
                    }
                ]
            }
        ]

        for t_data in tenders_data:
            jobs_list = t_data.pop("jobs", [])
            existing_t = db.query(RFQTender).filter(RFQTender.tender_ref_no == t_data["tender_ref_no"]).first()
            if not existing_t:
                tender = RFQTender(
                    **t_data,
                    created_by=ce.ce_id
                )
                db.add(tender)
                db.commit()
                db.refresh(tender)
                print(f"Created Tender: {tender.tender_ref_no} - {tender.title[:50]}...")
                tender_id = tender.tender_id
            else:
                print(f"Tender already exists: {existing_t.tender_ref_no}")
                tender_id = existing_t.tender_id

            # Seed Jobs for this tender if not existing
            for j_data in jobs_list:
                existing_job = db.query(RFQJob).filter(
                    RFQJob.tender_id == tender_id,
                    RFQJob.job_code == j_data["job_code"]
                ).first()
                if not existing_job:
                    job_obj = RFQJob(
                        tender_id=tender_id,
                        **j_data
                    )
                    db.add(job_obj)
                    db.commit()
                    print(f"  -> Added Job: {j_data['job_code']} - {j_data['job_name']}")
                else:
                    print(f"  -> Job exists: {j_data['job_code']}")

        print("Seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()

