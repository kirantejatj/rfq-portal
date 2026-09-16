# RFQ Portal — Complete Project File Inventory & Architecture Directory

> **Project Name**: RFQ Portal (Government of Andhra Pradesh / AGIC)  
> **Repository**: [https://github.com/kirantejatj/rfq-portal.git](https://github.com/kirantejatj/rfq-portal.git)  
> **Root Directory**: `C:\Users\Appadmin\.gemini\antigravity\scratch\rfq-portal`  
> **Stack**: Python FastAPI, PostgreSQL (SQLAlchemy + Pydantic), React (Vite + Tailwind CSS + Lucide Icons)

---

## 📑 Table of Contents
1. [Root System Files & Automation Scripts](#1-root-system-files--automation-scripts)
2. [Backend Architecture & Files (`backend/`)](#2-backend-architecture--files-backend)
   - [Core Configuration & Security (`backend/app/core/`)](#21-core-configuration--security)
   - [Database Models & ORM Schema (`backend/app/models/`)](#22-database-models--orm-schema)
   - [Pydantic Request/Response Schemas (`backend/app/schemas/`)](#23-pydantic-requestresponse-schemas)
   - [API Routers & Business Logic (`backend/app/routers/`)](#24-api-routers--business-logic)
   - [Entrypoint & Database Seeding (`backend/`)](#25-entrypoint--database-seeding)
3. [Frontend Architecture & Files (`frontend/`)](#3-frontend-architecture--files-frontend)
   - [Configuration & Build Setup (`frontend/`)](#31-configuration--build-setup)
   - [Core API Client & Authentication State (`frontend/src/`)](#32-core-api-client--authentication-state)
   - [Reusable UI Components (`frontend/src/components/`)](#33-reusable-ui-components)
   - [Public & Authentication Pages (`frontend/src/pages/auth/`)](#34-public--authentication-pages)
   - [Vendor Portal Pages (`frontend/src/pages/applicant/`)](#35-vendor-portal-pages)
   - [Officer Portal Pages (`frontend/src/pages/ce/`)](#36-officer-portal-pages)
   - [Developer API Workbench (`frontend/src/pages/admin/`)](#37-developer-api-workbench)
4. [Master Documentation & Knowledge Transfer Artifacts](#4-master-documentation--knowledge-transfer-artifacts)
5. [Database Schema & Table Summary](#5-database-schema--table-summary)

---

## 1. Root System Files & Automation Scripts

| File Path | Purpose & What It Contains |
| :--- | :--- |
| [`START_PORTAL.bat`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/START_PORTAL.bat) | **One-Click Startup Script**: Batch script that checks and starts the PostgreSQL database, launches the FastAPI backend on port `8000`, and launches the Vite React frontend on port `5173`. Opens the browser automatically. |
| [`STOP_PORTAL.bat`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/STOP_PORTAL.bat) | **One-Click Shutdown Script**: Gracefully terminates background Python (uvicorn) and Node.js (Vite) processes running the portal. |
| [`SYSTEM_DESIGN_AND_DB_DOCUMENTATION.md`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/SYSTEM_DESIGN_AND_DB_DOCUMENTATION.md) | **Architecture Specification**: Complete markdown document outlining PostgreSQL table structures, foreign keys, lifecycle states, authentication mechanisms, and API design. |
| [`AGIC_RFQ_Portal_Complete_Master_Documentation.html`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/AGIC_RFQ_Portal_Complete_Master_Documentation.html) | **Master HTML Documentation**: Beautiful offline standalone HTML reference manual including schema diagrams, sequence flows, workflows, and system architecture. |
| [`AGIC_RFQ_Portal_KT_and_User_Guide.html`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/AGIC_RFQ_Portal_KT_and_User_Guide.html) | **Knowledge Transfer & User Manual**: Interactive HTML user guide for Vendors and Officers with role-based walkthroughs, step-by-step submission instructions, and FAQs. |
| [`RFQ_Portal_Design_and_Architecture_Documentation.html`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/RFQ_Portal_Design_and_Architecture_Documentation.html) | **Design & Architecture Visual Guide**: Formatted HTML document covering engineering designs, component interactions, and state machines. |

---

## 2. Backend Architecture & Files (`backend/`)

### 2.1 Core Configuration & Security
Located at: `backend/app/core/`

| File Path | Purpose & What It Contains |
| :--- | :--- |
| [`backend/app/core/config.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/app/core/config.py) | **Environment & App Settings**: Pydantic BaseSettings class loading database connection strings (`DATABASE_URL`), JWT secret key (`SECRET_KEY`), algorithm (`HS256`), token expiration time, upload folder paths (`UPLOAD_DIR`), and project metadata. |
| [`backend/app/core/database.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/app/core/database.py) | **Database Connection Engine**: Initializes SQLAlchemy engine for PostgreSQL, configures `sessionmaker` (`SessionLocal`), sets up declarative `Base`, and exports the `get_db` dependency for route injection. |
| [`backend/app/core/security.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/app/core/security.py) | **Cryptography & Token Generation**: Password hashing and verification using `passlib.context.CryptContext` with `bcrypt`. Generates signed JWT bearer tokens (`create_access_token`) with role, subject, and expiry timestamps. |
| [`backend/app/core/dependencies.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/app/core/dependencies.py) | **RBAC Auth Guards & Middleware**: Dependency injectors: `get_current_user` (decodes JWT and loads user model), `require_ce` (restricts access to Chief Engineers/Officers), `require_applicant` (restricts access to Vendors), and `require_super_admin`. |

---

### 2.2 Database Models & ORM Schema
Located at: `backend/app/models/`

| File Path | Purpose & What It Contains |
| :--- | :--- |
| [`backend/app/models/schema.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/app/models/schema.py) | **SQLAlchemy Database Models**: Defines all relational tables: <br>• `CEUser` (Officer accounts with designation & credentials)<br>• `Applicant` (Vendor profiles with `vendor_type`, GSTIN, PAN, turnover, experience)<br>• `ApplicantDocument` (Vendor uploaded certificates)<br>• `OTPVerification` (One-time password audit records)<br>• `RFQTender` (RFQ definitions with `quotation_valid_upto`, `validity_period`, dates, budgets, creator ID)<br>• `RFQJob` (Granular RFQ Items with `category` ['Supply Item'/'Only Rate'], `unit_rate`, `estimated_quantity`, `amount`)<br>• `TenderDocument` (Official attachments/specifications)<br>• `Application` (Vendor quotation submissions with `quoted_amount`, covering letter, status)<br>• `ApplicationJob` (Vendor itemized selections and custom amounts)<br>• `TechnicalFinancialCapability` (Annexure II past works)<br>• `ApplicationProposalItem` (Annexure III line item price breakup)<br>• `EMDPayment` (Earnest Money Deposit references)<br>• `ApplicationDocument` (Quotation attachments)<br>• `ApplicationStatusHistory` (Audit trail of status changes)<br>• `Clarification` (Pre-bid vendor queries and officer replies). |

---

### 2.3 Pydantic Request/Response Schemas
Located at: `backend/app/schemas/`

| File Path | Purpose & What It Contains |
| :--- | :--- |
| [`backend/app/schemas/auth.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/app/schemas/auth.py) | **Auth Payloads**: Pydantic schemas for OTP generation (`SendOTPRequest`), verification (`VerifyOTPRequest`), vendor registration (`ApplicantRegisterRequest` with `vendor_type`), vendor login (`ApplicantLoginRequest`), officer login (`CELoginRequest`), and JWT token response (`TokenResponse`). |
| [`backend/app/schemas/tender.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/app/schemas/tender.py) | **RFQ & Items Payloads**: Validation models for RFQ Item creation/output (`RFQJobCreate`, `RFQJobOut` with `category`, `unit_rate`, `amount`), RFQ creation/update (`TenderCreate`, `TenderUpdate` with `quotation_valid_upto`, `validity_period`), and full RFQ response (`TenderOut`). |
| [`backend/app/schemas/application.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/app/schemas/application.py) | **Quotation Submission Payloads**: Validation models for quotation submission (`ApplicationSubmitRequest`), status change (`ApplicationStatusUpdate`), Annexure II (`CapabilityItemSchema`), Annexure III price breakup (`ProposalItemSchema`), EMD details (`EMDPaymentSchema`), and comprehensive response model (`ApplicationOut`). |
| [`backend/app/schemas/clarification.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/app/schemas/clarification.py) | **Clarification Payloads**: Models for asking pre-bid queries (`ClarificationCreate`), answering queries (`ClarificationReply`), and public clarification list (`ClarificationOut`). |

---

### 2.4 API Routers & Business Logic
Located at: `backend/app/routers/`

| File Path | Purpose & What It Contains |
| :--- | :--- |
| [`backend/app/routers/auth.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/app/routers/auth.py) | **Authentication Endpoints**: <br>• `POST /api/auth/applicant/request-otp`<br>• `POST /api/auth/applicant/verify-otp`<br>• `POST /api/auth/applicant/register` (Stores `vendor_type` & marks eligibility)<br>• `POST /api/auth/applicant/login`<br>• `POST /api/auth/ce/login` (Officer authentication)<br>• `GET /api/auth/me` (Returns current user profile + `is_eligible` calculation)<br>• `POST /api/auth/applicant/{id}/documents` (Profile document uploads). |
| [`backend/app/routers/tenders.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/app/routers/tenders.py) | **RFQ Lifecycle Endpoints**: <br>• `GET /api/tenders` (List published/active RFQs with search & category filters)<br>• `GET /api/tenders/{id}` (Detailed view of RFQ + RFQ Items + validity dates)<br>• `POST /api/tenders` (Officer creates new RFQ with RFQ Items and validity period)<br>• `PUT /api/tenders/{id}` (Update RFQ metadata)<br>• `POST /api/tenders/{id}/jobs` (Add RFQ Item)<br>• `DELETE /api/tenders/{id}/jobs/{job_id}` (Delete RFQ Item)<br>• `PATCH /api/tenders/{id}/status` (Publish, extend, or close RFQ)<br>• `POST /api/tenders/{id}/documents` (Attach official documents). |
| [`backend/app/routers/applications.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/app/routers/applications.py) | **Quotation Submissions & Officer Review**: <br>• `POST /api/applications` (Vendor submits quotation: **validates vendor eligibility**, saves custom amounts, Annexures II & III, and EMD)<br>• `GET /api/applications/my` (Vendor views own submitted quotations)<br>• `GET /api/applications/tender/{id}` (**Officer Authorization Guard**: Enforces that only the creator Officer can view submissions; returns `403 Forbidden` to other officers)<br>• `GET /api/applications/{id}` (Detailed quotation dossier view with role checks)<br>• `PATCH /api/applications/{id}/status` (**Officer Evaluation Decision**: Creator Officer accepts/rejects quotation and logs audit trail)<br>• `POST /api/applications/{id}/documents` (Upload submission attachments)<br>• `GET /api/applications/{id}/download-all` (Compiles all vendor and quotation documents into a single dynamic ZIP archive). |
| [`backend/app/routers/clarifications.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/app/routers/clarifications.py) | **Clarifications / Pre-Bid Queries**: <br>• `GET /api/clarifications/tender/{id}` (List public Q&A for an RFQ)<br>• `POST /api/clarifications` (Vendor submits a query)<br>• `POST /api/clarifications/{id}/reply` (Officer posts official reply). |
| [`backend/app/routers/stats.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/app/routers/stats.py) | **Analytics & Scoped Dashboard Metrics**: <br>• `GET /api/stats/ce` (Calculates RFQs raised, total quotations received, pending reviews, and approved awards **strictly scoped to the logged-in Officer**)<br>• `GET /api/stats/applicant` (Calculates quotations submitted, under review, and awards for the vendor). |

---

### 2.5 Entrypoint & Database Seeding
Located at: `backend/`

| File Path | Purpose & What It Contains |
| :--- | :--- |
| [`backend/app/main.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/app/main.py) | **FastAPI Application Entry**: Configures CORS middleware, mounts `/uploads` static file server, registers all routers, customizes OpenAPI metadata, and mounts Scalar API reference documentation (`/scalar`). |
| [`backend/run.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/run.py) | **Uvicorn Server Launcher**: Boots `app.main:app` on host `0.0.0.0`, port `8000` with auto-reloading enabled. |
| [`backend/seed.py`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/backend/seed.py) | **Database Seeding Utility**: Pre-populates PostgreSQL with initial Officers, sample eligible Vendors, active RFQs with RFQ Items, and submitted quotation records for instant demo/testing. |

---

## 3. Frontend Architecture & Files (`frontend/`)

### 3.1 Configuration & Build Setup
Located at: `frontend/`

| File Path | Purpose & What It Contains |
| :--- | :--- |
| [`frontend/package.json`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/package.json) | **NPM Package Manifest**: Defines project dependencies (React 18, React Router v6, Axios, Lucide-React, TailwindCSS) and scripts (`dev`, `build`, `preview`). |
| [`frontend/vite.config.js`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/vite.config.js) | **Vite Build Configuration**: Configures React plugin, development server port (`5173`), and build bundling targets. |
| [`frontend/tailwind.config.js`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/tailwind.config.js) | **Tailwind Design Theme**: Defines government-themed color palettes (`gov-50` to `gov-900`, gold accents, font families, and container layouts). |
| [`frontend/postcss.config.js`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/postcss.config.js) | **PostCSS Pipeline**: Connects TailwindCSS and Autoprefixer to Vite CSS transformation engine. |
| [`frontend/index.html`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/index.html) | **Single Page HTML Host**: Root HTML file loading Google Fonts (Inter, Outfit), favicon, and mounting `<div id="root">`. |

---

### 3.2 Core API Client & Authentication State
Located at: `frontend/src/`

| File Path | Purpose & What It Contains |
| :--- | :--- |
| [`frontend/src/main.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/main.jsx) | **React DOM Root**: Bootstraps the React tree, wraps in `BrowserRouter`, and mounts into DOM. |
| [`frontend/src/App.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/App.jsx) | **Application Router & Layout**: Defines all application routes, role-based route guards (`PrivateRoute`), global notification banners, and navigation wrappers (`Navbar`, `Footer`). |
| [`frontend/src/api/client.js`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/api/client.js) | **Axios HTTP Client**: Centralized HTTP client configured with baseURL (`http://localhost:8000/api`). Attaches Bearer JWT from `localStorage` on every request and handles global 401/403 errors. |
| [`frontend/src/context/AuthContext.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/context/AuthContext.jsx) | **Authentication Context Provider**: Global React Context managing user authentication state, current user profile (`user`), active role (`APPLICANT`, `CE`, `SUPER_ADMIN`), login, logout, and token persistence. |
| [`frontend/src/index.css`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/index.css) & [`frontend/src/App.css`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/App.css) | **Global Styles**: Tailwind layer imports, custom scrollbar styling, glassmorphic styles, print stylesheets, and animation keyframes. |

---

### 3.3 Reusable UI Components
Located at: `frontend/src/components/`

| File Path | Purpose & What It Contains |
| :--- | :--- |
| [`frontend/src/components/Navbar.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/components/Navbar.jsx) | **Primary Navigation Header**: Government portal branding (**RFQ Portal**), active RFQ browse link, contextual role-based buttons (Vendor Workspace, Officer Panel), user profile avatar, and logout trigger. Hidden developer workbench link. |
| [`frontend/src/components/Footer.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/components/Footer.jsx) | **Standard Government Footer**: Official AGIC / Andhra Pradesh government notices, quick navigation links, helpline contacts, and copyright information. |
| [`frontend/src/components/StatusBadge.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/components/StatusBadge.jsx) | **Visual Status Pill Component**: Dynamic color-coded status badges for RFQs (`PUBLISHED`, `CLOSED`, `DRAFT`) and Quotations (`SUBMITTED`, `UNDER_REVIEW`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`). |
| [`frontend/src/components/CountdownTimer.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/components/CountdownTimer.jsx) | **Live Submission Countdown**: Real-time timer showing Days, Hours, Minutes, and Seconds remaining until quotation deadline. Turns red when closing soon. |

---

### 3.4 Public & Authentication Pages
Located at: `frontend/src/pages/` and `frontend/src/pages/auth/`

| File Path | Purpose & What It Contains |
| :--- | :--- |
| [`frontend/src/pages/Home.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/pages/Home.jsx) | **Public Portal Landing Page**: Hero section with official state emblem, live stats counter (Active RFQs, Value in Crores, Registered Vendors), live search bar, category filters, and active RFQ cards. |
| [`frontend/src/pages/TenderDetails.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/pages/TenderDetails.jsx) | **RFQ Detailed Dossier Page**: Full public specification view: EMD requirements, **Quotation Validity Period**, **RFQ Items Schedule** (with `Supply Item` / `Only Rate` categories, unit rates, quantities), pre-bid Q&A thread, and "Quote for this RFQ" button. |
| [`frontend/src/pages/auth/ApplicantLogin.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/pages/auth/ApplicantLogin.jsx) | **Vendor Portal Login**: OTP-based and password-based login for Vendors. Quick test login credentials for one-click developer testing. |
| [`frontend/src/pages/auth/ApplicantRegister.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/pages/auth/ApplicantRegister.jsx) | **Vendor Registration Page**: Registration form enforcing selection of the 4 eligible vendor categories (`Manufacturer`, `Authorised Dealer`, `Authorised Distributor`, `Contractor`), mobile OTP verification, GSTIN, PAN, and credentials. |
| [`frontend/src/pages/auth/CELogin.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/pages/auth/CELogin.jsx) | **Officer Portal Login**: Secure departmental login for Chief Engineers and Executive Officers with designation verification. |

---

### 3.5 Vendor Portal Pages
Located at: `frontend/src/pages/applicant/`

| File Path | Purpose & What It Contains |
| :--- | :--- |
| [`frontend/src/pages/applicant/ApplicantDashboard.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/pages/applicant/ApplicantDashboard.jsx) | **Vendor Workspace Hub**: Displays Vendor Category badge, Eligibility status badge, submission metrics, quick links to active RFQs, and recent quotation statuses. |
| [`frontend/src/pages/applicant/MyApplications.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/pages/applicant/MyApplications.jsx) | **Submitted Quotations Matrix**: Tabular view of all quotations submitted by the logged-in vendor, custom quoted amounts (₹), submission timestamps, and current review states. |
| [`frontend/src/pages/applicant/SubmitQuotation.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/pages/applicant/SubmitQuotation.jsx) | **Multi-Step Quotation Submission Wizard**: <br>• **Eligibility Guard**: Warns/blocks ineligible vendors.<br>• **Step 1: Covering Letter**: Authorised signatory details & dates.<br>• **Step 2: RFQ Items Selection**: Line-by-line item selection with unit rate and auto-calculated amounts.<br>• **Step 3: Annexure II**: Past technical & financial works declarations.<br>• **Step 4: Annexure III**: Commercial proposal, itemized pricing breakdown, tax inclusion, and quotation validity affirmations.<br>• **Step 5: EMD & Documents**: EMD transaction reference and PDF document uploads. |

---

### 3.6 Officer Portal Pages
Located at: `frontend/src/pages/ce/`

| File Path | Purpose & What It Contains |
| :--- | :--- |
| [`frontend/src/pages/ce/CEDashboard.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/pages/ce/CEDashboard.jsx) | **Officer Executive Panel**: Summary of RFQs raised by the logged-in officer, quotation response counts, pending technical reviews, action shortcuts, and RFQ management table. |
| [`frontend/src/pages/ce/CreateTender.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/pages/ce/CreateTender.jsx) | **Raise New RFQ Form**: Interface for Officers to draft and publish RFQs: sets scope of work, budget, EMD, **Quotation Validity Period & Date**, and dynamically adds multiple **RFQ Items** (`Supply Item` vs `Only Rate`, Unit Rate, Quantity, Amount). |
| [`frontend/src/pages/ce/TenderSubmissions.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/pages/ce/TenderSubmissions.jsx) | **Quotation Submissions Matrix**: <br>• **Officer Authorization Guard**: Validates that only the Officer who raised this RFQ can access this page.<br>• Comparative evaluation table of all vendor quotations sorted by quoted price.<br>• Shows Vendor Category, Quoted Amount (₹), Submission Date, and Evaluation trigger. |
| [`frontend/src/pages/ce/ApplicationReview.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/pages/ce/ApplicationReview.jsx) | **Quotation Dossier & Evaluation Panel**: <br>• **Officer Authorization Guard**: 403 Forbidden protection.<br>• Full vendor profile (Category, Turnover, Experience, PAN/GSTIN).<br>• Line item pricing schedule breakdown.<br>• **Download All Documents ZIP** button.<br>• **Officer Evaluation Decision Box**: Change status (`ACCEPTED (L1 Award)`, `REJECTED`, `UNDER_REVIEW`), record audit remarks, and update database. |

---

### 3.7 Developer API Workbench
Located at: `frontend/src/pages/admin/`

| File Path | Purpose & What It Contains |
| :--- | :--- |
| [`frontend/src/pages/admin/ApiWorkbench.jsx`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/frontend/src/pages/admin/ApiWorkbench.jsx) | **Interactive Developer API Workbench**: Standalone developer console accessible directly at [`/developer`](http://localhost:5173/developer) and [`/api-explorer`](http://localhost:5173/api-explorer). Allows developers to inspect, test, and execute all backend REST endpoints directly with quick-login JWT tokens and JSON payload editors. |

---

## 4. Master Documentation & Knowledge Transfer Artifacts

| Document File | Format | Target Audience & Contents |
| :--- | :--- | :--- |
| [`SYSTEM_DESIGN_AND_DB_DOCUMENTATION.md`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/SYSTEM_DESIGN_AND_DB_DOCUMENTATION.md) | Markdown | **Developers & DBAs**: Database schema, DDL definitions, indexing strategies, entity relationships, and security protocols. |
| [`AGIC_RFQ_Portal_Complete_Master_Documentation.html`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/AGIC_RFQ_Portal_Complete_Master_Documentation.html) | Standalone HTML | **Technical Leads & Stakeholders**: Complete architectural breakdown, sequence diagrams, API reference, and deployment guide. |
| [`AGIC_RFQ_Portal_KT_and_User_Guide.html`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/AGIC_RFQ_Portal_KT_and_User_Guide.html) | Standalone HTML | **Vendors & Department Officers**: Step-by-step Knowledge Transfer (KT) guide with visual flowcharts, login guides, and submission walkthroughs. |
| [`RFQ_Portal_Design_and_Architecture_Documentation.html`](file:///C:/Users/Appadmin/.gemini/antigravity/scratch/rfq-portal/RFQ_Portal_Design_and_Architecture_Documentation.html) | Standalone HTML | **Executive Overview**: High-level design document and engineering specifications. |

---

## 5. Database Schema & Table Summary

| Table Name | Primary Key | Key Columns & Foreign Keys | Description |
| :--- | :--- | :--- | :--- |
| **`ce_users`** | `ce_id` | `name`, `mobile_no`, `email`, `password_hash`, `designation`, `role`, `is_active` | Departmental Officers (Chief Engineers, Executive Engineers) |
| **`applicants`** | `applicant_id` | `firm_name`, `mobile_no`, `vendor_type`, `registration_type`, `gstin`, `pan_no`, `turnover`, `work_experience` | Registered Vendors (Manufacturers, Dealers, Distributors, Contractors) |
| **`applicant_documents`**| `document_id` | `applicant_id` (FK), `document_type`, `file_name`, `file_path`, `file_size_kb` | Vendor profile attachments (Turnover certificate, PAN card) |
| **`otp_verifications`** | `otp_id` | `mobile_no`, `otp_code`, `purpose`, `is_verified`, `expires_at` | OTP logs for mobile authentication |
| **`rfq_tenders`** | `tender_id` | `tender_ref_no`, `title`, `created_by` (FK $\rightarrow$ `ce_users`), `quotation_valid_upto`, `validity_period`, `status`, `emd_amount` | RFQ records created and managed by Officers |
| **`rfq_jobs`** | `job_id` | `tender_id` (FK), `job_name`, `category` (`Supply Item`/`Only Rate`), `unit_rate`, `estimated_quantity`, `amount` | Partitioned RFQ Items under an RFQ |
| **`tender_documents`** | `tender_document_id`| `tender_id` (FK), `document_type`, `file_name`, `file_path` | Official tender documents and technical specs |
| **`applications`** | `application_id` | `tender_id` (FK), `applicant_id` (FK), `application_no`, `quoted_amount`, `status`, `remarks` | Vendor quotation submissions |
| **`application_jobs`** | `application_job_id` | `application_id` (FK), `job_id` (FK), `quoted_amount`, `remarks`, `status` | Vendor-selected RFQ Items & quoted rates |
| **`application_proposal_items`**| `proposal_item_id` | `application_id` (FK), `job_id` (FK), `item_description`, `quantity`, `unit`, `rate_per_unit`, `amount` | Annexure III line-by-line financial breakup |
| **`technical_financial_capabilities`**| `capability_id` | `application_id` (FK), `sl_no`, `work_description`, `client_name`, `cost_lakhs` | Annexure II past work experience declarations |
| **`emd_payments`** | `emd_id` | `application_id` (FK), `amount`, `payment_mode`, `transaction_ref` | Earnest Money Deposit payment records |
| **`application_status_history`**| `history_id` | `application_id` (FK), `old_status`, `new_status`, `changed_by_ce` (FK), `remarks` | Audit trail of all quotation status updates |
| **`clarifications`** | `clarification_id` | `tender_id` (FK), `applicant_id` (FK), `query_text`, `reply_text`, `status` | Pre-bid clarifications and officer responses |
