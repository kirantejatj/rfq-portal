import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import CountdownTimer from '../../components/CountdownTimer';
import { 
  Building2, User, Calendar, Plus, Trash2, IndianRupee, Upload, 
  CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Briefcase, CheckSquare, Square, FileCheck, Info
} from 'lucide-react';

const UNIT_OPTIONS = [
  'MT', 'KG', 'Tonne', 'Quintal',
  'NOS', 'PCS', 'SET', 'Units',
  'RMT', 'MTR', 'SQM', 'SQFT', 'CUM', 'CFT',
  'LS', 'JOB', 'LOT', 'MONTHS', 'DAYS', 'TRIP'
];

export default function SubmitQuotation() {
  const { tenderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Signatory & Covering Letter
  const [coveringDate, setCoveringDate] = useState(new Date().toISOString().split('T')[0]);
  const [signatoryName, setSignatoryName] = useState(user?.md_ceo_name || user?.name || '');
  const [signatoryDesignation, setSignatoryDesignation] = useState('Managing Director / Authorized Signatory');
  const [remarks, setRemarks] = useState('');

  // Step 2: Job Selection (Selected Job IDs & Job-specific Remarks/Quotes)
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [jobDataMap, setJobDataMap] = useState({});

  // Step 3: Annexure II - Past Technical & Financial Capabilities
  const [capabilities, setCapabilities] = useState([
    { sl_no: 1, work_description: '', client_name: '', cost_lakhs: '', financial_year: '2024-25' }
  ]);

  // Step 4: Annexure III - Technical Proposal / Line Items & BOQ Document
  const [proposalItems, setProposalItems] = useState([]);
  const [annexureDocFile, setAnnexureDocFile] = useState(null);

  // Step 5: EMD Details & Files
  const [isEmdExempt, setIsEmdExempt] = useState(false);
  const [emdMode, setEmdMode] = useState('ONLINE_PORTAL');
  const [emdTxnRef, setEmdTxnRef] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Step 6: Signed RFQ Document
  const [signedRfqFile, setSignedRfqFile] = useState(null);

  useEffect(() => {
    fetchTender();
  }, [tenderId]);

  const fetchTender = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tenders/${tenderId}`);
      setTender(res.data);
      if (!res.data.is_window_open) {
        setError('Quotation window for this tender is currently closed.');
      }

      if (res.data.emd_amount === 0) {
        setIsEmdExempt(true);
      }

      // Initialize selected jobs (select all active jobs by default)
      if (res.data.jobs && res.data.jobs.length > 0) {
        const activeJobIds = res.data.jobs.filter(j => j.status === 'ACTIVE').map(j => j.job_id);
        setSelectedJobIds(activeJobIds);

        const initJobMap = {};
        const initProposalItems = [];
        let sl = 1;

        res.data.jobs.forEach(j => {
          initJobMap[j.job_id] = {
            quoted_amount: 0,
            remarks: ''
          };
          initProposalItems.push({
            sl_no: sl++,
            job_id: j.job_id,
            item_description: j.job_name,
            unit: j.unit || 'MT',
            quantity: j.estimated_quantity || 1,
            rate_per_unit: '', // No fixed amount - applicant enters own rate
            remarks: j.category || ''
          });
        });

        setJobDataMap(initJobMap);
        setProposalItems(initProposalItems);
      } else {
        setProposalItems([
          { sl_no: 1, job_id: null, item_description: 'Supply & fabrication of structural steel components as per IS 800', unit: 'MT', quantity: 100, rate_per_unit: '', remarks: '' }
        ]);
      }
    } catch (err) {
      setError('Failed to load tender details');
    } finally {
      setLoading(false);
    }
  };

  // Job Selection Handlers
  const toggleJobSelection = (jobId) => {
    if (selectedJobIds.includes(jobId)) {
      if (selectedJobIds.length === 1 && tender?.jobs?.length > 0) {
        alert('You must select at least one job package to submit a quotation.');
        return;
      }
      setSelectedJobIds(selectedJobIds.filter(id => id !== jobId));
    } else {
      setSelectedJobIds([...selectedJobIds, jobId]);
    }
  };

  const selectAllJobs = () => {
    if (tender?.jobs) {
      setSelectedJobIds(tender.jobs.map(j => j.job_id));
    }
  };

  const handleJobRemarksChange = (jobId, value) => {
    setJobDataMap(prev => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        remarks: value
      }
    }));
  };

  // Capabilities Handlers
  const addCapabilityRow = () => {
    setCapabilities([
      ...capabilities,
      { sl_no: capabilities.length + 1, work_description: '', client_name: '', cost_lakhs: '', financial_year: '2024-25' }
    ]);
  };

  const removeCapabilityRow = (index) => {
    const updated = capabilities.filter((_, i) => i !== index).map((row, idx) => ({ ...row, sl_no: idx + 1 }));
    setCapabilities(updated);
  };

  const handleCapabilityChange = (index, field, value) => {
    const updated = [...capabilities];
    updated[index][field] = value;
    setCapabilities(updated);
  };

  // Proposal Items Handlers
  const addProposalRow = () => {
    setProposalItems([
      ...proposalItems,
      {
        sl_no: proposalItems.length + 1,
        job_id: selectedJobIds.length > 0 ? selectedJobIds[0] : null,
        item_description: '',
        unit: 'MT',
        quantity: 1,
        rate_per_unit: '',
        remarks: ''
      }
    ]);
  };

  const removeProposalRow = (index) => {
    const updated = proposalItems.filter((_, i) => i !== index).map((row, idx) => ({ ...row, sl_no: idx + 1 }));
    setProposalItems(updated);
  };

  const handleProposalChange = (index, field, value) => {
    const updated = [...proposalItems];
    updated[index][field] = value;
    setProposalItems(updated);
  };

  // Filter active proposal items belonging to selected jobs (or general items)
  const activeProposalItems = proposalItems.filter(
    item => !item.job_id || selectedJobIds.includes(item.job_id)
  );

  // Auto-calculated Grand Total from active items
  const grandTotalQuoted = activeProposalItems.reduce((sum, item) => {
    const q = parseFloat(item.quantity) || 0;
    const r = parseFloat(item.rate_per_unit) || 0;
    return sum + (q * r);
  }, 0);

  // File Upload Handlers
  const handleFileUpload = (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFiles(prev => [...prev.filter(f => f.document_type !== docType), { file, document_type: docType, name: file.name }]);
  };

  const handleFinalSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      if (tender?.jobs && tender.jobs.length > 0 && selectedJobIds.length === 0) {
        throw new Error('Please select at least one job package from this tender.');
      }

      // Build selected_jobs payload with job-level computed totals
      const selectedJobsPayload = selectedJobIds.map(jobId => {
        const jobItems = activeProposalItems.filter(p => p.job_id === jobId);
        const jobTotal = jobItems.reduce((sum, item) => {
          const q = parseFloat(item.quantity) || 0;
          const r = parseFloat(item.rate_per_unit) || 0;
          return sum + (q * r);
        }, 0);

        return {
          job_id: jobId,
          quoted_amount: jobTotal,
          remarks: jobDataMap[jobId]?.remarks || ''
        };
      });

      const payload = {
        tender_id: parseInt(tenderId),
        covering_letter_date: coveringDate,
        signatory_name: signatoryName,
        signatory_designation: signatoryDesignation,
        quoted_amount: grandTotalQuoted,
        remarks: remarks,
        selected_jobs: selectedJobsPayload,
        capabilities: capabilities.filter(c => c.work_description.trim()).map(c => ({
          sl_no: c.sl_no,
          work_description: c.work_description,
          client_name: c.client_name,
          cost_lakhs: parseFloat(c.cost_lakhs) || 0,
          financial_year: c.financial_year
        })),
        proposal_items: activeProposalItems.map(p => ({
          sl_no: p.sl_no,
          job_id: p.job_id,
          item_description: p.item_description,
          unit: p.unit,
          quantity: parseFloat(p.quantity) || 0,
          rate_per_unit: parseFloat(p.rate_per_unit) || 0,
          amount: (parseFloat(p.quantity) || 0) * (parseFloat(p.rate_per_unit) || 0),
          remarks: p.remarks
        })),
        emd: isEmdExempt ? null : {
          amount: parseFloat(tender.emd_amount) || 0,
          payment_mode: emdMode,
          transaction_ref: emdTxnRef || `TXN-AGIC-${Math.floor(100000 + Math.random() * 900000)}`,
          payment_date: new Date().toISOString()
        }
      };

      const res = await api.post('/applications', payload);
      const newAppId = res.data.application_id;

      // Upload attached files (EMD, Annexure III doc, Signed RFQ, etc.)
      const allFilesToUpload = [...uploadedFiles];
      if (annexureDocFile) {
        allFilesToUpload.push({ file: annexureDocFile, document_type: 'ANNEXURE_III_DOC', name: annexureDocFile.name });
      }
      if (signedRfqFile) {
        allFilesToUpload.push({ file: signedRfqFile, document_type: 'SIGNED_RFQ_DOC', name: signedRfqFile.name });
      }

      for (const item of allFilesToUpload) {
        const fData = new FormData();
        fData.append('document_type', item.document_type);
        fData.append('file', item.file);
        try {
          await api.post(`/applications/${newAppId}/documents`, fData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (fErr) {
          console.error('File upload err', fErr);
        }
      }

      alert(`Quotation submitted successfully! Your exact submitted amount is ₹${grandTotalQuoted.toLocaleString('en-IN')}. Application No: ${res.data.application_no}`);
      navigate('/applicant/my-applications');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to submit quotation. Check quotation window & validity.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading tender submission wizard...</div>;
  }

  const stepsList = [
    { num: 1, label: 'Signatory & Covering' },
    { num: 2, label: 'Job Package Selection' },
    { num: 3, label: 'Annexure II (Capabilities)' },
    { num: 4, label: 'Annexure III (Line Items & Rates)' },
    { num: 5, label: 'EMD & Documents' },
    { num: 6, label: 'Review & Submit' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div>
            <span className="text-xs font-mono font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded">
              {tender.tender_ref_no}
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{tender.title}</h1>
            {tender.jobs && tender.jobs.length > 0 && (
              <span className="inline-block mt-1 text-[11px] font-semibold text-gov-700 bg-gov-50 px-2 py-0.5 rounded border border-gov-200">
                📁 {tender.jobs.length} Work Packages Defined • {selectedJobIds.length} Selected
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={tender.status} />
            <CountdownTimer targetDate={tender.quotation_to_date} />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center border border-red-200">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Wizard Step Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
        {stepsList.map(s => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            className={`p-3 rounded-xl border text-center transition font-bold flex flex-col items-center justify-center ${
              step === s.num
                ? 'bg-gov-800 text-white border-gov-800 shadow-md ring-2 ring-gov-600/30'
                : step > s.num
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-[10px] opacity-80 uppercase tracking-wider">Step {s.num}</span>
            <span className="truncate w-full mt-0.5">{s.label}</span>
          </button>
        ))}
      </div>

      {/* STEP 1: COVERING LETTER & SIGNATORY */}
      {step === 1 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Step 1: Quotation Covering Letter & Signatory Details</h2>
            <p className="text-xs text-slate-500">Provide official authorization details and date for the quotation dossier.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Covering Letter Date *</label>
              <input
                type="date"
                value={coveringDate}
                onChange={(e) => setCoveringDate(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Authorized Signatory Legal Name *</label>
              <input
                type="text"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                placeholder="Full Name"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Signatory Title / Designation *</label>
              <input
                type="text"
                value={signatoryDesignation}
                onChange={(e) => setSignatoryDesignation(e.target.value)}
                placeholder="e.g. Managing Director / Lead Partner"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Covering Letter Technical Notes / Remarks (Optional)</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="We hereby submit our commercial quotation for the requested scope of works..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-gov-600 text-white font-bold rounded-lg text-xs hover:bg-gov-700 flex items-center"
            >
              Next: Select Work Packages
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: JOB PACKAGE SELECTION */}
      {step === 2 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 2: Work Packages / Jobs Selection</h2>
              <p className="text-xs text-slate-500">Select which work package(s) your firm is quoting for. You can choose one, multiple, or all packages.</p>
            </div>
            {tender?.jobs && tender.jobs.length > 0 && (
              <button
                type="button"
                onClick={selectAllJobs}
                className="px-3 py-1 bg-gov-50 text-gov-700 font-bold rounded text-xs border border-gov-200 hover:bg-gov-100"
              >
                Select All Jobs
              </button>
            )}
          </div>

          {tender?.jobs && tender.jobs.length > 0 ? (
            <div className="space-y-3">
              {tender.jobs.map(job => {
                const isSelected = selectedJobIds.includes(job.job_id);
                return (
                  <div
                    key={job.job_id}
                    onClick={() => toggleJobSelection(job.job_id)}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer ${
                      isSelected
                        ? 'border-gov-600 bg-gov-50/50 shadow-sm'
                        : 'border-slate-200 bg-slate-50/50 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5 text-gov-600">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-gov-600 fill-gov-100" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-slate-300 text-gov-800">
                              {job.job_code || `JOB #${job.job_id}`}
                            </span>
                            <span className="font-bold text-sm text-slate-900">{job.job_name}</span>
                            {job.category && (
                              <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                                {job.category}
                              </span>
                            )}
                          </div>
                          {job.job_description && (
                            <p className="text-xs text-slate-600 mt-1">{job.job_description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
                            {job.estimated_quantity && (
                              <span><strong>Scope Qty:</strong> {job.estimated_quantity} {job.unit}</span>
                            )}
                            {job.completion_period && (
                              <span><strong>Period:</strong> {job.completion_period}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-gov-200/60" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[11px] font-bold text-gov-800 block mb-1">
                          Applicant Remarks / Notes for this Work Package:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Quoting with dedicated automatic submerged arc welding lines"
                          value={jobDataMap[job.job_id]?.remarks || ''}
                          onChange={(e) => handleJobRemarksChange(job.job_id, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              This tender does not have partitioned job packages. Your proposal will cover the entire scope of work.
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (tender?.jobs && tender.jobs.length > 0 && selectedJobIds.length === 0) {
                  alert('Please select at least one job package before continuing.');
                  return;
                }
                setStep(3);
              }}
              className="px-5 py-2.5 bg-gov-600 text-white font-bold rounded-lg text-xs hover:bg-gov-700 flex items-center"
            >
              Next: Annexure II (Capabilities)
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ANNEXURE II */}
      {step === 3 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 3: Annexure II — Past Technical & Financial Capabilities</h2>
              <p className="text-xs text-slate-500">Provide details of similar fabrication or infrastructure works executed previously.</p>
            </div>
            <button
              type="button"
              onClick={addCapabilityRow}
              className="px-3 py-1.5 bg-gov-50 text-gov-700 hover:bg-gov-100 rounded-lg text-xs font-bold border border-gov-200 flex items-center"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Project
            </button>
          </div>

          <div className="space-y-3">
            {capabilities.map((row, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-center">
                <div className="sm:col-span-1 font-bold text-slate-500 text-center">#{row.sl_no}</div>
                <div className="sm:col-span-5">
                  <label className="text-[10px] text-slate-500 block">Work Description</label>
                  <input
                    type="text"
                    value={row.work_description}
                    onChange={(e) => handleCapabilityChange(idx, 'work_description', e.target.value)}
                    placeholder="Details of works completed"
                    className="w-full px-2.5 py-1.5 border rounded bg-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[10px] text-slate-500 block">Client / Authority</label>
                  <input
                    type="text"
                    value={row.client_name}
                    onChange={(e) => handleCapabilityChange(idx, 'client_name', e.target.value)}
                    placeholder="e.g. NHAI / APCRDA / L&T"
                    className="w-full px-2.5 py-1.5 border rounded bg-white"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[10px] text-slate-500 block">Cost (₹ Lakhs)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={row.cost_lakhs}
                    onChange={(e) => handleCapabilityChange(idx, 'cost_lakhs', e.target.value)}
                    placeholder="e.g. 450"
                    className="w-full px-2.5 py-1.5 border rounded bg-white font-mono"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[10px] text-slate-500 block">FY</label>
                  <input
                    type="text"
                    value={row.financial_year}
                    onChange={(e) => handleCapabilityChange(idx, 'financial_year', e.target.value)}
                    placeholder="2024-25"
                    className="w-full px-2.5 py-1.5 border rounded bg-white"
                  />
                </div>
                <div className="sm:col-span-1 text-center">
                  <button
                    type="button"
                    onClick={() => removeCapabilityRow(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-5 py-2.5 bg-gov-600 text-white font-bold rounded-lg text-xs hover:bg-gov-700 flex items-center"
            >
              Next: Annexure III (Line Items & Rates)
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: ANNEXURE III - FLEXIBLE PRICING, UNIT MASTER & DOCUMENT PROVISION */}
      {step === 4 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 4: Annexure III — Job-Wise Technical Proposal & Line Item Pricing</h2>
              <p className="text-xs text-slate-500">Enter your firm's quoted unit rate for each item. Amounts calculate automatically.</p>
            </div>
            <button
              type="button"
              onClick={addProposalRow}
              className="px-3 py-1.5 bg-gov-50 text-gov-700 hover:bg-gov-100 rounded-lg text-xs font-bold border border-gov-200 flex items-center"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Item
            </button>
          </div>

          {/* Mandatory Guidance Note */}
          <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl flex items-start space-x-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <strong>Mandatory Quotation Consistency Note:</strong>
              <p>Uploaded document quoted amount and the entered amount in the system must match exactly.</p>
            </div>
          </div>

          <div className="space-y-3">
            {proposalItems.map((row, idx) => {
              // Hide item if it belongs to an unselected job
              if (row.job_id && !selectedJobIds.includes(row.job_id)) return null;

              const rowQty = parseFloat(row.quantity) || 0;
              const rowRate = parseFloat(row.rate_per_unit) || 0;
              const rowAmt = rowQty * rowRate;

              return (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-center">
                  <div className="sm:col-span-1 font-bold text-slate-500 text-center">#{row.sl_no}</div>

                  {tender?.jobs && tender.jobs.length > 0 && (
                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-slate-500 block">Work Package / Job</label>
                      <select
                        value={row.job_id || ''}
                        onChange={(e) => handleProposalChange(idx, 'job_id', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-2 py-1.5 border rounded bg-white font-medium"
                      >
                        <option value="">General / All Jobs</option>
                        {tender.jobs.filter(j => selectedJobIds.includes(j.job_id)).map(j => (
                          <option key={j.job_id} value={j.job_id}>
                            {j.job_code} - {j.job_name.slice(0, 25)}...
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className={tender?.jobs && tender.jobs.length > 0 ? "sm:col-span-3" : "sm:col-span-4"}>
                    <label className="text-[10px] text-slate-500 block">Item Description *</label>
                    <input
                      type="text"
                      value={row.item_description}
                      onChange={(e) => handleProposalChange(idx, 'item_description', e.target.value)}
                      placeholder="e.g. Supply & Fabrication of Columns"
                      required
                      className="w-full px-2.5 py-1.5 border rounded bg-white font-semibold"
                    />
                  </div>

                  {/* Unit Master Selector */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-500 block">Unit (Master)</label>
                    <select
                      value={UNIT_OPTIONS.includes(row.unit) ? row.unit : 'Custom'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== 'Custom') {
                          handleProposalChange(idx, 'unit', val);
                        }
                      }}
                      className="w-full px-2 py-1.5 border rounded bg-white text-xs font-semibold"
                    >
                      {UNIT_OPTIONS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                      <option value="Custom">Custom Unit...</option>
                    </select>
                    {!UNIT_OPTIONS.includes(row.unit) && (
                      <input
                        type="text"
                        placeholder="Enter unit"
                        value={row.unit}
                        onChange={(e) => handleProposalChange(idx, 'unit', e.target.value)}
                        className="w-full mt-1 px-2 py-1 border rounded bg-white text-xs"
                      />
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <label className="text-[10px] text-slate-500 block">Qty</label>
                    <input
                      type="number"
                      step="0.01"
                      value={row.quantity}
                      onChange={(e) => handleProposalChange(idx, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-full px-2 py-1.5 border rounded bg-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-500 block">Your Quoted Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={row.rate_per_unit}
                      onChange={(e) => handleProposalChange(idx, 'rate_per_unit', e.target.value)}
                      placeholder="Enter Unit Rate"
                      className="w-full px-2.5 py-1.5 border rounded bg-white font-mono font-bold text-gov-800"
                    />
                  </div>

                  <div className="sm:col-span-2 text-right">
                    <label className="text-[10px] text-slate-500 block">Amount (₹)</label>
                    <span className="font-bold text-slate-900 block pt-1 font-mono">
                      ₹{rowAmt > 0 ? rowAmt.toLocaleString('en-IN') : '0.00'}
                    </span>
                  </div>

                  <div className="sm:col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeProposalRow(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grand Total Bar */}
          <div className="p-4 bg-gov-50 rounded-xl border border-gov-200 flex flex-wrap justify-between items-center text-sm gap-2">
            <span className="font-bold text-gov-900">Your Submitted Total Quoted Amount for {selectedJobIds.length} Job(s):</span>
            <span className="text-xl font-extrabold text-gov-900 flex items-center">
              <IndianRupee className="w-5 h-5 mr-0.5 text-amber-600" />
              ₹{grandTotalQuoted.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Annexure III Document Upload Provision */}
          <div className="p-4 border-2 border-dashed border-gov-200 bg-gov-50/40 rounded-xl space-y-2">
            <label className="font-bold text-slate-800 block text-xs flex items-center">
              <Upload className="w-4 h-4 mr-1.5 text-gov-700" />
              Upload Detailed Annexure III Proposal Sheet / Itemized BOQ Document (PDF / Excel / Scan)
            </label>
            <input
              type="file"
              onChange={(e) => setAnnexureDocFile(e.target.files[0])}
              accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png"
              className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gov-600 file:text-white hover:file:bg-gov-700 border border-slate-300 rounded-lg p-1.5 w-full bg-white"
            />
            {annexureDocFile && (
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Attached: {annexureDocFile.name} ({(annexureDocFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
            <p className="text-[11px] text-slate-500">
              * Note: Please ensure the total amount in your attached document matches the <strong>₹{grandTotalQuoted.toLocaleString('en-IN')}</strong> entered above.
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="px-5 py-2.5 bg-gov-600 text-white font-bold rounded-lg text-xs hover:bg-gov-700 flex items-center"
            >
              Next: EMD & Documents
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: EMD & DOCUMENTS (OPTIONAL EMD) */}
      {step === 5 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Step 5: EMD Deposit & Verification Uploads</h2>
            <p className="text-xs text-slate-500">Earnest Money Deposit (EMD) payment and receipt proof are optional if your firm is exempted or tender has nil EMD.</p>
          </div>

          {/* EMD Exemption Toggle */}
          <div className="flex items-center space-x-2 p-3 bg-slate-50 border rounded-lg text-xs">
            <input
              type="checkbox"
              id="emdExemptCheck"
              checked={isEmdExempt}
              onChange={(e) => setIsEmdExempt(e.target.checked)}
              className="w-4 h-4 text-gov-600 rounded"
            />
            <label htmlFor="emdExemptCheck" className="font-semibold text-slate-700 cursor-pointer">
              Exempted from EMD / MSME Registration / Nil EMD (Payment not required)
            </label>
          </div>

          {/* EMD Box (Shown only if not exempt) */}
          {!isEmdExempt && (
            <div className="p-5 bg-amber-50 rounded-xl border border-amber-200 space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-900 text-sm">Earnest Money Deposit (EMD) Amount</span>
                <span className="text-base font-extrabold text-amber-900">₹{(tender.emd_amount || 0).toLocaleString('en-IN')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-amber-900 block mb-1">Payment Mode</label>
                  <select
                    value={emdMode}
                    onChange={(e) => setEmdMode(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white"
                  >
                    <option value="ONLINE_PORTAL">Online Portal Gateway (Simulated Instant)</option>
                    <option value="NEFT">NEFT / RTGS Transfer</option>
                    <option value="DD">Demand Draft (DD)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-amber-900 block mb-1">Transaction Ref / UTR / DD No. (Optional)</label>
                  <input
                    type="text"
                    value={emdTxnRef}
                    onChange={(e) => setEmdTxnRef(e.target.value)}
                    placeholder="e.g. UTR-HDFC-998822"
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* File Uploads */}
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-800">Attach Supporting Bid Documents (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-2 hover:border-gov-500 transition">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <span className="font-bold block text-slate-700">Covering Letter / Technical Bid (PDF)</span>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, 'COVERING_LETTER')}
                  className="text-[11px] text-slate-500 mx-auto block"
                />
              </div>

              {!isEmdExempt && (
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-2 hover:border-gov-500 transition">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <span className="font-bold block text-slate-700">EMD Payment Receipt / Bank Chalan (Optional)</span>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'EMD_PROOF')}
                    className="text-[11px] text-slate-500 mx-auto block"
                  />
                </div>
              )}
            </div>

            {uploadedFiles.length > 0 && (
              <div className="pt-2">
                <span className="font-bold text-slate-700 block mb-1">Uploaded Supporting Files:</span>
                <ul className="space-y-1 text-[11px] text-emerald-700">
                  {uploadedFiles.map((f, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      {f.name} ({f.document_type})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(6)}
              className="px-5 py-2.5 bg-gov-600 text-white font-bold rounded-lg text-xs hover:bg-gov-700 flex items-center"
            >
              Next: Review & Final Submission
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: REVIEW & FINAL SUBMISSION WITH OPTIONAL SIGNED RFQ ATTACHMENT */}
      {step === 6 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Step 6: Final Review & Submission Confirmation</h2>
            <p className="text-xs text-slate-500">Verify your quotation details before recording your bid into the database.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tender Ref</span>
                <span className="font-bold text-slate-800">{tender.tender_ref_no}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Applicant Firm</span>
                <span className="font-bold text-slate-800">{user?.firm_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Authorized Signatory</span>
                <span className="font-bold text-slate-800">{signatoryName} ({signatoryDesignation})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Submitted Quoted Amount</span>
                <span className="text-lg font-extrabold text-gov-800 flex items-center font-mono">
                  <IndianRupee className="w-4 h-4 mr-0.5 text-amber-600" />
                  ₹{grandTotalQuoted.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Selected Jobs Summary */}
          {tender.jobs && tender.jobs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Selected Job Packages ({selectedJobIds.length}):
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <tr>
                      <th className="p-2.5">Job Code</th>
                      <th className="p-2.5">Job Name</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5 text-right">Applicant Quoted Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tender.jobs.filter(j => selectedJobIds.includes(j.job_id)).map(j => {
                      const jobItems = activeProposalItems.filter(p => p.job_id === j.job_id);
                      const jobTotal = jobItems.reduce((sum, item) => (parseFloat(item.quantity) || 0) * (parseFloat(item.rate_per_unit) || 0), 0);
                      return (
                        <tr key={j.job_id}>
                          <td className="p-2.5 font-mono font-bold text-gov-700">{j.job_code}</td>
                          <td className="p-2.5 font-semibold text-slate-800">{j.job_name}</td>
                          <td className="p-2.5 text-slate-500">{j.category}</td>
                          <td className="p-2.5 text-right font-bold text-emerald-800 font-mono">
                            ₹{jobTotal.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Provision to attach signed RFQ Document as optional */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <label className="font-bold text-slate-800 block flex items-center">
              <FileCheck className="w-4 h-4 mr-1.5 text-gov-600" />
              Attach Signed RFQ Document / Tender Acceptance Undertaking (Optional PDF)
            </label>
            <input
              type="file"
              onChange={(e) => setSignedRfqFile(e.target.files[0])}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1.5 w-full bg-white"
            />
            {signedRfqFile && (
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Attached: {signedRfqFile.name} ({(signedRfqFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
            <p className="text-[11px] text-slate-400">You may upload the scanned copy of the signed RFQ specification or bid declaration.</p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <strong>Declaration of Authenticity:</strong>
            <p>
              I/We hereby certify that our quotation of <strong>₹{grandTotalQuoted.toLocaleString('en-IN')}</strong> accurately reflects our commercial commitment. By submitting, this quotation will be locked into the system as submitted without modification.
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinalSubmit}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-md transition flex items-center"
            >
              {submitting ? 'Submitting to Database...' : 'Confirm & Submit Quotation'}
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
