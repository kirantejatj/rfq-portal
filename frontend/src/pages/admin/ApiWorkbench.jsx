import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Terminal, Play, CheckCircle2, AlertCircle, RefreshCw, Key, Shield, User,
  FileCode, Database, Copy, Check, ExternalLink, Code2, Layers, Search,
  Sliders, ArrowRight, Eye, ChevronRight, Download, Server
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

const ENDPOINT_PRESETS = [
  // Authentication
  {
    id: 'auth-ce-login',
    category: 'Authentication',
    method: 'POST',
    path: '/api/auth/ce/login',
    title: 'CE Login',
    role: 'Public',
    desc: 'Authenticate as Chief Engineer and receive JWT Bearer token.',
    body: {
      mobile_no: '9876543210',
      password: 'ce123'
    }
  },
  {
    id: 'auth-applicant-login',
    category: 'Authentication',
    method: 'POST',
    path: '/api/auth/applicant/login',
    title: 'Applicant Login',
    role: 'Public',
    desc: 'Authenticate registered applicant with mobile & password.',
    body: {
      mobile_no: '9111222333',
      password: 'app123'
    }
  },
  {
    id: 'auth-request-otp',
    category: 'Authentication',
    method: 'POST',
    path: '/api/auth/applicant/request-otp',
    title: 'Request Mobile OTP',
    role: 'Public',
    desc: 'Generate a 6-digit OTP for applicant authentication/registration.',
    body: {
      mobile_no: '9888777666',
      purpose: 'LOGIN'
    }
  },
  {
    id: 'auth-verify-otp',
    category: 'Authentication',
    method: 'POST',
    path: '/api/auth/applicant/verify-otp',
    title: 'Verify Mobile OTP',
    role: 'Public',
    desc: 'Verify OTP code and authenticate applicant.',
    body: {
      mobile_no: '9888777666',
      otp_code: '123456',
      purpose: 'LOGIN'
    }
  },
  {
    id: 'auth-register',
    category: 'Authentication',
    method: 'POST',
    path: '/api/auth/applicant/register',
    title: 'Register New Applicant',
    role: 'Public',
    desc: 'Register new vendor/firm with turnover, experience, and credentials.',
    body: {
      mobile_no: '9555444333',
      firm_name: 'Deccan Infra Developers Pvt Ltd',
      registration_type: 'PVT_LTD',
      prime_line_business: 'Civil and Structural Bridge Construction',
      turnover: '₹185.50 Crores',
      work_experience: '15 Years in EPC Infrastructure & Highway Projects',
      postal_address: 'Plot 45, Auto Nagar, Vijayawada, AP',
      email: 'contact@deccaninfra.com',
      gstin: '37AABBD1234F1Z9',
      pan_no: 'AABBD1234F',
      password: 'password123'
    }
  },
  {
    id: 'auth-profile',
    category: 'Authentication',
    method: 'GET',
    path: '/api/auth/me',
    title: 'Get Current Profile (/me)',
    role: 'Authenticated (Any)',
    desc: 'Retrieve current logged-in user profile, roles, and company data.',
    body: null
  },

  // Tenders & Multi-Jobs
  {
    id: 'tenders-list',
    category: 'Tenders & Jobs',
    method: 'GET',
    path: '/api/tenders',
    title: 'List All Tenders',
    role: 'Public',
    desc: 'Retrieve all tenders with jobs, documents, and submission counts.',
    body: null
  },
  {
    id: 'tenders-get-single',
    category: 'Tenders & Jobs',
    method: 'GET',
    path: '/api/tenders/{tender_id}',
    title: 'Get Single Tender Detail',
    role: 'Public',
    desc: 'Retrieve tender specification, jobs list, and requirements by ID.',
    body: null,
    defaultParams: { tender_id: '1' }
  },
  {
    id: 'tenders-create',
    category: 'Tenders & Jobs',
    method: 'POST',
    path: '/api/tenders',
    title: 'Create RFQ Tender (with Multi-Jobs)',
    role: 'CE Required',
    desc: 'Create and publish a new RFQ tender with multi-job breakdown.',
    body: {
      tender_ref_no: 'AGIC/RFQ/ENG/2026/089',
      title: 'Construction of Multi-Span Precast Flyover and Grade Separators',
      authority_name: 'Amaravati Growth & Infrastructure Corp (AGIC)',
      background: 'Accelerated urban infrastructure connectivity in Capital City Core Region.',
      scope_of_work: 'Design, casting, transportation, and heavy lifting erection of PSC girders.',
      total_elements: 140,
      element_types: 'Prestressed Concrete I-Girders, Box Girders, Pier Caps',
      max_weight_mt: 85.0,
      min_weight_mt: 24.5,
      avg_weight_mt: 48.0,
      emd_amount: 500000.0,
      completion_period: '9 Months',
      contact_person: 'Er. K. V. Ramanathan, Chief Engineer',
      contact_email: 'ce.projects@agic.ap.gov.in',
      contact_phone: '+91 866 245 7890',
      office_address: 'AGIC Bhavan, MG Road, Vijayawada, Andhra Pradesh - 520010',
      status: 'PUBLISHED',
      jobs: [
        {
          job_code: 'JOB-01-FAB',
          job_name: 'PSC Girder Casting & Pre-Stressing',
          job_description: 'Supply of high grade M50 concrete and high tensile strands.',
          category: 'Fabrication',
          estimated_quantity: 80,
          unit: 'NOS',
          estimated_cost: 32000000.0,
          completion_period: '6 Months',
          status: 'ACTIVE'
        },
        {
          job_code: 'JOB-02-ERECT',
          job_name: 'Heavy Crane Launching & Bearing Placement',
          job_description: 'Hydraulic launching gantry operations across rail corridor.',
          category: 'Erection',
          estimated_quantity: 80,
          unit: 'NOS',
          estimated_cost: 18000000.0,
          completion_period: '4 Months',
          status: 'ACTIVE'
        }
      ]
    }
  },
  {
    id: 'tenders-add-job',
    category: 'Tenders & Jobs',
    method: 'POST',
    path: '/api/tenders/{tender_id}/jobs',
    title: 'Add Job to Tender',
    role: 'CE Required',
    desc: 'Append a new work package / job item to an existing tender.',
    body: {
      job_code: 'JOB-03-DECK',
      job_name: 'Composite Deck Slab Concreting & Wearing Coat',
      job_description: 'Reinforced concrete deck with bituminous mastic wearing course.',
      category: 'Surfacing',
      estimated_quantity: 4500,
      unit: 'SQM',
      estimated_cost: 7500000.0,
      completion_period: '2 Months',
      status: 'ACTIVE'
    },
    defaultParams: { tender_id: '1' }
  },
  {
    id: 'tenders-delete-job',
    category: 'Tenders & Jobs',
    method: 'DELETE',
    path: '/api/tenders/{tender_id}/jobs/{job_id}',
    title: 'Delete Job from Tender',
    role: 'CE Required',
    desc: 'Remove an individual job item from a tender.',
    body: null,
    defaultParams: { tender_id: '1', job_id: '3' }
  },
  {
    id: 'tenders-update-status',
    category: 'Tenders & Jobs',
    method: 'PATCH',
    path: '/api/tenders/{tender_id}/status?new_status=PUBLISHED',
    title: 'Update Tender Status',
    role: 'CE Required',
    desc: 'Change tender status (DRAFT, PUBLISHED, CLOSED, CANCELLED).',
    body: null,
    defaultParams: { tender_id: '1' }
  },

  // Applications & Quotations
  {
    id: 'app-submit',
    category: 'Applications & Quotations',
    method: 'POST',
    path: '/api/applications',
    title: 'Submit Quotation & Proposal',
    role: 'Applicant Required',
    desc: 'Submit full quotation proposal with custom rates, multi-job selections, and Annexures.',
    body: {
      tender_id: 1,
      covering_letter_date: '2026-09-15',
      signatory_name: 'Rajesh Varma',
      signatory_designation: 'Managing Director',
      quoted_amount: 48500000.0,
      remarks: 'Fully compliant with technical specifications and scheduled timeline.',
      selected_jobs: [
        {
          job_id: 1,
          quoted_amount: 31000000.0,
          remarks: 'Using 500T telescopic crane'
        },
        {
          job_id: 2,
          quoted_amount: 17500000.0,
          remarks: 'Turnkey erection package'
        }
      ],
      capabilities: [
        {
          sl_no: 1,
          work_description: 'Krishna River Outer Ring Road Bridge Flyover',
          client_name: 'AP R&B Department',
          cost_lakhs: 4200.0,
          financial_year: '2024-25'
        },
        {
          sl_no: 2,
          work_description: 'Elevated Corridor at Benz Circle Phase 2',
          client_name: 'NHAI',
          cost_lakhs: 3600.0,
          financial_year: '2023-24'
        }
      ],
      proposal_items: [
        {
          sl_no: 1,
          job_id: 1,
          item_description: 'Casting M50 Grade Prestressed Girders',
          unit: 'NOS',
          quantity: 80,
          rate_per_unit: 387500.0,
          amount: 31000000.0,
          remarks: 'Including high tensile stressing cables'
        },
        {
          sl_no: 2,
          job_id: 2,
          item_description: 'Launching & Precise Bearing Erection',
          unit: 'NOS',
          quantity: 80,
          rate_per_unit: 218750.0,
          amount: 17500000.0,
          remarks: 'Night launching blocks included'
        }
      ],
      emd: {
        amount: 500000.0,
        payment_mode: 'NEFT_RTGS',
        transaction_ref: 'SBI-RTGS-2026-998822',
        payment_date: '2026-09-15'
      }
    }
  },
  {
    id: 'app-my-list',
    category: 'Applications & Quotations',
    method: 'GET',
    path: '/api/applications/my',
    title: 'List My Applications',
    role: 'Applicant Required',
    desc: 'Retrieve all applications submitted by the logged-in applicant.',
    body: null
  },
  {
    id: 'app-tender-list',
    category: 'Applications & Quotations',
    method: 'GET',
    path: '/api/applications/tender/{tender_id}',
    title: 'List Tender Quotations (CE Review)',
    role: 'CE Required',
    desc: 'Retrieve all applicant submissions for a specific tender for CE review.',
    body: null,
    defaultParams: { tender_id: '1' }
  },
  {
    id: 'app-get-single',
    category: 'Applications & Quotations',
    method: 'GET',
    path: '/api/applications/{application_id}',
    title: 'Get Application Details',
    role: 'Authenticated (CE/Owner)',
    desc: 'Retrieve full application breakdown, Annexures II/III, documents, and audit history.',
    body: null,
    defaultParams: { application_id: '1' }
  },
  {
    id: 'app-download-zip',
    category: 'Applications & Quotations',
    method: 'GET',
    path: '/api/applications/{application_id}/download-all',
    title: 'Download All Documents (ZIP)',
    role: 'Authenticated (CE/Owner)',
    desc: 'Download a complete ZIP package containing all uploaded applicant documents.',
    body: null,
    defaultParams: { application_id: '1' }
  },
  {
    id: 'app-update-status',
    category: 'Applications & Quotations',
    method: 'PATCH',
    path: '/api/applications/{application_id}/status',
    title: 'Update Application Status & Review',
    role: 'CE Required',
    desc: 'Update quotation status (UNDER_REVIEW, ACCEPTED, REJECTED) with CE remarks.',
    body: {
      status: 'ACCEPTED',
      remarks: 'Technically qualified and competitive rates accepted.'
    },
    defaultParams: { application_id: '1' }
  },

  // Clarifications
  {
    id: 'clarifications-list',
    category: 'Clarifications',
    method: 'GET',
    path: '/api/clarifications/tender/{tender_id}',
    title: 'Get Tender Clarifications',
    role: 'Public',
    desc: 'Fetch all applicant questions and CE answers for a tender.',
    body: null,
    defaultParams: { tender_id: '1' }
  },
  {
    id: 'clarifications-ask',
    category: 'Clarifications',
    method: 'POST',
    path: '/api/clarifications',
    title: 'Ask Tender Clarification',
    role: 'Applicant Required',
    desc: 'Post a question regarding technical specifications or deadlines.',
    body: {
      tender_id: 1,
      question: 'Is mobilization advance available for initial casting yard setup?'
    }
  },
  {
    id: 'clarifications-answer',
    category: 'Clarifications',
    method: 'POST',
    path: '/api/clarifications/{clarification_id}/answer',
    title: 'Answer Clarification',
    role: 'CE Required',
    desc: 'Provide official CE reply to an applicant clarification request.',
    body: {
      answer: 'Mobilization advance of 10% will be granted against an unconditional Bank Guarantee.'
    },
    defaultParams: { clarification_id: '1' }
  },

  // Dashboard Stats
  {
    id: 'stats-ce',
    category: 'Dashboard Statistics',
    method: 'GET',
    path: '/api/stats/ce',
    title: 'Get CE Executive Stats',
    role: 'CE Required',
    desc: 'Aggregated metrics on tenders, applications, quoted totals, and EMD.',
    body: null
  },
  {
    id: 'stats-applicant',
    category: 'Dashboard Statistics',
    method: 'GET',
    path: '/api/stats/applicant',
    title: 'Get Applicant Dashboard Stats',
    role: 'Applicant Required',
    desc: 'Submission counts, under-review items, and acceptance stats for applicant.',
    body: null
  }
];

export default function ApiWorkbench() {
  const [activeTab, setActiveTab] = useState('workbench'); // 'workbench' | 'swagger' | 'redoc' | 'scalar' | 'openapi'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem('rfq_token') || '');
  const [activeUserRole, setActiveUserRole] = useState(() => localStorage.getItem('rfq_role') || 'NONE');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMsg, setAuthMsg] = useState('');

  // Active Runner State
  const [selectedPresetId, setSelectedPresetId] = useState('stats-ce');
  const [httpMethod, setHttpMethod] = useState('GET');
  const [requestPath, setRequestPath] = useState('/api/stats/ce');
  const [requestBodyText, setRequestBodyText] = useState('');
  const [pathVariables, setPathVariables] = useState({
    tender_id: '1',
    application_id: '1',
    job_id: '1',
    clarification_id: '1',
    applicant_id: '1'
  });

  // Runner Output State
  const [isRunning, setIsRunning] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseHeaders, setResponseHeaders] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [responseDuration, setResponseDuration] = useState(null);
  const [responseError, setResponseError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Live Database Quick Inspector State
  const [dbOverview, setDbOverview] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);

  // Initial load
  useEffect(() => {
    loadDbOverview();
  }, []);

  const loadDbOverview = async () => {
    setDbLoading(true);
    try {
      const tendersRes = await axios.get(`${API_BASE}/api/tenders`);
      setDbOverview({
        tenders: tendersRes.data,
        tendersCount: tendersRes.data.length,
        jobsCount: tendersRes.data.reduce((acc, t) => acc + (t.jobs ? t.jobs.length : 0), 0)
      });
    } catch (e) {
      console.warn('Could not load DB overview:', e);
    } finally {
      setDbLoading(false);
    }
  };

  const handleQuickLogin = async (roleType, credentials) => {
    setAuthLoading(true);
    setAuthMsg('');
    try {
      const url = roleType === 'CE' ? `${API_BASE}/api/auth/ce/login` : `${API_BASE}/api/auth/applicant/login`;
      const res = await axios.post(url, credentials);
      const { access_token, role, name } = res.data;
      setToken(access_token);
      setActiveUserRole(role);
      localStorage.setItem('rfq_token', access_token);
      localStorage.setItem('rfq_role', role);
      setAuthMsg(`Logged in as ${name} (${role})`);
    } catch (err) {
      setAuthMsg(`Login failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleClearAuth = () => {
    setToken('');
    setActiveUserRole('NONE');
    localStorage.removeItem('rfq_token');
    localStorage.removeItem('rfq_role');
    setAuthMsg('Authentication cleared');
  };

  const selectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setHttpMethod(preset.method);
    
    // Replace default variables in path
    let resolvedPath = preset.path;
    Object.keys(pathVariables).forEach((k) => {
      resolvedPath = resolvedPath.replace(`{${k}}`, pathVariables[k]);
    });
    setRequestPath(resolvedPath);

    if (preset.body) {
      setRequestBodyText(JSON.stringify(preset.body, null, 2));
    } else {
      setRequestBodyText('');
    }

    setResponseStatus(null);
    setResponseData(null);
    setResponseHeaders(null);
    setResponseError(null);
  };

  const handlePathVariableChange = (key, val) => {
    const updated = { ...pathVariables, [key]: val };
    setPathVariables(updated);

    // If current preset has this variable in template, update request path
    const preset = ENDPOINT_PRESETS.find((p) => p.id === selectedPresetId);
    if (preset) {
      let resolved = preset.path;
      Object.keys(updated).forEach((k) => {
        resolved = resolved.replace(`{${k}}`, updated[k]);
      });
      setRequestPath(resolved);
    }
  };

  const executeRequest = async () => {
    setIsRunning(true);
    setResponseStatus(null);
    setResponseData(null);
    setResponseHeaders(null);
    setResponseError(null);
    const startTime = performance.now();

    try {
      let parsedBody = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(httpMethod) && requestBodyText.trim()) {
        try {
          parsedBody = JSON.parse(requestBodyText);
        } catch (jsonErr) {
          setResponseError(`Invalid JSON Request Body: ${jsonErr.message}`);
          setIsRunning(false);
          return;
        }
      }

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const isDownload = requestPath.includes('/download-all');
      const config = {
        method: httpMethod,
        url: `${API_BASE}${requestPath}`,
        headers,
        data: parsedBody,
        responseType: isDownload ? 'blob' : 'json'
      };

      const res = await axios(config);
      const endTime = performance.now();
      setResponseDuration(Math.round(endTime - startTime));
      setResponseStatus(res.status);
      setResponseHeaders(res.headers);

      if (isDownload) {
        // Trigger file download
        const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `application_documents_${pathVariables.application_id}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setResponseData({ message: 'ZIP archive downloaded successfully to your computer!', sizeBytes: res.data.size });
      } else {
        setResponseData(res.data);
      }

      // Refresh overview if modifying data
      if (['POST', 'PATCH', 'DELETE'].includes(httpMethod)) {
        loadDbOverview();
      }
    } catch (err) {
      const endTime = performance.now();
      setResponseDuration(Math.round(endTime - startTime));
      if (err.response) {
        setResponseStatus(err.response.status);
        setResponseHeaders(err.response.headers);
        setResponseData(err.response.data);
      } else {
        setResponseError(err.message);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMethodBadgeClass = (method) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'POST': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PATCH': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'PUT': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'DELETE': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-slate-100 text-slate-700';
    if (status >= 200 && status < 300) return 'bg-emerald-600 text-white';
    if (status >= 400 && status < 500) return 'bg-amber-600 text-white';
    return 'bg-rose-600 text-white';
  };

  const filteredPresets = ENDPOINT_PRESETS.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.method.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = ['ALL', 'Authentication', 'Tenders & Jobs', 'Applications & Quotations', 'Clarifications', 'Dashboard Statistics'];

  return (
    <div className='min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans'>
      {/* Top Bar */}
      <header className='bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-lg'>
        <div className='flex items-center space-x-3'>
          <div className='w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400'>
            <Terminal className='w-5 h-5' />
          </div>
          <div>
            <div className='flex items-center space-x-2'>
              <span className='font-bold text-base text-white tracking-wide'>RFQ API Developer Workbench</span>
              <span className='bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] px-2 py-0.5 rounded font-mono font-bold'>
                REST v2.0
              </span>
            </div>
            <p className='text-xs text-slate-400'>Live endpoint execution, payload modification & schema inspector</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className='flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 space-x-1 text-xs font-semibold'>
          <button
            onClick={() => setActiveTab('workbench')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${activeTab === 'workbench' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Sliders className='w-3.5 h-3.5' />
            <span>Interactive Console</span>
          </button>
          <button
            onClick={() => setActiveTab('scalar')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${activeTab === 'scalar' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Code2 className='w-3.5 h-3.5 text-amber-400' />
            <span>Scalar Docs</span>
          </button>
          <button
            onClick={() => setActiveTab('swagger')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${activeTab === 'swagger' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <ExternalLink className='w-3.5 h-3.5 text-emerald-400' />
            <span>Swagger UI</span>
          </button>
          <button
            onClick={() => setActiveTab('redoc')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${activeTab === 'redoc' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <FileCode className='w-3.5 h-3.5 text-blue-400' />
            <span>ReDoc</span>
          </button>
        </div>
      </header>

      {/* Embedded Iframe Tabs */}
      {activeTab === 'swagger' && (
        <div className='flex-1 w-full bg-white'>
          <iframe
            src={`${API_BASE}/docs`}
            title='FastAPI Swagger UI'
            className='w-full h-full min-h-[85vh] border-0'
          />
        </div>
      )}
      {activeTab === 'redoc' && (
        <div className='flex-1 w-full bg-white'>
          <iframe
            src={`${API_BASE}/redoc`}
            title='FastAPI ReDoc UI'
            className='w-full h-full min-h-[85vh] border-0'
          />
        </div>
      )}
      {activeTab === 'scalar' && (
        <div className='flex-1 w-full bg-white'>
          <iframe
            src={`${API_BASE}/scalar`}
            title='Scalar API Reference'
            className='w-full h-full min-h-[85vh] border-0'
          />
        </div>
      )}

      {/* Main Interactive Workbench */}
      {activeTab === 'workbench' && (
        <div className='flex-1 flex flex-col p-4 sm:p-6 space-y-4 max-w-7xl mx-auto w-full'>
          
          {/* Quick Authentication & Token Switcher Bar */}
          <div className='bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-md'>
            <div className='flex flex-wrap items-center justify-between gap-3 mb-3'>
              <div className='flex items-center space-x-2'>
                <Key className='w-4 h-4 text-amber-400' />
                <span className='text-xs font-bold uppercase tracking-wider text-slate-300'>1-Click Authentication Switcher</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='text-xs text-slate-400'>Active Identity:</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  activeUserRole === 'CE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                  activeUserRole === 'APPLICANT' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
                  'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {activeUserRole === 'CE' ? '👑 Chief Engineer' : activeUserRole === 'APPLICANT' ? '🏢 Registered Applicant' : '🔓 Unauthenticated (Public)'}
                </span>
                {token && (
                  <button
                    onClick={handleClearAuth}
                    className='text-[11px] text-slate-400 hover:text-rose-400 px-2 py-0.5 border border-slate-700 rounded transition'
                  >
                    Clear Token
                  </button>
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-4 gap-2.5'>
              <button
                onClick={() => handleQuickLogin('CE', { mobile_no: '9876543210', password: 'ce123' })}
                disabled={authLoading}
                className='flex items-center justify-between bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500/60 p-2.5 rounded-lg text-left transition group'
              >
                <div>
                  <div className='text-xs font-bold text-emerald-400 flex items-center'>
                    <Shield className='w-3.5 h-3.5 mr-1.5 text-emerald-400' />
                    Login as CE Admin
                  </div>
                  <div className='text-[11px] text-slate-400 font-mono'>9876543210 / ce123</div>
                </div>
                <ArrowRight className='w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition' />
              </button>

              <button
                onClick={() => handleQuickLogin('APPLICANT', { mobile_no: '9111222333', password: 'app123' })}
                disabled={authLoading}
                className='flex items-center justify-between bg-slate-900 hover:bg-slate-800 border border-blue-500/30 hover:border-blue-500/60 p-2.5 rounded-lg text-left transition group'
              >
                <div>
                  <div className='text-xs font-bold text-blue-400 flex items-center'>
                    <User className='w-3.5 h-3.5 mr-1.5 text-blue-400' />
                    Login as Applicant 1
                  </div>
                  <div className='text-[11px] text-slate-400 font-mono'>9111222333 / app123</div>
                </div>
                <ArrowRight className='w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition' />
              </button>

              <button
                onClick={() => handleQuickLogin('APPLICANT', { mobile_no: '9222333444', password: 'app123' })}
                disabled={authLoading}
                className='flex items-center justify-between bg-slate-900 hover:bg-slate-800 border border-blue-500/30 hover:border-blue-500/60 p-2.5 rounded-lg text-left transition group'
              >
                <div>
                  <div className='text-xs font-bold text-blue-400 flex items-center'>
                    <User className='w-3.5 h-3.5 mr-1.5 text-blue-400' />
                    Login as Applicant 2
                  </div>
                  <div className='text-[11px] text-slate-400 font-mono'>9222333444 / app123</div>
                </div>
                <ArrowRight className='w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition' />
              </button>

              <div className='bg-slate-900 border border-slate-800 p-2 rounded-lg flex flex-col justify-center'>
                <span className='text-[10px] text-slate-500 font-mono'>Bearer JWT Token:</span>
                <input
                  type='text'
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    localStorage.setItem('rfq_token', e.target.value);
                  }}
                  placeholder='Paste JWT Token...'
                  className='bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 font-mono focus:border-purple-500 outline-none truncate'
                />
              </div>
            </div>

            {authMsg && (
              <div className='mt-2.5 text-xs text-amber-400 font-mono flex items-center'>
                <CheckCircle2 className='w-3.5 h-3.5 mr-1.5 text-amber-400' />
                {authMsg}
              </div>
            )}
          </div>

          {/* Quick Database Overview & ID Chips */}
          <div className='bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400'>
                <Database className='w-4 h-4' />
              </div>
              <div>
                <span className='text-xs font-bold text-slate-200'>Live PostgreSQL Database Context</span>
                <p className='text-[11px] text-slate-400'>
                  {dbOverview ? (
                    <>Tenders: <strong className='text-emerald-400'>{dbOverview.tendersCount}</strong> | Jobs: <strong className='text-purple-400'>{dbOverview.jobsCount}</strong></>
                  ) : 'Connecting to database...'}
                </p>
              </div>
            </div>

            {/* Quick Variable Injectors */}
            <div className='flex flex-wrap items-center gap-2 text-xs'>
              <span className='text-slate-500 font-mono text-[11px]'>Active ID Variables:</span>
              <div className='flex items-center space-x-1 bg-slate-900 border border-slate-700 px-2 py-1 rounded font-mono'>
                <span className='text-slate-400'>tender_id:</span>
                <input
                  type='text'
                  value={pathVariables.tender_id}
                  onChange={(e) => handlePathVariableChange('tender_id', e.target.value)}
                  className='w-8 bg-transparent text-white font-bold outline-none text-center'
                />
              </div>
              <div className='flex items-center space-x-1 bg-slate-900 border border-slate-700 px-2 py-1 rounded font-mono'>
                <span className='text-slate-400'>application_id:</span>
                <input
                  type='text'
                  value={pathVariables.application_id}
                  onChange={(e) => handlePathVariableChange('application_id', e.target.value)}
                  className='w-8 bg-transparent text-white font-bold outline-none text-center'
                />
              </div>
              <div className='flex items-center space-x-1 bg-slate-900 border border-slate-700 px-2 py-1 rounded font-mono'>
                <span className='text-slate-400'>job_id:</span>
                <input
                  type='text'
                  value={pathVariables.job_id}
                  onChange={(e) => handlePathVariableChange('job_id', e.target.value)}
                  className='w-8 bg-transparent text-white font-bold outline-none text-center'
                />
              </div>
              <button
                onClick={loadDbOverview}
                disabled={dbLoading}
                className='p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition'
                title='Refresh DB stats'
              >
                <RefreshCw className={`w-3.5 h-3.5 ${dbLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Main 2-Column Explorer & Console */}
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1'>
            
            {/* Left Column: Endpoints Catalog (4 Cols) */}
            <div className='lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col h-[700px] shadow-md'>
              <div className='flex items-center justify-between mb-3 px-1'>
                <div className='flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider'>
                  <Layers className='w-4 h-4 text-purple-400' />
                  <span>API Catalog ({filteredPresets.length})</span>
                </div>
              </div>

              {/* Search Bar */}
              <div className='relative mb-2'>
                <Search className='w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search endpoints...'
                  className='w-full bg-slate-900 border border-slate-800 text-xs rounded-lg pl-8 pr-3 py-1.5 text-slate-200 outline-none focus:border-purple-500'
                />
              </div>

              {/* Category Pills */}
              <div className='flex flex-wrap gap-1 mb-2.5 pb-1 border-b border-slate-800 overflow-x-auto'>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* List of endpoints */}
              <div className='flex-1 overflow-y-auto space-y-1.5 pr-1'>
                {filteredPresets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => selectPreset(preset)}
                      className={`w-full text-left p-2.5 rounded-lg border transition flex flex-col space-y-1 group ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500 shadow-sm'
                          : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-1.5'>
                          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${getMethodBadgeClass(preset.method)}`}>
                            {preset.method}
                          </span>
                          <span className='text-xs font-semibold text-slate-200 group-hover:text-purple-300 transition truncate max-w-[170px]'>
                            {preset.title}
                          </span>
                        </div>
                        <span className='text-[9px] text-slate-400 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800'>
                          {preset.role}
                        </span>
                      </div>
                      <div className='text-[11px] font-mono text-slate-400 truncate'>
                        {preset.path}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Interactive Request Runner & Response Inspector (8 Cols) */}
            <div className='lg:col-span-8 flex flex-col space-y-4 h-[700px] overflow-hidden'>
              
              {/* Request Runner Box */}
              <div className='bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col flex-1 shadow-md overflow-hidden'>
                
                {/* Method & URL Input */}
                <div className='flex items-center space-x-2 mb-3'>
                  <select
                    value={httpMethod}
                    onChange={(e) => setHttpMethod(e.target.value)}
                    className={`font-mono font-bold text-xs px-2.5 py-2 rounded-lg border outline-none bg-slate-900 ${getMethodBadgeClass(httpMethod)}`}
                  >
                    <option value='GET'>GET</option>
                    <option value='POST'>POST</option>
                    <option value='PATCH'>PATCH</option>
                    <option value='PUT'>PUT</option>
                    <option value='DELETE'>DELETE</option>
                  </select>

                  <div className='flex-1 flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-300'>
                    <span className='text-slate-500 mr-1'>{API_BASE}</span>
                    <input
                      type='text'
                      value={requestPath}
                      onChange={(e) => setRequestPath(e.target.value)}
                      className='flex-1 bg-transparent text-white outline-none font-semibold'
                    />
                  </div>

                  <button
                    onClick={executeRequest}
                    disabled={isRunning}
                    className='flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition transform active:scale-95 disabled:opacity-50'
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className='w-4 h-4 animate-spin' />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Play className='w-4 h-4 fill-white' />
                        <span>Execute</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Body / Payload Editor (if POST/PUT/PATCH) */}
                {['POST', 'PUT', 'PATCH'].includes(httpMethod) ? (
                  <div className='flex-1 flex flex-col min-h-0 mb-3'>
                    <div className='flex items-center justify-between mb-1 text-[11px] text-slate-400'>
                      <span className='font-mono font-semibold text-slate-300'>Request Payload (JSON Body):</span>
                      <button
                        onClick={() => {
                          try {
                            const obj = JSON.parse(requestBodyText);
                            setRequestBodyText(JSON.stringify(obj, null, 2));
                          } catch (e) {}
                        }}
                        className='text-[10px] text-purple-400 hover:text-purple-300 underline'
                      >
                        Format / Beautify JSON
                      </button>
                    </div>
                    <textarea
                      value={requestBodyText}
                      onChange={(e) => setRequestBodyText(e.target.value)}
                      placeholder='{\n  "key": "value"\n}'
                      className='flex-1 w-full bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs rounded-lg p-3 outline-none focus:border-purple-500 resize-none'
                    />
                  </div>
                ) : (
                  <div className='bg-slate-900/50 border border-dashed border-slate-800 rounded-lg p-3 text-center text-xs text-slate-500 mb-3'>
                    No request body required for <strong>{httpMethod}</strong> request. Headers & Authorization token will be sent automatically.
                  </div>
                )}

                {/* Live Response Panel */}
                <div className='flex-1 flex flex-col min-h-0 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden'>
                  <div className='bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-xs font-bold text-slate-300'>Response Output:</span>
                      {responseStatus && (
                        <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${getStatusBadgeClass(responseStatus)}`}>
                          {responseStatus}
                        </span>
                      )}
                      {responseDuration !== null && (
                        <span className='text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800'>
                          {responseDuration} ms
                        </span>
                      )}
                    </div>
                    {responseData && (
                      <button
                        onClick={() => copyToClipboard(responseData)}
                        className='flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white transition'
                      >
                        {copied ? <Check className='w-3.5 h-3.5 text-emerald-400' /> : <Copy className='w-3.5 h-3.5' />}
                        <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                    )}
                  </div>

                  <div className='flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed bg-slate-900'>
                    {isRunning && (
                      <div className='flex items-center justify-center py-12 text-slate-400 space-x-2'>
                        <RefreshCw className='w-5 h-5 animate-spin text-purple-400' />
                        <span>Awaiting response from backend...</span>
                      </div>
                    )}
                    {responseError && (
                      <div className='p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400'>
                        <strong>Execution Error:</strong> {responseError}
                      </div>
                    )}
                    {!isRunning && !responseError && responseData !== null && (
                      <pre className='text-emerald-300 whitespace-pre-wrap'>
                        {JSON.stringify(responseData, null, 2)}
                      </pre>
                    )}
                    {!isRunning && !responseError && responseData === null && (
                      <div className='text-center py-12 text-slate-500'>
                        Select an endpoint from the left catalog and click <strong>Execute</strong> to see live backend response data.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
