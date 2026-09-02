import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import CountdownTimer from '../../components/CountdownTimer';
import { 
  Building2, User, Calendar, Plus, Trash2, IndianRupee, Upload, 
  CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Briefcase, CheckSquare, Square
} from 'lucide-react';

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
    { sl_no: 1, work_description: 'Fabrication & supply of heavy structural steel girders', client_name: 'National Highways Authority', cost_lakhs: 450.00, financial_year: '2024-25' }
  ]);

  // Step 4: Annexure III - Technical Proposal / Line Items
  const [proposalItems, setProposalItems] = useState([]);

  // Step 5: EMD Details & Files
  const [emdMode, setEmdMode] = useState('ONLINE_PORTAL');
  const [emdTxnRef, setEmdTxnRef] = useState(`TXN-AGIC-${Math.floor(100000 + Math.random() * 900000)}`);
  const [uploadedFiles, setUploadedFiles] = useState([]);

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

      // Initialize selected jobs (select all active jobs by default)
      if (res.data.jobs && res.data.jobs.length > 0) {
        const activeJobIds = res.data.jobs.filter(j => j.status === 'ACTIVE').map(j => j.job_id);
        setSelectedJobIds(activeJobIds);

        const initJobMap = {};
        const initProposalItems = [];
        let sl = 1;

        res.data.jobs.forEach(j => {
          initJobMap[j.job_id] = {
            quoted_amount: j.estimated_cost || 0,
            remarks: ''
          };
          initProposalItems.push({
            sl_no: sl++,
            job_id: j.job_id,
            item_description: j.job_name,
            unit: j.unit || 'MT',
            quantity: j.estimated_quantity || 1,
            rate_per_unit: j.estimated_quantity ? Math.round((j.estimated_cost || 0) / j.estimated_quantity) : (j.estimated_cost || 0),
            remarks: j.category || ''
          });
        });

        setJobDataMap(initJobMap);
        setProposalItems(initProposalItems);
      } else {
        // Fallback default proposal items if no jobs defined
        setProposalItems([
          { sl_no: 1, job_id: null, item_description: 'Supply & fabrication of structural steel components as per IS 800', unit: 'MT', quantity: 250, rate_per_unit: 85000, remarks: 'Includes primer coat' },
          { sl_no: 2, job_id: null, item_description: 'Crane erection, precision alignment, and high-tensile torque bolting', unit: 'MT', quantity: 250, rate_per_unit: 18000, remarks: 'Site erection' }
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
      { sl_no: capabilities.length + 1, work_description: '', client_name: '', cost_lakhs: 0, financial_year: '2024-25' }
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
        rate_per_unit: 0,
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

  // File Upload Handler
  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFiles(prev => [...prev, { file, document_type: docType, name: file.name }]);
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
          quoted_amount: jobTotal > 0 ? jobTotal : (jobDataMap[jobId]?.quoted_amount || 0),
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
        capabilities: capabilities.map(c => ({
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
        emd: {
          amount: parseFloat(tender.emd_amount) || 0,
          payment_mode: emdMode,
          transaction_ref: emdTxnRef,
          payment_date: new Date().toISOString()
        }
      };

      const res = await api.post('/applications', payload);
      const newAppId = res.data.application_id;

      // Upload attached files if any
      for (const item of uploadedFiles) {
        const fData = new FormData();
        fData.append('document_type', item.document_type);
        fData.append('file', item.file);
        try {
          await api.post(`/applications/${newAppId}/documents`, fData);
        } catch (fErr) {
          console.error('File upload err', fErr);
        }
      }

      alert(`Quotation submitted successfully with ${selectedJobIds.length} selected job package(s)! Application No: ${res.data.application_no}`);
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
    { num: 4, label: 'Annexure III (Line Items)' },
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
          <CountdownTimer fromDate={tender.quotation_from_date} toDate={tender.quotation_to_date} />
        </div>

        {/* Step Indicator */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center text-xs gap-2">
          {stepsList.map(s => (
            <div key={s.num} className="flex items-center space-x-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === s.num
                  ? 'bg-gov-600 text-white shadow'
                  : step > s.num
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`hidden lg:inline text-[11px] font-semibold ${step === s.num ? 'text-gov-800' : 'text-slate-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs flex items-center border border-red-200">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: COVERING LETTER */}
      {step === 1 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900">Step 1: Authorized Signatory & Covering Letter Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Covering Letter Date</label>
              <input
                type="date"
                value={coveringDate}
                onChange={(e) => setCoveringDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Authorized Signatory Name *</label>
              <input
                type="text"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                placeholder="Full name of signatory"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Signatory Designation *</label>
              <input
                type="text"
                value={signatoryDesignation}
                onChange={(e) => setSignatoryDesignation(e.target.value)}
                placeholder="e.g. Managing Director / Partner"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Submitting Firm</label>
              <input
                type="text"
                disabled
                value={user?.firm_name || 'My Firm'}
                className="w-full px-3 py-2 border rounded-lg bg-slate-100 text-slate-600 font-semibold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">General Notes / Remarks</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Any special remarks regarding this submission..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-gov-600 text-white font-bold rounded-lg text-xs hover:bg-gov-700 flex items-center"
            >
              Next: Select Work Packages / Jobs
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: JOB SELECTION */}
      {step === 2 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-gov-600" />
                Step 2: Select Job Packages to Bid ({selectedJobIds.length} of {tender.jobs?.length || 0} selected)
              </h2>
              <p className="text-xs text-slate-500">
                You can select a subset or all jobs under this RFQ tender. Only selected jobs will be included in your quotation.
              </p>
            </div>
            {tender.jobs && tender.jobs.length > 0 && (
              <button
                type="button"
                onClick={selectAllJobs}
                className="px-3 py-1.5 bg-gov-50 text-gov-700 hover:bg-gov-100 rounded-lg text-xs font-bold border border-gov-200"
              >
                Select All Jobs
              </button>
            )}
          </div>

          {tender.jobs && tender.jobs.length > 0 ? (
            <div className="space-y-4">
              {tender.jobs.map((job) => {
                const isSelected = selectedJobIds.includes(job.job_id);
                return (
                  <div
                    key={job.job_id}
                    onClick={() => toggleJobSelection(job.job_id)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition text-xs space-y-3 ${
                      isSelected
                        ? 'border-gov-600 bg-gov-50/40 shadow-sm'
                        : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5 text-gov-700">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-gov-600 fill-gov-50" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-gov-700 bg-white px-2 py-0.5 rounded border border-gov-200">
                              {job.job_code}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm">{job.job_name}</h3>
                          </div>
                          {job.category && (
                            <span className="inline-block text-[10px] uppercase font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                              {job.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        {job.estimated_cost ? (
                          <span className="font-extrabold text-gov-900 text-sm flex items-center justify-end">
                            <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-amber-600" />
                            ₹{job.estimated_cost.toLocaleString('en-IN')}
                          </span>
                        ) : null}
                        <span className="text-[10px] text-slate-400 block">Est. Budget</span>
                      </div>
                    </div>

                    {job.job_description && (
                      <p className="text-slate-600 text-xs pl-8 leading-relaxed">{job.job_description}</p>
                    )}

                    <div className="pl-8 pt-2 border-t border-slate-200/60 flex flex-wrap gap-4 text-[11px] text-slate-600">
                      {job.estimated_quantity && (
                        <span>Est. Quantity: <strong>{job.estimated_quantity} {job.unit || 'units'}</strong></span>
                      )}
                      {job.completion_period && (
                        <span>Period: <strong>{job.completion_period}</strong></span>
                      )}
                    </div>

                    {/* Remarks per selected job */}
                    {isSelected && (
                      <div className="pl-8 pt-2" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Applicant Remarks / Notes for this Job:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Scope conforms to technical specs, ready for immediate deployment"
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
                    placeholder="e.g. NHAI / APCRDA"
                    className="w-full px-2.5 py-1.5 border rounded bg-white"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[10px] text-slate-500 block">Cost (Lakhs)</label>
                  <input
                    type="number"
                    value={row.cost_lakhs}
                    onChange={(e) => handleCapabilityChange(idx, 'cost_lakhs', e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded bg-white"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[10px] text-slate-500 block">FY</label>
                  <input
                    type="text"
                    value={row.financial_year}
                    onChange={(e) => handleCapabilityChange(idx, 'financial_year', e.target.value)}
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

      {/* STEP 4: ANNEXURE III */}
      {step === 4 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 4: Annexure III — Job-Wise Technical Proposal & Line Item Pricing</h2>
              <p className="text-xs text-slate-500">Provide itemized rates per unit for each selected job package. Totals are computed automatically.</p>
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

          <div className="space-y-3">
            {proposalItems.map((row, idx) => {
              // Hide item if it belongs to an unselected job
              if (row.job_id && !selectedJobIds.includes(row.job_id)) return null;

              const rowAmt = (parseFloat(row.quantity) || 0) * (parseFloat(row.rate_per_unit) || 0);
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
                      placeholder="Item description"
                      className="w-full px-2.5 py-1.5 border rounded bg-white font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-[10px] text-slate-500 block">Unit</label>
                    <input
                      type="text"
                      value={row.unit}
                      onChange={(e) => handleProposalChange(idx, 'unit', e.target.value)}
                      placeholder="MT/Nos"
                      className="w-full px-2.5 py-1.5 border rounded bg-white text-center"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-[10px] text-slate-500 block">Qty</label>
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={(e) => handleProposalChange(idx, 'quantity', e.target.value)}
                      className="w-full px-2 py-1.5 border rounded bg-white font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-500 block">Rate / Unit (₹)</label>
                    <input
                      type="number"
                      value={row.rate_per_unit}
                      onChange={(e) => handleProposalChange(idx, 'rate_per_unit', e.target.value)}
                      className="w-full px-2 py-1.5 border rounded bg-white font-mono"
                    />
                  </div>
                  <div className="sm:col-span-1 text-right">
                    <label className="text-[10px] text-slate-500 block">Total (₹)</label>
                    <span className="font-bold text-slate-900 block pt-1">₹{rowAmt.toLocaleString('en-IN')}</span>
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
          <div className="p-4 bg-gov-50 rounded-xl border border-gov-200 flex justify-between items-center text-sm">
            <span className="font-bold text-gov-900">Calculated Total Quoted Amount for {selectedJobIds.length} Selected Job(s):</span>
            <span className="text-xl font-extrabold text-gov-800 flex items-center">
              <IndianRupee className="w-5 h-5 mr-0.5 text-amber-600" />
              ₹{grandTotalQuoted.toLocaleString('en-IN')}
            </span>
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

      {/* STEP 5: EMD & DOCUMENTS */}
      {step === 5 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900">Step 5: EMD Deposit & Verification Uploads</h2>

          {/* EMD Box */}
          <div className="p-5 bg-amber-50 rounded-xl border border-amber-200 space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-amber-900 text-sm">Earnest Money Deposit (EMD) Mandatory Payment</span>
              <span className="text-base font-extrabold text-amber-900">₹{tender.emd_amount.toLocaleString('en-IN')}</span>
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
                <label className="font-bold text-amber-900 block mb-1">Transaction Ref / UTR / DD No.</label>
                <input
                  type="text"
                  value={emdTxnRef}
                  onChange={(e) => setEmdTxnRef(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-800">Attach Required Bid Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-2 hover:border-gov-500 transition">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <span className="font-bold block text-slate-700">Covering Letter & Annexures (PDF)</span>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, 'COVERING_LETTER')}
                  className="text-[11px] text-slate-500 mx-auto block"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-2 hover:border-gov-500 transition">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <span className="font-bold block text-slate-700">EMD Payment Proof / Receipt</span>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, 'EMD_PROOF')}
                  className="text-[11px] text-slate-500 mx-auto block"
                />
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="pt-2">
                <span className="font-bold text-slate-700 block mb-1">Files Ready For Submission:</span>
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

      {/* STEP 6: REVIEW & FINAL SUBMIT */}
      {step === 6 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900">Step 6: Final Review & Submission Confirmation</h2>

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
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Quoted Amount</span>
                <span className="text-lg font-extrabold text-gov-800 flex items-center">
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
                      <th className="p-2.5">Est. Budget</th>
                      <th className="p-2.5 text-right">Job Quoted Total</th>
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
                          <td className="p-2.5 text-slate-600">₹{j.estimated_cost?.toLocaleString('en-IN') || '-'}</td>
                          <td className="p-2.5 text-right font-bold text-emerald-800">
                            ₹{jobTotal > 0 ? jobTotal.toLocaleString('en-IN') : (j.estimated_cost?.toLocaleString('en-IN') || '0')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <strong>Declaration of Authenticity & Multi-Job Compliance:</strong>
            <p>
              I/We hereby certify that our quotation accurately reflects our commitment for the {selectedJobIds.length} selected job package(s). By clicking Confirm & Submit Quotation, our bids will be locked into the PostgreSQL RFQ_DB database.
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
              {submitting ? 'Submitting to RFQ_DB...' : 'Confirm & Submit Quotation'}
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

