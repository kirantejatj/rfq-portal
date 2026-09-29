import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../../api/client';
import { 
  Building2, Layers, Calendar, FileText, ArrowLeft, ArrowRight, 
  Plus, Trash2, Briefcase, Clock, ShieldCheck, AlertCircle, Save, 
  ShieldAlert, Download, FileSpreadsheet, Image as ImageIcon, CheckCircle2 
} from 'lucide-react';

export default function EditTender() {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState('');
  const [excelSuccess, setExcelSuccess] = useState('');

  const [formData, setFormData] = useState({
    tender_ref_no: '',
    title: '',
    authority_name: '',
    background: '',
    scope_of_work: '',
    total_elements: 500,
    element_types: 10,
    max_weight_mt: 10.0,
    min_weight_mt: 1.0,
    avg_weight_mt: 4.5,
    quotation_from_date: '',
    quotation_to_date: '',
    revealing_date: '',
    opening_date: '',
    quotation_valid_upto: '',
    validity_period: '90 Days from Quotation Opening',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    office_address: '',
    status: 'PUBLISHED'
  });

  const [jobs, setJobs] = useState([]);
  const [paperClippingFile, setPaperClippingFile] = useState(null);
  const [paperClippingPreview, setPaperClippingPreview] = useState(null);
  const [existingDocuments, setExistingDocuments] = useState([]);

  useEffect(() => {
    fetchTenderDetails();
  }, [tenderId]);

  const fetchTenderDetails = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const res = await api.get(`/tenders/${tenderId}`);
      const t = res.data;

      const formatDateForInput = (isoStr) => {
        if (!isoStr) return '';
        try {
          return new Date(isoStr).toISOString().slice(0, 16);
        } catch (e) {
          return '';
        }
      };

      setFormData({
        tender_ref_no: t.tender_ref_no || '',
        title: t.title || '',
        authority_name: t.authority_name || 'Amaravati Growth and Infrastructure Corporation Limited',
        background: t.background || '',
        scope_of_work: t.scope_of_work || '',
        total_elements: t.total_elements || 500,
        element_types: t.element_types || 10,
        max_weight_mt: t.max_weight_mt || 10.0,
        min_weight_mt: t.min_weight_mt || 1.0,
        avg_weight_mt: t.avg_weight_mt || 4.5,
        quotation_from_date: formatDateForInput(t.quotation_from_date),
        quotation_to_date: formatDateForInput(t.quotation_to_date),
        revealing_date: formatDateForInput(t.revealing_date || t.quotation_to_date),
        opening_date: formatDateForInput(t.opening_date),
        quotation_valid_upto: formatDateForInput(t.quotation_valid_upto),
        validity_period: t.validity_period || '90 Days from Quotation Opening',
        contact_person: t.contact_person || '',
        contact_email: t.contact_email || '',
        contact_phone: t.contact_phone || '',
        office_address: t.office_address || '',
        status: t.status || 'PUBLISHED'
      });

      setExistingDocuments(t.documents || []);

      if (t.jobs && t.jobs.length > 0) {
        setJobs(t.jobs.map(j => ({
          job_id: j.job_id,
          job_code: j.job_code || `ITEM-${j.job_id}`,
          job_name: j.job_name || '',
          job_description: j.job_description || '',
          work_type: j.work_type || '',
          cl_number: j.cl_number || '',
          category: j.category || 'Supply Item',
          estimated_quantity: j.estimated_quantity || 100,
          unit: j.unit || 'MT',
          unit_rate: j.unit_rate || '',
          amount: j.amount || '',
          status: j.status || 'ACTIVE'
        })));
      } else {
        setJobs([
          {
            job_code: 'ITEM-01',
            job_name: 'Structural Work',
            job_description: '',
            work_type: 'Structural Work',
            cl_number: '',
            category: 'Supply Item',
            estimated_quantity: 100,
            unit: 'MT',
            unit_rate: '',
            amount: '',
            status: 'ACTIVE'
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load RFQ for editing', err);
      if (err.response?.status === 403) {
        setAuthError(err.response?.data?.detail || 'Access Restricted: You do not have authorization to edit this RFQ.');
      } else {
        setError('Failed to load RFQ details. Please verify the RFQ ID.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddJob = () => {
    const jobNum = jobs.length + 1;
    const defaultCode = `ITEM-${jobNum < 10 ? '0' + jobNum : jobNum}`;
    setJobs([
      ...jobs,
      {
        job_code: defaultCode,
        job_name: '',
        job_description: '',
        work_type: '',
        cl_number: '',
        category: 'Supply Item',
        estimated_quantity: 100,
        unit: 'MT',
        unit_rate: '',
        amount: '',
        status: 'ACTIVE'
      }
    ]);
  };

  const handleRemoveJob = (index) => {
    setJobs(jobs.filter((_, i) => i !== index));
  };

  const handleJobChange = (index, field, value) => {
    const updated = [...jobs];
    updated[index][field] = value;
    if (field === 'estimated_quantity' || field === 'unit_rate') {
      const q = parseFloat(field === 'estimated_quantity' ? value : updated[index].estimated_quantity) || 0;
      const r = parseFloat(field === 'unit_rate' ? value : updated[index].unit_rate) || 0;
      if (q > 0 && r > 0) {
        updated[index].amount = q * r;
      }
    }
    setJobs(updated);
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      [
        'Estimate Quantity (only Figures)',
        'Item Detailed Specification Description',
        'Work Type (eg. Earth Work, Electrical works.. etc - upto 200 Characters)',
        'Item Short Description (upto 100 Characters)',
        'APSS / Morth Cl. Number (upto 200 Characters)',
        'Rate (INR) (Upto 2 Decimals)',
        'UOM (upto 50 Characters)',
        'Amount (INR) (Upto 2 Decimals)'
      ],
      [
        250,
        'Fabrication, supplying and delivery of welded structural steel elements conforming to IS:2062 Grade E250.',
        'Structural Steel Work',
        'Supply of Structural Steel Beams & Girders',
        'APSS Cl. 1204 / MORTH 1900',
        68500,
        'MT',
        17125000
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 22 }, { wch: 45 }, { wch: 30 }, { wch: 35 },
      { wch: 25 }, { wch: 18 }, { wch: 12 }, { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'RFQ Items Template');
    XLSX.writeFile(wb, 'RFQ_Items_Official_Template.xlsx');
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setExcelSuccess('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!rawData || rawData.length < 2) {
          throw new Error('The uploaded Excel file does not contain item data rows.');
        }

        const headers = rawData[0].map(h => (h ? h.toString().trim().toLowerCase() : ''));
        const findColIndex = (keywords) => headers.findIndex(h => keywords.some(k => h.includes(k.toLowerCase())));

        const qtyIdx = findColIndex(['estimate quantity', 'quantity', 'qty']);
        const specIdx = findColIndex(['detailed specification', 'item detailed', 'specification', 'description']);
        const workTypeIdx = findColIndex(['work type', 'type of work']);
        const shortDescIdx = findColIndex(['short description', 'item short', 'item name', 'name']);
        const clNumIdx = findColIndex(['cl. number', 'cl number', 'apss', 'morth']);
        const rateIdx = findColIndex(['rate (inr)', 'rate', 'unit rate']);
        const uomIdx = findColIndex(['uom', 'unit']);
        const amountIdx = findColIndex(['amount (inr)', 'amount', 'total']);

        const parsedJobs = [];
        for (let i = 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length === 0 || row.every(c => c === null || c === undefined || c === '')) continue;

          const qty = qtyIdx >= 0 && row[qtyIdx] !== undefined ? parseFloat(row[qtyIdx]) || 1 : 1;
          const spec = specIdx >= 0 && row[specIdx] ? row[specIdx].toString().trim() : '';
          const workType = workTypeIdx >= 0 && row[workTypeIdx] ? row[workTypeIdx].toString().trim() : 'Supply Item';
          const shortDesc = shortDescIdx >= 0 && row[shortDescIdx] ? row[shortDescIdx].toString().trim() : (spec ? spec.slice(0, 60) : `RFQ Item #${i}`);
          const clNum = clNumIdx >= 0 && row[clNumIdx] ? row[clNumIdx].toString().trim() : '';
          const rate = rateIdx >= 0 && row[rateIdx] !== undefined ? parseFloat(row[rateIdx]) || null : null;
          const uom = uomIdx >= 0 && row[uomIdx] ? row[uomIdx].toString().trim().toUpperCase() : 'MT';
          const amt = amountIdx >= 0 && row[amountIdx] !== undefined ? parseFloat(row[amountIdx]) || (rate ? qty * rate : null) : (rate ? qty * rate : null);

          const itemNum = i;
          const code = `ITEM-${itemNum < 10 ? '0' + itemNum : itemNum}`;

          parsedJobs.push({
            job_code: code,
            job_name: shortDesc,
            job_description: spec,
            work_type: workType,
            cl_number: clNum,
            category: 'Supply Item',
            estimated_quantity: qty,
            unit: uom,
            unit_rate: rate,
            amount: amt,
            status: 'ACTIVE'
          });
        }

        if (parsedJobs.length === 0) {
          throw new Error('No valid RFQ item rows could be read from the uploaded Excel sheet.');
        }

        setJobs(parsedJobs);
        setExcelSuccess(`Successfully imported ${parsedJobs.length} RFQ items from Excel file!`);
      } catch (err) {
        console.error('Excel parse error', err);
        setError(`Excel Upload Failed: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handlePaperClippingChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPaperClippingFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPaperClippingPreview(evt.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPaperClippingPreview(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        authority_name: formData.authority_name,
        background: formData.background,
        scope_of_work: formData.scope_of_work,
        total_elements: parseInt(formData.total_elements) || null,
        element_types: parseInt(formData.element_types) || null,
        max_weight_mt: parseFloat(formData.max_weight_mt) || null,
        min_weight_mt: parseFloat(formData.min_weight_mt) || null,
        avg_weight_mt: parseFloat(formData.avg_weight_mt) || null,
        quotation_from_date: new Date(formData.quotation_from_date).toISOString(),
        quotation_to_date: new Date(formData.quotation_to_date).toISOString(),
        revealing_date: formData.revealing_date ? new Date(formData.revealing_date).toISOString() : new Date(formData.quotation_to_date).toISOString(),
        opening_date: formData.opening_date ? new Date(formData.opening_date).toISOString() : null,
        quotation_valid_upto: formData.quotation_valid_upto ? new Date(formData.quotation_valid_upto).toISOString() : null,
        validity_period: formData.validity_period || '90 Days from Quotation Opening',
        contact_person: formData.contact_person,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        office_address: formData.office_address,
        status: formData.status,
        jobs: jobs.map((j, idx) => ({
          job_code: j.job_code || `ITEM-${idx + 1}`,
          job_name: j.job_name,
          job_description: j.job_description,
          work_type: j.work_type,
          cl_number: j.cl_number,
          category: j.category || 'Supply Item',
          estimated_quantity: parseFloat(j.estimated_quantity) || null,
          unit: j.unit,
          unit_rate: parseFloat(j.unit_rate) || null,
          amount: parseFloat(j.amount) || null,
          status: j.status || 'ACTIVE'
        }))
      };

      await api.put(`/tenders/${tenderId}`, payload);

      if (paperClippingFile) {
        const pData = new FormData();
        pData.append('document_type', 'PAPER_CLIPPING');
        pData.append('file', paperClippingFile);
        try {
          await api.post(`/tenders/${tenderId}/documents`, pData);
        } catch (pErr) {
          console.error('Paper clipping upload failed', pErr);
        }
      }

      alert(`RFQ ${formData.tender_ref_no} updated successfully!`);
      navigate('/ce/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update RFQ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#7A1315] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-[#58595B] text-xs font-medium">Loading RFQ for editing...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">{authError}</p>
        <Link
          to="/ce/dashboard"
          className="inline-flex items-center px-4 py-2 bg-gov-600 text-white rounded-lg text-xs font-bold hover:bg-gov-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Executive Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl p-8 border border-[#A7A9AC]/30 shadow-xl space-y-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <span className="text-xs font-bold text-[#7A1315] uppercase tracking-wider">Officer RFQ Modification Module</span>
            <h1 className="text-2xl font-bold text-[#231F20]">Edit RFQ: {formData.tender_ref_no}</h1>
            <p className="text-xs text-[#58595B]">
              Update technical specs, schedule of RFQ items, newspaper paper clipping, and revealing date.
            </p>
          </div>
          <Link
            to="/ce/dashboard"
            className="px-3 py-1.5 border border-[#A7A9AC]/50 text-[#231F20] font-bold rounded-lg text-xs hover:bg-[#FAF8F5] flex items-center transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {excelSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs border border-emerald-200 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 text-emerald-600" />
            <span>{excelSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Section 1: RFQ Identification */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#231F20] border-b pb-1 text-sm">1. RFQ Identification & Title</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-[#231F20] block mb-1">RFQ Ref No (Read Only)</label>
                <input
                  type="text"
                  name="tender_ref_no"
                  value={formData.tender_ref_no}
                  disabled
                  className="w-full px-3 py-2 border border-[#A7A9AC]/40 rounded-lg font-mono font-bold text-slate-500 bg-slate-100 cursor-not-allowed"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-bold text-[#231F20] block mb-1">RFQ Title / Work Description *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg font-semibold text-[#231F20]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: RFQ Items Schedule with Excel Download & Upload */}
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center border-b pb-2 gap-2">
              <div>
                <h3 className="font-bold text-[#231F20] text-sm flex items-center">
                  <Briefcase className="w-4 h-4 mr-1.5 text-[#7A1315]" />
                  2. RFQ Items Schedule ({jobs.length} Items)
                </h3>
                <p className="text-[11px] text-[#58595B]">
                  Download official 8-column template, upload updated Excel sheet, or edit rows directly.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-[#FAF8F5] text-[#231F20] hover:bg-[#FDE6D3] rounded-lg text-xs font-bold border border-[#FBB97D] flex items-center transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1 text-[#CB902E]" />
                  Download Excel Template
                </button>

                <label className="px-3 py-1.5 bg-[#CB902E] hover:bg-[#B07B23] text-[#231F20] rounded-lg text-xs font-black flex items-center transition shadow-xs cursor-pointer">
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-[#231F20]" />
                  Upload Excel (.xlsx)
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleAddJob}
                  className="px-3 py-1.5 bg-[#7A1315] text-white hover:bg-[#A31E22] rounded-lg text-xs font-bold flex items-center transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Row
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {jobs.map((job, idx) => (
                <div key={idx} className="p-4 bg-[#FAF8F5] rounded-xl border border-[#A7A9AC]/30 space-y-3">
                  <div className="flex justify-between items-center border-b border-[#A7A9AC]/30 pb-2">
                    <span className="font-bold text-[#7A1315] text-xs">RFQ Item #{idx + 1}</span>
                    {jobs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveJob(idx)}
                        className="text-rose-500 hover:text-rose-700 font-semibold text-xs flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Remove Item
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-[#58595B] block mb-1">Item Code *</label>
                      <input
                        type="text"
                        value={job.job_code}
                        onChange={(e) => handleJobChange(idx, 'job_code', e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label className="font-semibold text-[#58595B] block mb-1">Item Short Description *</label>
                      <input
                        type="text"
                        value={job.job_name}
                        onChange={(e) => handleJobChange(idx, 'job_name', e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white font-semibold text-[#231F20]"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="font-semibold text-[#58595B] block mb-1">Work Type</label>
                      <input
                        type="text"
                        value={job.work_type || ''}
                        onChange={(e) => handleJobChange(idx, 'work_type', e.target.value)}
                        placeholder="e.g. Earth Work / Structural"
                        className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white font-medium"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="font-semibold text-[#58595B] block mb-1">APSS / MORTH Cl. No</label>
                      <input
                        type="text"
                        value={job.cl_number || ''}
                        onChange={(e) => handleJobChange(idx, 'cl_number', e.target.value)}
                        placeholder="e.g. APSS Cl. 1204 / MORTH 1900"
                        className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white font-mono text-xs"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="font-semibold text-[#58595B] block mb-1">Estimated Quantity *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={job.estimated_quantity}
                        onChange={(e) => handleJobChange(idx, 'estimated_quantity', e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white font-mono font-bold text-[#231F20]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-semibold text-[#58595B] block mb-1">Unit of Measure *</label>
                      <select
                        value={job.unit}
                        onChange={(e) => handleJobChange(idx, 'unit', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white text-center font-semibold"
                      >
                        <option value="MT">MT</option>
                        <option value="KG">KG</option>
                        <option value="NOS">NOS</option>
                        <option value="PCS">PCS</option>
                        <option value="SET">SET</option>
                        <option value="SQM">SQM</option>
                        <option value="SQFT">SQFT</option>
                        <option value="RMT">RMT</option>
                        <option value="CUM">CUM</option>
                        <option value="LOT">LOT</option>
                        <option value="JOB">JOB</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-semibold text-[#58595B] block mb-1">Officer Ref Rate (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={job.unit_rate || ''}
                        onChange={(e) => handleJobChange(idx, 'unit_rate', e.target.value)}
                        placeholder="Ref Rate"
                        className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-semibold text-[#58595B] block mb-1">Estimated Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={job.amount || ''}
                        onChange={(e) => handleJobChange(idx, 'amount', e.target.value)}
                        placeholder="Amount"
                        className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white font-mono font-bold text-[#7A1315]"
                      />
                    </div>

                    <div className="sm:col-span-12">
                      <label className="font-semibold text-[#58595B] block mb-1">Item Detailed Specification Description</label>
                      <textarea
                        rows={2}
                        value={job.job_description}
                        onChange={(e) => handleJobChange(idx, 'job_description', e.target.value)}
                        placeholder="Detailed technical specifications, tolerance, and deliverables for this item..."
                        className="w-full px-2.5 py-1.5 border border-[#A7A9AC]/50 rounded bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Paper Clipping / Newspaper Advertisement Upload */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#231F20] border-b pb-1 text-sm flex items-center">
              <ImageIcon className="w-4 h-4 mr-1.5 text-[#7A1315]" />
              3. Paper Clipping / Newspaper Advertisement Upload
            </h3>
            <p className="text-[11px] text-[#58595B]">
              Upload or replace the newspaper tender notice / clipping (.png, .jpg, .jpeg, .webp, .pdf).
            </p>

            <div className="p-4 border-2 border-dashed border-[#A7A9AC]/50 rounded-xl bg-[#FAF8F5] text-center space-y-3">
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf"
                onChange={handlePaperClippingChange}
                className="text-xs text-[#58595B] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#7A1315] file:text-white hover:file:bg-[#A31E22] border border-[#A7A9AC]/50 rounded-lg p-1.5 w-full bg-white max-w-md mx-auto block"
              />

              {paperClippingPreview && (
                <div className="mt-3 inline-block border-2 border-[#CB902E] rounded-lg p-1 bg-white shadow-md">
                  <p className="text-[10px] font-bold text-[#7A1315] mb-1">New Paper Clipping Preview:</p>
                  <img
                    src={paperClippingPreview}
                    alt="Paper Clipping Preview"
                    className="max-h-48 rounded object-contain mx-auto"
                  />
                </div>
              )}

              {/* Existing documents */}
              {existingDocuments.filter(d => d.document_type === 'PAPER_CLIPPING').length > 0 && !paperClippingPreview && (
                <div className="text-xs text-slate-700 bg-white p-2 rounded border border-[#A7A9AC]/30 inline-block">
                  <span className="font-bold text-[#7A1315]">Currently Attached Newspaper Clipping: </span>
                  {existingDocuments.filter(d => d.document_type === 'PAPER_CLIPPING').map(d => (
                    <a
                      key={d.tender_document_id}
                      href={`http://127.0.0.1:8000${d.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline font-bold ml-1"
                    >
                      {d.file_name} ({d.file_size_kb} KB)
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Scope & Background */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#231F20] border-b pb-1 text-sm">4. Scope of Work & Background</h3>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-[#231F20] block mb-1">Overall Scope of Work *</label>
                <textarea
                  rows={3}
                  name="scope_of_work"
                  value={formData.scope_of_work}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-[#231F20] block mb-1">Project Background</label>
                <input
                  type="text"
                  name="background"
                  value={formData.background}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Technical Specs & Weight Parameters */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#231F20] border-b pb-1 text-sm">5. Technical Specs & Weight Parameters</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-[#231F20] block mb-1">Total Elements (pcs)</label>
                <input
                  type="number"
                  name="total_elements"
                  value={formData.total_elements}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-[#231F20] block mb-1">Element Types</label>
                <input
                  type="number"
                  name="element_types"
                  value={formData.element_types}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-[#231F20] block mb-1">Avg Weight (MT)</label>
                <input
                  type="number"
                  step="0.01"
                  name="avg_weight_mt"
                  value={formData.avg_weight_mt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-[#231F20] block mb-1">Max Weight (MT)</label>
                <input
                  type="number"
                  step="0.01"
                  name="max_weight_mt"
                  value={formData.max_weight_mt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Quotation Timelines & Quotation Revealing Date */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#231F20] border-b pb-1 text-sm">6. Quotation Timelines & Quotation Revealing Date</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-[#231F20] block mb-1">Quotation Window START *</label>
                <input
                  type="datetime-local"
                  name="quotation_from_date"
                  value={formData.quotation_from_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-[#231F20] block mb-1">Submission Deadline (Cutoff) *</label>
                <input
                  type="datetime-local"
                  name="quotation_to_date"
                  value={formData.quotation_to_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg font-bold text-[#7A1315]"
                />
              </div>

              {/* Revealing Date Field */}
              <div>
                <label className="font-black text-[#7A1315] block mb-1 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-[#CB902E]" />
                  Quotation Revealing Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="revealing_date"
                  value={formData.revealing_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border-2 border-[#7A1315] rounded-lg font-bold text-[#7A1315] bg-[#FDE6D3]/40 focus:ring-2 focus:ring-[#CB902E]"
                />
                <span className="text-[10px] text-[#58595B] mt-0.5 block">
                  🔒 Vendor bids remain sealed/encrypted from CE evaluation until this date/time.
                </span>
              </div>

              <div>
                <label className="font-bold text-[#231F20] block mb-1">Quotation Valid Upto (Date) *</label>
                <input
                  type="datetime-local"
                  name="quotation_valid_upto"
                  value={formData.quotation_valid_upto}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg font-bold text-[#0E2C49]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-[#231F20] block mb-1">Quotation Validity Period (Text) *</label>
                <input
                  type="text"
                  name="validity_period"
                  value={formData.validity_period}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg font-semibold text-[#231F20]"
                />
              </div>
            </div>
          </div>

          {/* Section 7: Contact Person & Status */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#231F20] border-b pb-1 text-sm">7. Authority Contact & Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-[#231F20] block mb-1">Contact Officer Name</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-[#231F20] block mb-1">Contact Email</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-[#231F20] block mb-1">RFQ Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg font-bold text-[#231F20] bg-white"
                >
                  <option value="PUBLISHED">PUBLISHED (Open for Quotations)</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-4 border-t border-[#A7A9AC]/30 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/ce/dashboard')}
              className="px-5 py-2.5 border border-[#A7A9AC]/50 text-[#231F20] font-bold rounded-xl hover:bg-[#FAF8F5] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#7A1315] hover:bg-[#A31E22] text-white font-bold rounded-xl shadow-md transition flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving Updates...' : 'Save RFQ Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
