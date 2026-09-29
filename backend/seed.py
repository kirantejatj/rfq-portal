from datetime import datetime, timedelta
from sqlalchemy import text
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.schema import (
    CEUser, Applicant, RFQTender, TenderDocument, RFQJob,
    Application, ApplicationJob, TechnicalProposalItem,
    TechnicalFinancialCapability, ApplicationDocument, ApplicationStatusHistory
)

def reset_and_seed():
    db = SessionLocal()
    try:
        print("==================================================================")
        print("Wiping existing test data and re-seeding RFQ Portal database...")
        print("==================================================================")

        # 0. Ensure all schema columns and constraints exist in DB
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE applications ADD COLUMN IF NOT EXISTS valid_upto DATE;"))
            conn.execute(text("ALTER TABLE applications ADD COLUMN IF NOT EXISTS min_supply_time VARCHAR(100);"))
            conn.execute(text("ALTER TABLE application_jobs ADD COLUMN IF NOT EXISTS valid_upto DATE;"))
            conn.execute(text("ALTER TABLE application_jobs ADD COLUMN IF NOT EXISTS min_supply_time VARCHAR(100);"))
            conn.execute(text("ALTER TABLE technical_proposal_items ADD COLUMN IF NOT EXISTS valid_upto DATE;"))
            conn.execute(text("ALTER TABLE technical_proposal_items ADD COLUMN IF NOT EXISTS min_supply_time VARCHAR(100);"))
            conn.execute(text("ALTER TABLE rfq_tenders ADD COLUMN IF NOT EXISTS work_type VARCHAR(50);"))
            conn.execute(text("ALTER TABLE rfq_tenders ADD COLUMN IF NOT EXISTS cl_no VARCHAR(50);"))
            conn.execute(text("ALTER TABLE rfq_tenders ADD COLUMN IF NOT EXISTS tender_document_path TEXT;"))
            conn.execute(text("ALTER TABLE rfq_tenders ADD COLUMN IF NOT EXISTS paper_clipping_path TEXT;"))
            conn.execute(text("ALTER TABLE tender_documents DROP CONSTRAINT IF EXISTS tender_documents_document_type_check;"))

        # 1. Clean all existing tables in reverse dependency order
        db.query(ApplicationStatusHistory).delete()
        db.query(ApplicationDocument).delete()
        db.query(TechnicalFinancialCapability).delete()
        db.query(TechnicalProposalItem).delete()
        db.query(ApplicationJob).delete()
        db.query(Application).delete()
        db.query(TenderDocument).delete()
        db.query(RFQJob).delete()
        db.query(RFQTender).delete()
        db.query(Applicant).delete()
        db.query(CEUser).delete()
        db.commit()
        print("[OK] Successfully cleared all tables.")

        now = datetime.now()

        # 2. Seed Officers (Chief Engineer & Senior Officers)
        ce1 = CEUser(
            name="Er. K. V. Ramanathan",
            mobile_no="9876543210",
            email="ce.ramanathan@agic.ap.gov.in",
            password_hash=get_password_hash("CE@1234"),
            designation="Chief Engineer (Procurement & Contracts)",
            role="CE",
            is_active=True
        )
        ce2 = CEUser(
            name="Er. S. Radhakrishna Murthy",
            mobile_no="9876543211",
            email="rfq.officer@agic.gov.in",
            password_hash=get_password_hash("CE@1234"),
            designation="Superintending Engineer (Infrastructure)",
            role="CE",
            is_active=True
        )
        ce3 = CEUser(
            name="Er. M. S. Lakshmi Prasanna",
            mobile_no="9876543222",
            email="lakshmi.prasanna@agic.ap.gov.in",
            password_hash=get_password_hash("CE@1234"),
            designation="Executive Engineer (Water & Environmental Systems)",
            role="CE",
            is_active=True
        )
        ce4 = CEUser(
            name="Er. G. Ravindra Kumar",
            mobile_no="9876543233",
            email="ravindra.kumar@agic.ap.gov.in",
            password_hash=get_password_hash("CE@1234"),
            designation="Executive Engineer (Electrical & Automation)",
            role="CE",
            is_active=True
        )
        db.add_all([ce1, ce2, ce3, ce4])
        db.commit()
        db.refresh(ce1)
        db.refresh(ce2)
        db.refresh(ce3)
        db.refresh(ce4)
        print(f"[OK] Created CE Officers: 9876543210, 9876543211, 9876543222, 9876543233 [Password: CE@1234 / password123]")

        # 3. Seed Registered Vendors / Applicants
        vendors = [
            Applicant(
                firm_name="Larsen & Toubro Heavy Engineering Limited",
                registration_type="Manufacturer",
                vendor_type="Manufacturer",
                prime_line_business="Heavy Structural Steel, Bridges & Special Structures",
                mobile_no="9876540001",
                email="infra.projects@lnt.com",
                password_hash=get_password_hash("Vendor@1234"),
                gstin="37AAACL1234A1Z5",
                pan_no="AAACL1234A",
                md_ceo_name="Er. S. N. Subrahmanyan",
                chairperson_name="A. M. Naik",
                turnover="₹ 18,400 Crores",
                work_experience="35+ Years in Major Infrastructure & Bridge Construction",
                postal_address="L&T Construction Complex, Mount Poonamallee Road, Manapakkam, Chennai - 600089",
                is_active=True
            ),
            Applicant(
                firm_name="Tata Advanced Materials & Infrastructure Limited",
                registration_type="Authorised Dealer",
                vendor_type="Authorised Dealer",
                prime_line_business="High-Tensile Cables, Advanced Alloys & Composites",
                mobile_no="9876540002",
                email="sales@tataadvanced.com",
                password_hash=get_password_hash("Vendor@1234"),
                gstin="37AAACT5678B1Z2",
                pan_no="AAACT5678B",
                md_ceo_name="Banmali Agrawala",
                chairperson_name="N. Chandrasekaran",
                turnover="₹ 9,250 Crores",
                work_experience="24+ Years in Specialized Metallurgy & Aerospace Grade Steel",
                postal_address="Bombay House, 24 Homi Mody Street, Fort, Mumbai - 400001",
                is_active=True
            ),
            Applicant(
                firm_name="Navayuga Engineering Company Limited",
                registration_type="Contractor",
                vendor_type="Contractor",
                prime_line_business="Precast Flyovers, Ports & Heavy Civil Infrastructure",
                mobile_no="9876540003",
                email="tenders@navayuga.com",
                password_hash=get_password_hash("Vendor@1234"),
                gstin="37AAACN9988C1Z9",
                pan_no="AAACN9988C",
                md_ceo_name="Chinta Sridhar",
                chairperson_name="C. Visweswara Rao",
                turnover="₹ 6,100 Crores",
                work_experience="28+ Years in Major Flyovers, Marine & Tunnel Works",
                postal_address="Navayuga Towers, Plot No 37 & 38, Road No 10, Banjara Hills, Hyderabad - 500034",
                is_active=True
            ),
            Applicant(
                firm_name="Megha Engineering & Infrastructures Limited (MEIL)",
                registration_type="Contractor",
                vendor_type="Contractor",
                prime_line_business="EPC Mega Infrastructure, Bridges & Irrigation Projects",
                mobile_no="9876540004",
                email="commercial@meil.in",
                password_hash=get_password_hash("Vendor@1234"),
                gstin="37AAACM3344D1Z4",
                pan_no="AAACM3344D",
                md_ceo_name="P. V. Krishna Reddy",
                chairperson_name="P. P. Reddy",
                turnover="₹ 24,500 Crores",
                work_experience="32+ Years in National Highway Bridges, Tunnels & Lift Irrigation",
                postal_address="S-2, Technocrat Industrial Estate, Balanagar, Hyderabad - 500037",
                is_active=True
            ),
            Applicant(
                firm_name="Apex Heavy Engineering Works",
                registration_type="Manufacturer",
                vendor_type="Manufacturer",
                prime_line_business="Heavy Steel & Girders",
                mobile_no="9111222333",
                email="apex.heavy@example.com",
                password_hash=get_password_hash("Vendor@1234"),
                gstin="37AAACA1111A1Z1",
                pan_no="AAACA1111A",
                md_ceo_name="Er. Rajesh Sharma",
                chairperson_name="K. L. Sharma",
                turnover="₹ 450 Crores",
                work_experience="18+ Years in Heavy Fabrications",
                postal_address="Industrial Area, Phase 2, Vijayawada",
                is_active=True
            ),
            Applicant(
                firm_name="Godavari Flow & Hydro Controls",
                registration_type="Authorised Dealer",
                vendor_type="Authorised Dealer",
                prime_line_business="Pumps & Valves",
                mobile_no="9222333444",
                email="godavari.flow@example.com",
                password_hash=get_password_hash("Vendor@1234"),
                gstin="37AAACG2222G1Z2",
                pan_no="AAACG2222G",
                md_ceo_name="V. Satyanarayana",
                chairperson_name="V. K. Rao",
                turnover="₹ 180 Crores",
                work_experience="14+ Years in Flow Systems",
                postal_address="Autonagar, Guntur",
                is_active=True
            ),
            Applicant(
                firm_name="Amaravati Premier Infra Contractors",
                registration_type="Contractor",
                vendor_type="Contractor",
                prime_line_business="Civil & Precast Works",
                mobile_no="9333444555",
                email="amaravati.infra@example.com",
                password_hash=get_password_hash("Vendor@1234"),
                gstin="37AAACA3333A1Z3",
                pan_no="AAACA3333A",
                md_ceo_name="K. Chandra Mohan",
                chairperson_name="K. Subba Rao",
                turnover="₹ 320 Crores",
                work_experience="16+ Years in Civil Works",
                postal_address="MG Road, Vijayawada",
                is_active=True
            ),
            Applicant(
                firm_name="VoltMatrix Electrical & Power",
                registration_type="Authorised Distributor",
                vendor_type="Authorised Distributor",
                prime_line_business="Substations & Cables",
                mobile_no="9444555666",
                email="voltmatrix@example.com",
                password_hash=get_password_hash("Vendor@1234"),
                gstin="37AAACV4444V1Z4",
                pan_no="AAACV4444V",
                md_ceo_name="P. Venkateswara Rao",
                chairperson_name="P. V. Prasad",
                turnover="₹ 210 Crores",
                work_experience="12+ Years in Electrical Grids",
                postal_address="Tadepalli, Amaravati",
                is_active=True
            ),
            Applicant(
                firm_name="Southern Precision Valves",
                registration_type="Manufacturer",
                vendor_type="Manufacturer",
                prime_line_business="Precision Valves & Sluice Gates",
                mobile_no="9555666777",
                email="southern.valves@example.com",
                password_hash=get_password_hash("Vendor@1234"),
                gstin="37AAACS5555S1Z5",
                pan_no="AAACS5555S",
                md_ceo_name="M. Anand Kumar",
                chairperson_name="M. R. Reddy",
                turnover="₹ 160 Crores",
                work_experience="15+ Years in Water Control Gates",
                postal_address="Enikepadu, Vijayawada",
                is_active=True
            )
        ]
        db.add_all(vendors)
        db.commit()
        for v in vendors:
            db.refresh(v)
            print(f"[OK] Created Vendor: {v.firm_name} (Email: {v.email}, Mobile: {v.mobile_no}) [Password: Vendor@1234]")

        # 4. Seed RFQ Tenders (No completion_period, with revealing_date, work_type, cl_number)
        tenders_data = [
            # Tender 1: Bridge Steel Girders (Revealed in past, evaluation ready!)
            {
                "tender_ref_no": "RFQ-AGIC-2026-BR-0101",
                "title": "Procurement of Fabricated Structural Steel Girders & Pot-PTFE Bearings for Amaravati Outer Ring Road Flyovers",
                "authority_name": "Amaravati Growth and Infrastructure Corporation Limited (AGIC)",
                "background": "Capital city outer ring road high-capacity corridor expansion.",
                "scope_of_work": "Design validation, sourcing, shop fabrication, shot blasting (SA 2.5), zinc ethyl silicate primer application, and delivery of Grade E350BR structural steel plate girders, pot-PTFE bearings, and HSFG bolts.",
                "total_elements": 850,
                "element_types": 3,
                "max_weight_mt": 18.5,
                "min_weight_mt": 1.2,
                "avg_weight_mt": 6.8,
                "emd_amount": 0.0,
                "quotation_from_date": now - timedelta(days=20),
                "quotation_to_date": now + timedelta(days=20),
                "revealing_date": now - timedelta(days=1), # Past date: UNLOCKED / REVEALED
                "quotation_valid_upto": now + timedelta(days=90),
                "validity_period": "90 Days from Quotation Opening",
                "opening_date": now + timedelta(days=20),
                "contact_person": "Er. K. V. Ramanathan",
                "contact_email": "ce.ramanathan@agic.ap.gov.in",
                "contact_phone": "+91 866 2459800",
                "office_address": "AGIC Bhavan, Sector 4, Capital Complex, Amaravati - 522503",
                "status": "PUBLISHED",
                "created_by": ce1.ce_id,
                "jobs": [
                    {
                        "job_code": "ITEM-01",
                        "job_name": "IS 2062 Grade E350BR Structural Steel Plate Girders",
                        "job_description": "Shop fabrication, ultrasonic inspection, and epoxy primer coating of heavy steel plate girders as per IS:800 and MORTH specifications.",
                        "work_type": "Structural Steel Work",
                        "cl_number": "APSS Cl. 1204 / MORTH 1900",
                        "category": "Supply Item",
                        "estimated_quantity": 850.0,
                        "unit": "MT",
                        "status": "ACTIVE"
                    },
                    {
                        "job_code": "ITEM-02",
                        "job_name": "Metallic Pot-PTFE Guided Bridge Bearings (3500 kN Capacity)",
                        "job_description": "Supply of IRC:83 (Part III) compliant guided metallic pot bearings with PTFE sliding surface and stainless steel mating plate.",
                        "work_type": "Bearings & Expansion Joints",
                        "cl_number": "IRC:83 (Part III) / MORTH 2000",
                        "category": "Supply Item",
                        "estimated_quantity": 64.0,
                        "unit": "NOS",
                        "status": "ACTIVE"
                    },
                    {
                        "job_code": "ITEM-03",
                        "job_name": "High-Strength Friction Grip (HSFG) Fastener Assemblies",
                        "job_description": "Supply of Grade 10.9 hot-dip galvanised HSFG bolts, nuts and hardened DTI washers conforming to IS:3757 and IS:4000.",
                        "work_type": "Fastening & Bolting Systems",
                        "cl_number": "IS:4000 / MORTH 1905",
                        "category": "Supply Item",
                        "estimated_quantity": 18500.0,
                        "unit": "NOS",
                        "status": "ACTIVE"
                    }
                ]
            },
            # Tender 2: Stay Cable Strands (Revealing Date in future: SEALED BID TEST CASE!)
            {
                "tender_ref_no": "RFQ-AGIC-2026-BR-0102",
                "title": "Supply of High-Tensile Stay Cable Strands & Anchorage Assemblies for Krishna Iconic Cable-Stayed Bridge",
                "authority_name": "Amaravati Growth and Infrastructure Corporation Limited (AGIC)",
                "background": "Iconic landmark river crossing bridge over Krishna River connecting Amaravati core capital to NH-16.",
                "scope_of_work": "Supply of galvanised, waxed, and individually HDPE-sheathed parallel wire stay cables (1860 MPa grade) complete with adjustable anchorages, elastomeric dampers, and tension monitoring sensors.",
                "total_elements": 420,
                "element_types": 2,
                "max_weight_mt": 14.0,
                "min_weight_mt": 2.5,
                "avg_weight_mt": 7.5,
                "emd_amount": 0.0,
                "quotation_from_date": now - timedelta(days=5),
                "quotation_to_date": now + timedelta(days=20),
                "revealing_date": now + timedelta(days=21), # FUTURE: STRICTLY SEALED / ENCRYPTED!
                "quotation_valid_upto": now + timedelta(days=120),
                "validity_period": "120 Days from Quotation Opening",
                "opening_date": now + timedelta(days=21),
                "contact_person": "Er. K. V. Ramanathan",
                "contact_email": "ce.ramanathan@agic.ap.gov.in",
                "contact_phone": "+91 866 2459800",
                "office_address": "AGIC Bhavan, Sector 4, Capital Complex, Amaravati - 522503",
                "status": "PUBLISHED",
                "created_by": ce1.ce_id,
                "jobs": [
                    {
                        "job_code": "ITEM-01",
                        "job_name": "1860 MPa High-Tensile Stay Cable Strands (Galvanised & Sheathed)",
                        "job_description": "Supply of 15.7mm diameter 7-wire low relaxation stay strands as per fib Bulletin 30 with minimum breaking load of 279 kN per strand.",
                        "work_type": "Cable Stayed Bridge System",
                        "cl_number": "fib Bulletin 30 / PTI DC45.1",
                        "category": "Supply Item",
                        "estimated_quantity": 420.0,
                        "unit": "MT",
                        "status": "ACTIVE"
                    },
                    {
                        "job_code": "ITEM-02",
                        "job_name": "Fatigue-Resistant Stay Cable Anchorage Units & Split Wedges",
                        "job_description": "Supply of deck and pylon anchorage sockets complete with split wedges, internal elastomeric dampers, and anti-corrosion caps.",
                        "work_type": "Anchorages & Dampers",
                        "cl_number": "fib Bulletin 30 Cl. 6",
                        "category": "Supply Item",
                        "estimated_quantity": 88.0,
                        "unit": "SET",
                        "status": "ACTIVE"
                    }
                ]
            },
            # Tender 3: Precast Concrete U-Girders (Revealed in past)
            {
                "tender_ref_no": "RFQ-AGIC-2026-PC-0103",
                "title": "Manufacturing & Supply of Heavy Precast Prestressed Concrete U-Girders for Metro Express Corridor",
                "authority_name": "Amaravati Growth and Infrastructure Corporation Limited (AGIC)",
                "background": "High-speed transit corridor viaduct structural component procurement.",
                "scope_of_work": "Factory manufacturing with M60 grade high-performance self-compacting concrete, post-tensioned tendon stressing, steam curing, and specialized heavy transport delivery of 28m span U-Girders.",
                "total_elements": 360,
                "element_types": 2,
                "max_weight_mt": 165.0,
                "min_weight_mt": 4.5,
                "avg_weight_mt": 85.0,
                "emd_amount": 0.0,
                "quotation_from_date": now - timedelta(days=15),
                "quotation_to_date": now + timedelta(days=20),
                "revealing_date": now - timedelta(hours=12), # Past date: UNLOCKED
                "quotation_valid_upto": now + timedelta(days=90),
                "validity_period": "90 Days from Quotation Opening",
                "opening_date": now + timedelta(days=20),
                "contact_person": "Er. S. Radhakrishna Murthy",
                "contact_email": "rfq.officer@agic.gov.in",
                "contact_phone": "+91 866 2459811",
                "office_address": "AGIC Bhavan, Sector 4, Capital Complex, Amaravati - 522503",
                "status": "PUBLISHED",
                "created_by": ce2.ce_id,
                "jobs": [
                    {
                        "job_code": "ITEM-01",
                        "job_name": "M60 Grade Precast Prestressed Concrete U-Girder (28m Span)",
                        "job_description": "Factory casting, prestressing, curing, and delivery of 28m span single-track Metro viaduct U-Girders as per IRS Bridge Rules.",
                        "work_type": "Precast Prestressed Concrete",
                        "cl_number": "APSS Cl. 1300 / IRS Bridge Code",
                        "category": "Supply Item",
                        "estimated_quantity": 120.0,
                        "unit": "NOS",
                        "status": "ACTIVE"
                    },
                    {
                        "job_code": "ITEM-02",
                        "job_name": "Laminated Elastomeric Neoprene Viaduct Bearings",
                        "job_description": "Supply of heavy-duty elastomeric bearings with internal vulcanised steel reinforcing plates as per IRC:83 (Part II).",
                        "work_type": "Bearings & Substructures",
                        "cl_number": "IRC:83 (Part II)",
                        "category": "Supply Item",
                        "estimated_quantity": 240.0,
                        "unit": "NOS",
                        "status": "ACTIVE"
                    }
                ]
            },
            # Tender 4: Solar Lighting & Grid Infrastructure (Sealed Bids test case!)
            {
                "tender_ref_no": "RFQ-AGIC-2026-SOLAR-0104",
                "title": "Supply and Commissioning of Grid-Tied Solar Street Lighting & Battery Storage for Smart Capital Zone",
                "authority_name": "Amaravati Growth and Infrastructure Corporation Limited (AGIC)",
                "background": "Green energy and sustainable lighting deployment across smart city public roads.",
                "scope_of_work": "Supply, testing, and delivery of 120W all-in-one solar LED luminaire units with integrated MPPT controllers, LiFePO4 battery modules, and central IoT telemetry.",
                "total_elements": 1500,
                "element_types": 2,
                "max_weight_mt": 0.08,
                "min_weight_mt": 0.02,
                "avg_weight_mt": 0.04,
                "emd_amount": 0.0,
                "quotation_from_date": now - timedelta(days=2),
                "quotation_to_date": now + timedelta(days=25),
                "revealing_date": now + timedelta(days=26), # FUTURE: STRICTLY SEALED
                "quotation_valid_upto": now + timedelta(days=90),
                "validity_period": "90 Days from Quotation Opening",
                "opening_date": now + timedelta(days=26),
                "contact_person": "Er. S. Radhakrishna Murthy",
                "contact_email": "rfq.officer@agic.gov.in",
                "contact_phone": "+91 866 2459811",
                "office_address": "AGIC Bhavan, Sector 4, Capital Complex, Amaravati - 522503",
                "status": "PUBLISHED",
                "created_by": ce2.ce_id,
                "jobs": [
                    {
                        "job_code": "ITEM-01",
                        "job_name": "120W High-Efficiency Integrated Solar LED Street Lights",
                        "job_description": "All-in-one luminaire with monocrystalline PV panel, 160 lm/W high-power LEDs, smart dusk-to-dawn sensor, and IP66 die-cast aluminum housing.",
                        "work_type": "Renewable Energy & Lighting",
                        "cl_number": "MNRE / APSEEDCO Technical Standards",
                        "category": "Supply Item",
                        "estimated_quantity": 1500.0,
                        "unit": "NOS",
                        "status": "ACTIVE"
                    },
                    {
                        "job_code": "ITEM-02",
                        "job_name": "Lithium Ferro Phosphate (LiFePO4) Battery Packs 24V 60Ah",
                        "job_description": "Deep-cycle LiFePO4 battery pack with built-in intelligent Battery Management System (BMS) with over 3000 cycles at 80% DOD.",
                        "work_type": "Energy Storage Systems",
                        "cl_number": "IEC 62133 / BIS 16046",
                        "category": "Supply Item",
                        "estimated_quantity": 1500.0,
                        "unit": "NOS",
                        "status": "ACTIVE"
                    }
                ]
            }
        ]

        created_tenders = []
        for t_data in tenders_data:
            jobs_list = t_data.pop("jobs", [])
            tender = RFQTender(**t_data)
            db.add(tender)
            db.flush()

            created_jobs = []
            for j_data in jobs_list:
                job = RFQJob(tender_id=tender.tender_id, **j_data)
                db.add(job)
                db.flush()
                created_jobs.append(job)

            # Sample RFQ document attachment
            doc = TenderDocument(
                tender_id=tender.tender_id,
                document_type="RFQ_DOCUMENT",
                file_name=f"{tender.tender_ref_no}_Technical_Specs.pdf",
                file_path="/uploads/sample_rfq_spec.pdf",
                file_size_kb=450,
                uploaded_by=tender.created_by
            )
            db.add(doc)

            # Sample Paper Clipping attachment
            paper_doc = TenderDocument(
                tender_id=tender.tender_id,
                document_type="PAPER_CLIPPING",
                file_name=f"{tender.tender_ref_no}_Newspaper_Notice.png",
                file_path="/uploads/sample_paper_clipping.png",
                file_size_kb=320,
                uploaded_by=tender.created_by
            )
            db.add(paper_doc)

            tender.jobs_cache = created_jobs
            created_tenders.append(tender)

        db.commit()
        for t in created_tenders:
            db.refresh(t)
            print(f"[OK] Created RFQ Tender: {t.tender_ref_no} - {t.title[:55]}... ({len(t.jobs_cache)} items)")

        # 5. Seed Vendor Quotations (Applications)
        # Tender 1 Submissions (Revealed in past: L1 comparison active!)
        t1 = created_tenders[0]
        t1_jobs = t1.jobs_cache

        # Quotation 1: L&T on Tender 1 (Quotes ₹ 6,43,00,000 -> L1)
        app1 = Application(
            tender_id=t1.tender_id,
            applicant_id=vendors[0].applicant_id, # L&T
            application_no=f"Q-AGIC-{t1.tender_id}-001",
            covering_letter_date=now.date() - timedelta(days=3),
            signatory_name="Er. S. N. Subrahmanyan",
            signatory_designation="Chairman & Managing Director",
            quoted_amount=64300000.0,
            valid_upto=now + timedelta(days=90),
            min_supply_time="30 Days",
            remarks="We offer complete factory-manufactured E350BR steel girders and pot bearings with full ultrasonic NDT certification.",
            status="SUBMITTED",
            submitted_at=now - timedelta(days=3)
        )
        db.add(app1)
        db.flush()

        # Job 1.1: 850 MT @ ₹ 68,000 = ₹ 5,78,00,000
        # Job 1.2: 64 NOS @ ₹ 45,000 = ₹ 28,80,000
        # Job 1.3: 18500 NOS @ ₹ 195 = ₹ 36,07,500
        # Total = ₹ 6,42,87,500 (~6.43 Cr)
        rates_app1 = [68000.0, 45000.0, 195.0]
        for idx, j in enumerate(t1_jobs):
            q_rate = rates_app1[idx]
            q_amt = float(j.estimated_quantity) * q_rate
            aj = ApplicationJob(
                application_id=app1.application_id,
                job_id=j.job_id,
                quoted_amount=q_amt,
                valid_upto=now + timedelta(days=90),
                min_supply_time="30 Days",
                remarks=f"Supplying IS certified {j.job_name}"
            )
            db.add(aj)
            p_item = TechnicalProposalItem(
                application_id=app1.application_id,
                job_id=j.job_id,
                sl_no=idx + 1,
                item_description=j.job_name,
                unit=j.unit,
                quantity=float(j.estimated_quantity),
                rate_per_unit=q_rate,
                amount=q_amt,
                valid_upto=now + timedelta(days=90),
                min_supply_time="30 Days",
                remarks="High precision fabrication conforming to EN 10204 3.1"
            )
            db.add(p_item)

        # Capability for L&T
        cap1 = TechnicalFinancialCapability(
            application_id=app1.application_id,
            sl_no=1,
            work_description="Design and fabrication of 12,000 MT steel superstructure for Mumbai Trans Harbour Link (MTHL)",
            client_name="MMRDA / Government of Maharashtra",
            cost_lakhs=48500.0,
            financial_year="2023-24"
        )
        db.add(cap1)

        # Quotation 2: Tata Advanced on Tender 1 (Quotes ₹ 6,78,00,000 -> L2)
        app2 = Application(
            tender_id=t1.tender_id,
            applicant_id=vendors[1].applicant_id, # Tata
            application_no=f"Q-AGIC-{t1.tender_id}-002",
            covering_letter_date=now.date() - timedelta(days=3),
            signatory_name="Banmali Agrawala",
            signatory_designation="Managing Director",
            quoted_amount=67800000.0,
            valid_upto=now + timedelta(days=90),
            min_supply_time="45 Days",
            remarks="Direct mill sourced plates with advanced corrosion protection coating.",
            status="SUBMITTED",
            submitted_at=now - timedelta(days=3)
        )
        db.add(app2)
        db.flush()

        rates_app2 = [72000.0, 48000.0, 210.0]
        for idx, j in enumerate(t1_jobs):
            q_rate = rates_app2[idx]
            q_amt = float(j.estimated_quantity) * q_rate
            aj = ApplicationJob(
                application_id=app2.application_id,
                job_id=j.job_id,
                quoted_amount=q_amt,
                valid_upto=now + timedelta(days=90),
                min_supply_time="45 Days",
                remarks="Tata Steel Jamshedpur sourced steel plates"
            )
            db.add(aj)
            p_item = TechnicalProposalItem(
                application_id=app2.application_id,
                job_id=j.job_id,
                sl_no=idx + 1,
                item_description=j.job_name,
                unit=j.unit,
                quantity=float(j.estimated_quantity),
                rate_per_unit=q_rate,
                amount=q_amt,
                valid_upto=now + timedelta(days=90),
                min_supply_time="45 Days",
                remarks="Tata Structura Grade E350BR"
            )
            db.add(p_item)

        # Quotation 3: MEIL on Tender 1 (Quotes ₹ 6,95,00,000 -> L3)
        app3 = Application(
            tender_id=t1.tender_id,
            applicant_id=vendors[3].applicant_id, # MEIL
            application_no=f"Q-AGIC-{t1.tender_id}-003",
            covering_letter_date=now.date() - timedelta(days=2),
            signatory_name="P. V. Krishna Reddy",
            signatory_designation="Managing Director",
            quoted_amount=69500000.0,
            valid_upto=now + timedelta(days=90),
            min_supply_time="30 Days",
            remarks="Quotation for full scope with on-site erection support.",
            status="SUBMITTED",
            submitted_at=now - timedelta(days=2)
        )
        db.add(app3)
        db.flush()

        rates_app3 = [74000.0, 51000.0, 215.0]
        for idx, j in enumerate(t1_jobs):
            q_rate = rates_app3[idx]
            q_amt = float(j.estimated_quantity) * q_rate
            aj = ApplicationJob(
                application_id=app3.application_id,
                job_id=j.job_id,
                quoted_amount=q_amt,
                valid_upto=now + timedelta(days=90),
                min_supply_time="30 Days",
                remarks="MEIL Heavy Engineering Div"
            )
            db.add(aj)
            p_item = TechnicalProposalItem(
                application_id=app3.application_id,
                job_id=j.job_id,
                sl_no=idx + 1,
                item_description=j.job_name,
                unit=j.unit,
                quantity=float(j.estimated_quantity),
                rate_per_unit=q_rate,
                amount=q_amt,
                valid_upto=now + timedelta(days=90),
                min_supply_time="30 Days",
                remarks="Full composite guarantee"
            )
            db.add(p_item)

        # Tender 2 Submissions (Revealing Date in FUTURE: STRICTLY SEALED BIDS TEST CASE!)
        t2 = created_tenders[1]
        t2_jobs = t2.jobs_cache

        # Quotation 4 on Tender 2 (Navayuga)
        app4 = Application(
            tender_id=t2.tender_id,
            applicant_id=vendors[2].applicant_id, # Navayuga
            application_no=f"Q-AGIC-{t2.tender_id}-001",
            covering_letter_date=now.date() - timedelta(days=1),
            signatory_name="Chinta Sridhar",
            signatory_designation="Managing Director",
            quoted_amount=78200000.0,
            valid_upto=now + timedelta(days=120),
            min_supply_time="60 Days",
            remarks="Specialized stay cable supply package with European technical partnership.",
            status="SUBMITTED",
            submitted_at=now - timedelta(days=1)
        )
        db.add(app4)
        db.flush()

        for idx, j in enumerate(t2_jobs):
            q_rate = 145000.0 if idx == 0 else 195000.0
            q_amt = float(j.estimated_quantity) * q_rate
            aj = ApplicationJob(
                application_id=app4.application_id,
                job_id=j.job_id,
                quoted_amount=q_amt,
                valid_upto=now + timedelta(days=120),
                min_supply_time="60 Days"
            )
            db.add(aj)
            p_item = TechnicalProposalItem(
                application_id=app4.application_id,
                job_id=j.job_id,
                sl_no=idx + 1,
                item_description=j.job_name,
                unit=j.unit,
                quantity=float(j.estimated_quantity),
                rate_per_unit=q_rate,
                amount=q_amt,
                valid_upto=now + timedelta(days=120),
                min_supply_time="60 Days"
            )
            db.add(p_item)

        # Quotation 5 on Tender 2 (MEIL)
        app5 = Application(
            tender_id=t2.tender_id,
            applicant_id=vendors[3].applicant_id, # MEIL
            application_no=f"Q-AGIC-{t2.tender_id}-002",
            covering_letter_date=now.date() - timedelta(days=1),
            signatory_name="P. V. Krishna Reddy",
            signatory_designation="Managing Director",
            quoted_amount=81400000.0,
            valid_upto=now + timedelta(days=120),
            min_supply_time="45 Days",
            remarks="Stay cables with factory calibrated dynamic dampers.",
            status="SUBMITTED",
            submitted_at=now - timedelta(days=1)
        )
        db.add(app5)
        db.flush()

        for idx, j in enumerate(t2_jobs):
            q_rate = 152000.0 if idx == 0 else 200000.0
            q_amt = float(j.estimated_quantity) * q_rate
            aj = ApplicationJob(
                application_id=app5.application_id,
                job_id=j.job_id,
                quoted_amount=q_amt,
                valid_upto=now + timedelta(days=120),
                min_supply_time="45 Days"
            )
            db.add(aj)
            p_item = TechnicalProposalItem(
                application_id=app5.application_id,
                job_id=j.job_id,
                sl_no=idx + 1,
                item_description=j.job_name,
                unit=j.unit,
                quantity=float(j.estimated_quantity),
                rate_per_unit=q_rate,
                amount=q_amt,
                valid_upto=now + timedelta(days=120),
                min_supply_time="45 Days"
            )
            db.add(p_item)

        db.commit()

        print("==================================================================")
        print("[OK] Database successfully populated with realistic mock data!")
        print("==================================================================")
        print("\nLogin Credentials for Testing:")
        print("------------------------------------------------------------------")
        print("1. Chief Engineer (CE) Admin:")
        print("   Email:    ce.ramanathan@agic.ap.gov.in")
        print("   Mobile:   9876543210")
        print("   Password: CE@1234")
        print("\n2. Registered Vendors:")
        print("   * L&T Heavy Engineering:      infra.projects@lnt.com     (Pass: Vendor@1234, Mob: 9876540001)")
        print("   * Tata Advanced Materials:    sales@tataadvanced.com     (Pass: Vendor@1234, Mob: 9876540002)")
        print("   * Navayuga Engineering:       tenders@navayuga.com       (Pass: Vendor@1234, Mob: 9876540003)")
        print("   * Megha Engineering (MEIL):   commercial@meil.in         (Pass: Vendor@1234, Mob: 9876540004)")
        print("------------------------------------------------------------------")

    except Exception as e:
        db.rollback()
        print(f"Error during re-seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    reset_and_seed()
