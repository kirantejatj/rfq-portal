import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import CountdownTimer from '../../components/CountdownTimer';
import { 
  Building2, User, Calendar, Plus, Trash2, IndianRupee, Upload, 
  CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Briefcase, CheckSquare, Square, FileCheck, Info, ShieldCheck, Clock, AlertTriangle, HelpCircle
} from 'lucide-react';

const UNIT_OPTIONS = [
  'MT', 'KG', 'Tonne', 'Quintal',
  'NOS', 'PCS', 'SET', 'Units',
  'SQM', 'SQFT', 'RMT', 'MTR', 'CUM', 'CFT',
  'LS', 'JOB', 'LOT', 'MONTHS', 'DAYS', 'TRIP'
];

const SUPPLY_TIME_OPTIONS = [
  '15 Days',
  '30 Days',
  '45 Days',
  '2 Months',
  '3 Months',
  '6 Months',
  '1 Year',
  '2 Years'
];

const ELIGIBLE_CATEGORIES = [
  'Manufacturer',
  'Authorised Dealer',
  'Authorised Distributor',
  'Contractor'
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

  // Default validity date: 90 days from today
  const defaultValidUpto = () => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split('T')[0];
  };

  // Vendor eligibility check
  const isVendorEligible = !user?.vendor_type || ELIGIBLE_CATEGORIES.includes(user?.vendor_type);

  // Step 1: Signatory & Covering Letter
  const [coveringDate, setCoveringDate] = useState(new Date().toISOString().split('T')[0]);
  const [signatoryName, setSignatoryName] = useState(user?.md_ceo_name || user?.name || '');
  const [signatoryDesignation, setSignatoryDesignation] = useState('Managing Director / Authorized Signatory');
  const [remarks, setRemarks] = useState('');

  // Step 2 (Merged Step 2 & Step 4): RFQ Items Selection & Itemized Pricing
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [validUptoGlobal, setValidUptoGlobal] = useState(defaultValidUpto());
  const [minSupplyTimeGlobal, setMinSupplyTimeGlobal] = useState('30 Days');
  const [proposalItems, setProposalItems] = useState([]);

  // Step 3: Annexure II - Past Technical & Financial Capabilities
  const [capabilities, setCapabilities] = useState([
    { sl_no: 1, work_description: '', client_name: '', cost_lakhs: '', financial_year: '2024-25' }
  ]);

  // Step 4: Supporting Documents & BOQ Document
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [annexureDocFile, setAnnexureDocFile] = useState(null);
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
        setError('Quotation window for this RFQ is currently closed.');
      }

      const tenderValidity = res.data.quotation_valid_upto 
        ? new Date(res.data.quotation_valid_upto).toISOString().split('T')[0] 
        : defaultValidUpto();
      setValidUptoGlobal(tenderValidity);

      // Initialize selected RFQ items (select all active items by default)
      if (res.data.jobs && res.data.jobs.length > 0) {
        const activeJobIds = res.data.jobs.filter(j => j.status === 'ACTIVE').map(j => j.job_id);
        setSelectedJobIds(activeJobIds);

        const initProposalItems = [];
        let sl = 1;

        res.data.jobs.forEach(j => {
          initProposalItems.push({
            sl_no: sl++,
            job_id: j.job_id,
            job_code: j.job_code || `ITEM-${j.job_id}`,
            item_description: j.job_name,
            work_type: j.work_type || '',
            cl_number: j.cl_number || '',
            unit: j.unit || 'MT',
            quantity: j.estimated_quantity || 1,
            rate_per_unit: j.unit_rate || '', // Vendor provides rate
            valid_upto: tenderValidity,
            min_supply_time: '30 Days',
            category: j.category || 'Supply Item',
            remarks: j.job_description || ''
          });
        });

        setProposalItems(initProposalItems);
      } else {
        setProposalItems([
          { 
            sl_no: 1, 
            job_id: null, 
            job_code: 'ITEM-01',
            item_description: 'Supply & fabrication of structural steel components as per IS 800', 
            work_type: 'Structural Work',
            cl_number: '',
            unit: 'MT', 
            quantity: 100, 
            rate_per_unit: '', 
            valid_upto: tenderValidity,
            min_supply_time: '30 Days',
            category: 'Supply Item', 
            remarks: '' 
          }
        ]);
      }
    } catch (err) {
      setError('Failed to load RFQ details');
    } finally {
      setLoading(false);
    }
  };

  // Job Selection Handlers
  const toggleJobSelection = (jobId) => {
    if (selectedJobIds.includes(jobId)) {
      if (selectedJobIds.length === 1 && tender?.jobs?.length > 0) {
        alert('You must select at least one RFQ item to submit a quotation.');
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

  // Proposal / Itemized pricing Handlers
  const addProposalRow = () => {
    setProposalItems([
      ...proposalItems,
      {
        sl_no: proposalItems.length + 1,
        job_id: selectedJobIds.length > 0 ? selectedJobIds[0] : null,
        job_code: `CUSTOM-0${proposalItems.length + 1}`,
        item_description: '',
        work_type: '',
        cl_number: '',
        unit: 'MT',
        quantity: 1,
        rate_per_unit: '',
        valid_upto: validUptoGlobal,
        min_supply_time: minSupplyTimeGlobal,
        category: 'Supply Item',
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

  const applyGlobalValidity = (val) => {
    setValidUptoGlobal(val);
    setProposalItems(prev => prev.map(p => ({ ...p, valid_upto: val })));
  };

  const applyGlobalSupplyTime = (val) => {
    setMinSupplyTimeGlobal(val);
    setProposalItems(prev => prev.map(p => ({ ...p, min_supply_time: val })));
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
        throw new Error('Please select at least one RFQ item from this tender.');
      }

      if (!validUptoGlobal) {
        throw new Error('Please specify a mandatory Quotation Validity Date (Valid Upto).');
      }

      // Verify each active proposal item has a valid rate
      for (const item of activeProposalItems) {
        if (!item.rate_per_unit || parseFloat(item.rate_per_unit) <= 0) {
          throw new Error(`Please enter a valid quoted rate for: "${item.item_description || 'Item #' + item.sl_no}"`);
        }
      }

      // Build selected_jobs payload with item-level computed totals
      const selectedJobsPayload = selectedJobIds.map(jobId => {
        const jobItems = activeProposalItems.filter(p => p.job_id === jobId);
        const jobTotal = jobItems.reduce((sum, item) => {
          const q = parseFloat(item.quantity) || 0;
          const r = parseFloat(item.rate_per_unit) || 0;
          return sum + (q * r);
        }, 0);
        const firstItem = jobItems[0];

        return {
          job_id: jobId,
          quoted_amount: jobTotal,
          valid_upto: firstItem?.valid_upto ? new Date(firstItem.valid_upto).toISOString() : new Date(validUptoGlobal).toISOString(),
          min_supply_time: firstItem?.min_supply_time || minSupplyTimeGlobal,
          remarks: firstItem?.remarks || ''
        };
      });

      const payload = {
        tender_id: parseInt(tenderId),
        covering_letter_date: coveringDate,
        signatory_name: signatoryName,
        signatory_designation: signatoryDesignation,
        quoted_amount: grandTotalQuoted,
        valid_upto: new Date(validUptoGlobal).toISOString(),
        min_supply_time: minSupplyTimeGlobal,
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
          valid_upto: p.valid_upto ? new Date(p.valid_upto).toISOString() : new Date(validUptoGlobal).toISOString(),
          min_supply_time: p.min_supply_time || minSupplyTimeGlobal,
          remarks: p.remarks
        })),
        emd: null
      };

      const res = await api.post('/applications', payload);
      const newAppId = res.data.application_id;

      // Upload attached files (Supporting docs, Annexure III doc, Signed RFQ, etc.)
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
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#7A1315] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-[#58595B] text-xs font-medium">Loading RFQ quotation submission wizard...</p>
      </div>
    );
  }

  // 5 Streamlined Steps (Step 2 & Step 4 merged)
  const stepsList = [
    { num: 1, label: 'Signatory & Covering' },
    { num: 2, label: 'RFQ Items & Itemized Pricing' },
    { num: 3, label: 'Annexure II (Capabilities)' },
    { num: 4, label: 'Supporting Documents' },
    { num: 5, label: 'Review & Submit' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-3">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div>
            <span className="text-xs font-mono font-bold text-[#7A1315] bg-[#FDE6D3] px-2.5 py-0.5 rounded border border-[#FBB97D]/50">
              {tender.tender_ref_no}
            </span>
            <h1 className="text-xl font-bold text-[#231F20] mt-1">{tender.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {tender.jobs && tender.jobs.length > 0 && (
                <span className="text-[11px] font-semibold text-[#7A1315] bg-[#FDE6D3]/50 px-2 py-0.5 rounded border border-[#FBB97D]">
                  📁 {tender.jobs.length} RFQ Items • {selectedJobIds.length} Selected
                </span>
              )}
              {tender.revealing_date && (
                <span className="text-[11px] font-semibold text-[#0E2C49] bg-[#E8EEF5] px-2 py-0.5 rounded border border-[#0E2C49]/30 flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-[#0E2C49]" />
                  Revealing Date: {new Date(tender.revealing_date).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={tender.status} />
            <CountdownTimer targetDate={tender.quotation_to_date} />
          </div>
        </div>

        {/* Vendor Eligibility Status Notice */}
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          isVendorEligible 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center space-x-2">
            {isVendorEligible ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>
              <strong>Vendor Eligibility Status:</strong> {isVendorEligible ? `Eligible (${user?.vendor_type || 'Registered Vendor'})` : `Ineligible (${user?.vendor_type || 'Unspecified Type'})`}
            </span>
          </div>
          {!isVendorEligible && (
            <span className="text-[10px] font-bold text-rose-700">
              Only Manufacturers, Authorised Dealers, Authorised Distributors, or Contractors may submit.
            </span>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center border border-red-200">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 5-Step Wizard Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        {stepsList.map(s => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            className={`p-3 rounded-xl border text-center transition font-bold flex flex-col items-center justify-center ${
              step === s.num
                ? 'bg-[#7A1315] text-white border-[#7A1315] shadow-md ring-2 ring-[#7A1315]/30'
                : step > s.num
                ? 'bg-[#FDE6D3] text-[#7A1315] border-[#FBB97D]'
                : 'bg-white text-[#58595B] border-[#A7A9AC]/30 hover:bg-[#FAF8F5]'
            }`}
          >
            <span className="text-[10px] opacity-80 uppercase tracking-wider">Step {s.num}</span>
            <span className="truncate w-full mt-0.5">{s.label}</span>
          </button>
        ))}
      </div>

      {/* STEP 1: COVERING LETTER & SIGNATORY */}
      {step === 1 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#A7A9AC]/30 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#231F20]">Step 1: Quotation Covering Letter & Signatory Details</h2>
            <p className="text-xs text-[#58595B]">Provide official authorization details and date for the quotation dossier.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#231F20] block mb-1">Covering Letter Date *</label>
              <input
                type="date"
                value={coveringDate}
                onChange={(e) => setCoveringDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg focus:ring-2 focus:ring-[#7A1315] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#231F20] block mb-1">Authorized Signatory Legal Name *</label>
              <input
                type="text"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                placeholder="Full Name"
                required
                className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg focus:ring-2 focus:ring-[#7A1315] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-[#231F20] block mb-1">Signatory Title / Designation *</label>
              <input
                type="text"
                value={signatoryDesignation}
                onChange={(e) => setSignatoryDesignation(e.target.value)}
                placeholder="e.g. Managing Director / Lead Partner / Authorized Signatory"
                required
                className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg focus:ring-2 focus:ring-[#7A1315] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-[#231F20] block mb-1">Covering Letter Notes / Commercial Remarks (Optional)</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="We hereby submit our commercial quotation for the requested scope of works..."
                className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg focus:ring-2 focus:ring-[#7A1315] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-[#7A1315] hover:bg-[#A31E22] text-white font-bold rounded-lg text-xs flex items-center shadow transition"
            >
              Next: Select Items & Enter Pricing
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MERGED RFQ ITEMS SELECTION & ITEMIZED PRICING (WITH VALID UPTO & MIN SUPPLY TIME) */}
      {step === 2 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#A7A9AC]/30 shadow-sm space-y-6">
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-[#231F20]">Step 2: RFQ Items Selection & Itemized Pricing</h2>
                <span className="text-[10px] font-black bg-[#CB902E] text-[#231F20] px-2 py-0.5 rounded shadow-xs">
                  Unified Step
                </span>
              </div>
              <p className="text-xs text-[#58595B] mt-0.5">
                Select the RFQ items your firm wishes to supply, specify your quoted rate per unit, validity date, and minimum supply time.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {tender?.jobs && tender.jobs.length > 0 && (
                <button
                  type="button"
                  onClick={selectAllJobs}
                  className="px-3 py-1.5 bg-[#FAF8F5] text-[#7A1315] font-bold rounded text-xs border border-[#A7A9AC]/40 hover:bg-[#FDE6D3] transition"
                >
                  Select All Items
                </button>
              )}
              <button
                type="button"
                onClick={addProposalRow}
                className="px-3 py-1.5 bg-[#7A1315] text-white hover:bg-[#A31E22] rounded text-xs font-bold flex items-center transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Item
              </button>
            </div>
          </div>

          {/* Quotation Validity & Supply Period Global Settings */}
          <div className="p-4 bg-gradient-to-r from-[#FAF8F5] to-[#FDE6D3]/40 rounded-xl border border-[#FBB97D]/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#7A1315] block mb-1 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-[#CB902E]" />
                Quotation Pricing Valid Upto (Mandatory Date) *
              </label>
              <input
                type="date"
                value={validUptoGlobal}
                onChange={(e) => applyGlobalValidity(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg bg-white font-bold text-[#231F20] focus:ring-2 focus:ring-[#7A1315] focus:outline-none"
              />
              <span className="text-[10px] text-[#58595B] mt-1 block">
                Specify till what date your submitted quotation rates remain firm and valid.
              </span>
            </div>

            <div>
              <label className="font-bold text-[#7A1315] block mb-1 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-[#CB902E]" />
                Minimum Time Required to Supply (Default) *
              </label>
              <select
                value={minSupplyTimeGlobal}
                onChange={(e) => applyGlobalSupplyTime(e.target.value)}
                className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg bg-white font-bold text-[#231F20] focus:ring-2 focus:ring-[#7A1315] focus:outline-none"
              >
                {SUPPLY_TIME_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <span className="text-[10px] text-[#58595B] mt-1 block">
                Standard delivery timeline required from the date of work order / purchase order.
              </span>
            </div>
          </div>

          {/* Itemized Pricing & Selection Cards/Rows */}
          <div className="space-y-4">
            {proposalItems.map((row, idx) => {
              const isSelected = !row.job_id || selectedJobIds.includes(row.job_id);
              const rowQty = parseFloat(row.quantity) || 0;
              const rowRate = parseFloat(row.rate_per_unit) || 0;
              const rowAmt = rowQty * rowRate;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-2 transition ${
                    isSelected
                      ? 'border-[#7A1315]/40 bg-white shadow-sm'
                      : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      {row.job_id && (
                        <button
                          type="button"
                          onClick={() => toggleJobSelection(row.job_id)}
                          className="mt-0.5 focus:outline-none"
                          title="Toggle item inclusion in your quotation"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-[#7A1315] fill-[#FDE6D3]" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                      )}
                      <div>
                        <span className="font-mono font-bold text-xs bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#A7A9AC]/40 text-[#7A1315]">
                          {row.job_code || `ITEM #${idx + 1}`}
                        </span>
                        <span className="font-bold text-sm text-[#231F20] ml-2">{row.item_description}</span>
                        {row.work_type && (
                          <span className="text-[10px] font-semibold text-[#0E2C49] bg-[#E8EEF5] px-2 py-0.5 rounded border border-[#0E2C49]/20 ml-2">
                            {row.work_type}
                          </span>
                        )}
                        {row.cl_number && (
                          <span className="text-[10px] font-mono text-[#58595B] ml-2">
                            Cl: {row.cl_number}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#231F20]">
                        Item Total: <span className="font-mono text-[#7A1315] font-extrabold text-sm">₹{rowAmt > 0 ? rowAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                      </span>
                      {!row.job_id && (
                        <button
                          type="button"
                          onClick={() => removeProposalRow(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Remove custom item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pricing Inputs Grid (Only enabled if item is selected) */}
                  {isSelected ? (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 text-xs">
                      <div className="sm:col-span-4">
                        <label className="text-[10px] font-bold text-[#58595B] block mb-1">Item Detailed Description *</label>
                        <input
                          type="text"
                          value={row.item_description}
                          onChange={(e) => handleProposalChange(idx, 'item_description', e.target.value)}
                          placeholder="e.g. Structural Steel Fabrication & Surface Coating"
                          required
                          className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white font-semibold text-[#231F20] focus:ring-2 focus:ring-[#7A1315] focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-[#58595B] block mb-1">Quantity *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={row.quantity}
                          onChange={(e) => handleProposalChange(idx, 'quantity', e.target.value)}
                          placeholder="Quantity"
                          required
                          className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white font-mono font-bold text-[#231F20] focus:ring-2 focus:ring-[#7A1315] focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-[#58595B] block mb-1">Unit (UOM) *</label>
                        <select
                          value={UNIT_OPTIONS.includes(row.unit) ? row.unit : 'Custom'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val !== 'Custom') {
                              handleProposalChange(idx, 'unit', val);
                            }
                          }}
                          className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white font-semibold text-[#231F20] focus:ring-2 focus:ring-[#7A1315] focus:outline-none"
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

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-black text-[#7A1315] block mb-1">Your Quoted Rate (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={row.rate_per_unit}
                          onChange={(e) => handleProposalChange(idx, 'rate_per_unit', e.target.value)}
                          placeholder="Enter Rate (₹)"
                          required
                          className="w-full px-2.5 py-1.5 border-2 border-[#7A1315] rounded bg-white font-mono font-black text-[#7A1315] focus:ring-2 focus:ring-[#CB902E] focus:outline-none shadow-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-[#58595B] block mb-1">Time to Supply *</label>
                        <select
                          value={row.min_supply_time || minSupplyTimeGlobal}
                          onChange={(e) => handleProposalChange(idx, 'min_supply_time', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white font-bold text-[#231F20] focus:ring-2 focus:ring-[#7A1315] focus:outline-none"
                        >
                          {SUPPLY_TIME_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-12">
                        <label className="text-[10px] font-bold text-[#58595B] block mb-0.5">Item Technical Notes / Grade Specification Remarks (Optional):</label>
                        <input
                          type="text"
                          value={row.remarks || ''}
                          onChange={(e) => handleProposalChange(idx, 'remarks', e.target.value)}
                          placeholder="e.g. Quoting with IS 2062 Grade E250BR certified steel plates with test certificates"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-[#A7A9AC]/40 rounded focus:bg-white focus:ring-1 focus:ring-[#7A1315] focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic pt-2">
                      Item excluded from quotation. Click the checkbox on the left to include this package.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grand Total Bar */}
          <div className="p-4 bg-gradient-to-r from-[#231F20] to-[#7A1315] text-white rounded-xl shadow-md flex flex-wrap justify-between items-center text-sm gap-2">
            <div>
              <span className="font-bold block text-[#FDE6D3]">
                Total Quoted Amount for {activeProposalItems.length} Selected RFQ Item(s):
              </span>
              <span className="text-[11px] text-[#FBB97D]">
                Valid Upto: <strong>{validUptoGlobal}</strong> • Supply Time: <strong>{minSupplyTimeGlobal}</strong>
              </span>
            </div>
            <span className="text-2xl font-black text-white flex items-center font-mono">
              <IndianRupee className="w-5 h-5 mr-0.5 text-[#CB902E]" />
              ₹{grandTotalQuoted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200 flex items-center transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeProposalItems.length === 0) {
                  alert('Please select or add at least one RFQ item before proceeding.');
                  return;
                }
                setStep(3);
              }}
              className="px-5 py-2.5 bg-[#7A1315] hover:bg-[#A31E22] text-white font-bold rounded-lg text-xs flex items-center shadow transition"
            >
              Next: Annexure II (Capabilities)
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ANNEXURE II - PAST CAPABILITIES */}
      {step === 3 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#A7A9AC]/30 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-[#231F20]">Step 3: Annexure II — Past Technical & Financial Capabilities</h2>
              <p className="text-xs text-[#58595B]">Provide details of similar engineering, manufacturing, or supply works executed previously.</p>
            </div>
            <button
              type="button"
              onClick={addCapabilityRow}
              className="px-3 py-1.5 bg-[#FAF8F5] text-[#7A1315] hover:bg-[#FDE6D3] rounded-lg text-xs font-bold border border-[#FBB97D] flex items-center transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Project
            </button>
          </div>

          <div className="space-y-3">
            {capabilities.map((row, idx) => (
              <div key={idx} className="p-4 bg-[#FAF8F5] rounded-lg border border-[#A7A9AC]/30 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-center">
                <div className="sm:col-span-1 font-bold text-[#58595B] text-center">#{row.sl_no}</div>
                <div className="sm:col-span-5">
                  <label className="text-[10px] text-[#58595B] block font-semibold">Work Description</label>
                  <input
                    type="text"
                    value={row.work_description}
                    onChange={(e) => handleCapabilityChange(idx, 'work_description', e.target.value)}
                    placeholder="Details of works / supplies completed"
                    className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white font-medium"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[10px] text-[#58595B] block font-semibold">Client / Authority</label>
                  <input
                    type="text"
                    value={row.client_name}
                    onChange={(e) => handleCapabilityChange(idx, 'client_name', e.target.value)}
                    placeholder="e.g. NHAI / APCRDA / AGIC / L&T"
                    className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white font-medium"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[10px] text-[#58595B] block font-semibold">Cost (₹ L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={row.cost_lakhs}
                    onChange={(e) => handleCapabilityChange(idx, 'cost_lakhs', e.target.value)}
                    placeholder="450"
                    className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white font-mono font-bold text-[#7A1315]"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[10px] text-[#58595B] block font-semibold">FY</label>
                  <input
                    type="text"
                    value={row.financial_year}
                    onChange={(e) => handleCapabilityChange(idx, 'financial_year', e.target.value)}
                    placeholder="2024-25"
                    className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white text-center font-semibold"
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
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200 flex items-center transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-5 py-2.5 bg-[#7A1315] hover:bg-[#A31E22] text-white font-bold rounded-lg text-xs flex items-center shadow transition"
            >
              Next: Supporting Documents
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUPPORTING DOCUMENTS & BOQ DOCUMENT UPLOAD */}
      {step === 4 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#A7A9AC]/30 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#231F20]">Step 4: Upload Supporting Documents & BOQ Sheet</h2>
            <p className="text-xs text-[#58595B]">Attach your detailed BOQ calculation sheet, covering letter, and technical compliance certificates.</p>
          </div>

          {/* Annexure III Proposal Sheet / Itemized BOQ Document */}
          <div className="p-4 border-2 border-dashed border-[#CB902E] bg-[#FDE6D3]/30 rounded-xl space-y-2">
            <label className="font-bold text-[#231F20] block text-xs flex items-center">
              <Upload className="w-4 h-4 mr-1.5 text-[#7A1315]" />
              Detailed Itemized BOQ Proposal Sheet / Vendor Quotation Letter (PDF / Excel / Scan) *
            </label>
            <input
              type="file"
              onChange={(e) => setAnnexureDocFile(e.target.files[0])}
              accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png"
              className="text-xs text-[#58595B] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#7A1315] file:text-white hover:file:bg-[#A31E22] border border-[#A7A9AC]/50 rounded-lg p-1.5 w-full bg-white"
            />
            {annexureDocFile && (
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Attached: {annexureDocFile.name} ({(annexureDocFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
            <p className="text-[11px] text-[#58595B]">
              * Note: Please ensure the total amount in your attached document matches your entered total: <strong>₹{grandTotalQuoted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>.
            </p>
          </div>

          {/* File Uploads Grid */}
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-dashed border-[#A7A9AC]/40 rounded-xl text-center space-y-2 hover:border-[#7A1315] transition bg-[#FAF8F5]">
                <Upload className="w-6 h-6 text-[#A7A9AC] mx-auto" />
                <span className="font-bold block text-[#231F20]">Covering Letter / Formal Bid (PDF)</span>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, 'COVERING_LETTER')}
                  className="text-[11px] text-[#58595B] mx-auto block"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-[#A7A9AC]/40 rounded-xl text-center space-y-2 hover:border-[#7A1315] transition bg-[#FAF8F5]">
                <Upload className="w-6 h-6 text-[#A7A9AC] mx-auto" />
                <span className="font-bold block text-[#231F20]">Quality & Test Certificates / Specs (PDF / ZIP)</span>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, 'TECHNICAL_SPECS')}
                  className="text-[11px] text-[#58595B] mx-auto block"
                />
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="pt-2">
                <span className="font-bold text-[#231F20] block mb-1">Uploaded Supporting Files:</span>
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
              onClick={() => setStep(3)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200 flex items-center transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="px-5 py-2.5 bg-[#7A1315] hover:bg-[#A31E22] text-white font-bold rounded-lg text-xs flex items-center shadow transition"
            >
              Next: Review & Final Submission
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: FINAL REVIEW & SUBMISSION */}
      {step === 5 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#A7A9AC]/30 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#231F20]">Step 5: Final Review & Submission Confirmation</h2>
            <p className="text-xs text-[#58595B]">Verify your quotation details before recording your bid into the database.</p>
          </div>

          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#A7A9AC]/30 space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[#58595B] block text-[10px] uppercase font-bold">RFQ Ref</span>
                <span className="font-bold text-[#7A1315] font-mono">{tender.tender_ref_no}</span>
              </div>
              <div>
                <span className="text-[#58595B] block text-[10px] uppercase font-bold">Vendor Firm</span>
                <span className="font-bold text-[#231F20]">{user?.firm_name}</span>
              </div>
              <div>
                <span className="text-[#58595B] block text-[10px] uppercase font-bold">Quotation Valid Upto</span>
                <span className="font-bold text-[#7A1315]">{validUptoGlobal}</span>
              </div>
              <div>
                <span className="text-[#58595B] block text-[10px] uppercase font-bold">Min Supply Time</span>
                <span className="font-bold text-[#231F20]">{minSupplyTimeGlobal}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[#58595B] block text-[10px] uppercase font-bold">Authorized Signatory</span>
                <span className="font-bold text-[#231F20]">{signatoryName} ({signatoryDesignation})</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[#58595B] block text-[10px] uppercase font-bold">Total Quoted Amount</span>
                <span className="text-xl font-black text-[#7A1315] flex items-center font-mono">
                  <IndianRupee className="w-5 h-5 mr-0.5 text-[#CB902E]" />
                  ₹{grandTotalQuoted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Selected Items Summary Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#231F20] uppercase tracking-wider">
              Quoted RFQ Items Breakdown ({activeProposalItems.length}):
            </h3>
            <div className="border border-[#A7A9AC]/30 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#A7A9AC]/30 font-bold text-[#58595B]">
                  <tr>
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5">Qty / Unit</th>
                    <th className="p-2.5">Quoted Rate</th>
                    <th className="p-2.5">Supply Time</th>
                    <th className="p-2.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeProposalItems.map((item, idx) => {
                    const itemAmt = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate_per_unit) || 0);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-mono font-bold text-[#7A1315]">{item.job_code || `ITEM-${idx + 1}`}</td>
                        <td className="p-2.5 font-semibold text-[#231F20]">{item.item_description}</td>
                        <td className="p-2.5 text-[#58595B]">{item.quantity} {item.unit}</td>
                        <td className="p-2.5 font-bold font-mono text-[#7A1315]">₹{parseFloat(item.rate_per_unit || 0).toLocaleString('en-IN')}</td>
                        <td className="p-2.5 font-medium text-[#231F20]">{item.min_supply_time || minSupplyTimeGlobal}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-800 font-mono">
                          ₹{itemAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Provision to attach signed RFQ Document as optional */}
          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#A7A9AC]/30 space-y-2 text-xs">
            <label className="font-bold text-[#231F20] block flex items-center">
              <FileCheck className="w-4 h-4 mr-1.5 text-[#7A1315]" />
              Attach Signed RFQ Acceptance / Bid Declaration (Optional PDF)
            </label>
            <input
              type="file"
              onChange={(e) => setSignedRfqFile(e.target.files[0])}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="text-xs text-[#58595B] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#7A1315] file:text-white hover:file:bg-[#A31E22] border border-[#A7A9AC]/50 rounded-lg p-1.5 w-full bg-white"
            />
            {signedRfqFile && (
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Attached: {signedRfqFile.name} ({(signedRfqFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <strong>Declaration of Authenticity & Commitment:</strong>
            <p>
              I/We hereby certify that our quotation of <strong>₹{grandTotalQuoted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> is valid upto <strong>{validUptoGlobal}</strong> and accurately reflects our commercial commitment.
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200 flex items-center transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              type="button"
              disabled={submitting || !isVendorEligible}
              onClick={handleFinalSubmit}
              className={`px-6 py-3 font-bold rounded-lg text-sm shadow-md transition flex items-center ${
                !isVendorEligible
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {submitting ? 'Submitting to Database...' : !isVendorEligible ? 'Ineligible to Submit' : 'Confirm & Submit Quotation'}
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
