import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { 
  Building2, Layers, Calendar, FileText, ArrowLeft, ArrowRight, 
  Plus, Trash2, Briefcase, Clock, ShieldCheck, AlertCircle, Save, ShieldAlert 
} from 'lucide-react';

export default function EditTender() {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState('');

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
    completion_period: '12 Months',
    quotation_from_date: '',
    quotation_to_date: '',
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

  useEffect(() => {
    fetchTenderDetails();
  }, [tenderId]);

  const fetchTenderDetails = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const res = await api.get(`/tenders/${tenderId}`);
      const t = res.data;

      // Format ISO dates to datetime-local format (YYYY-MM-DDTHH:MM)
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
        completion_period: t.completion_period || '12 Months',
        quotation_from_date: formatDateForInput(t.quotation_from_date),
        quotation_to_date: formatDateForInput(t.quotation_to_date),
        opening_date: formatDateForInput(t.opening_date),
        quotation_valid_upto: formatDateForInput(t.quotation_valid_upto),
        validity_period: t.validity_period || '90 Days from Quotation Opening',
        contact_person: t.contact_person || '',
        contact_email: t.contact_email || '',
        contact_phone: t.contact_phone || '',
        office_address: t.office_address || '',
        status: t.status || 'PUBLISHED'
      });

      if (t.jobs && t.jobs.length > 0) {
        setJobs(t.jobs.map(j => ({
          job_id: j.job_id,
          job_code: j.job_code || `ITEM-${j.job_id}`,
          job_name: j.job_name || '',
          job_description: j.job_description || '',
          category: j.category || 'Supply Item',
          estimated_quantity: j.estimated_quantity || 100,
          unit: j.unit || 'MT',
          completion_period: j.completion_period || '6 Months',
          status: j.status || 'ACTIVE'
        })));
      } else {
        setJobs([
          {
            job_code: 'ITEM-01',
            job_name: 'Structural Work',
            job_description: '',
            category: 'Supply Item',
            estimated_quantity: 100,
            unit: 'MT',
            completion_period: '6 Months',
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
        category: 'Supply Item',
        estimated_quantity: 100,
        unit: 'MT',
        completion_period: '6 Months',
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
    setJobs(updated);
  };

  const handleSubmit = async (e) => {
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
        emd_amount: 0.0,
        completion_period: formData.completion_period,
        quotation_from_date: formData.quotation_from_date ? new Date(formData.quotation_from_date).toISOString() : null,
        quotation_to_date: formData.quotation_to_date ? new Date(formData.quotation_to_date).toISOString() : null,
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
          category: j.category || 'Supply Item',
          estimated_quantity: parseFloat(j.estimated_quantity) || null,
          unit: j.unit,
          completion_period: j.completion_period,
          status: j.status || 'ACTIVE'
        }))
      };

      const res = await api.put(`/tenders/${tenderId}`, payload);
      alert(`RFQ ${res.data.tender_ref_no} updated successfully with extended dates and modified details!`);
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
        <div className="animate-spin w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Loading RFQ for editing...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Officer Authorization Restriction</h2>
        <p className="text-sm text-slate-600">{authError}</p>
        <Link to="/ce/dashboard" className="inline-block px-5 py-2.5 bg-gov-600 text-white font-bold rounded-lg text-xs hover:bg-gov-700">
          Back to Officer Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Link to="/ce/dashboard" className="inline-flex items-center text-xs font-bold text-gov-700 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Officer Dashboard
      </Link>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-wrap justify-between items-start gap-4 border-b pb-4">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Officer RFQ Modification Panel</span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Edit RFQ & Extend Dates</h1>
            <p className="text-xs text-slate-500 font-mono">
              Reference: <strong className="text-gov-800">{formData.tender_ref_no}</strong>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Current Status:</span>
            <span className="px-2.5 py-1 bg-gov-50 text-gov-700 font-bold rounded text-xs border border-gov-200">
              {formData.status}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Section 1: Timelines & Date Extensions */}
          <div className="p-5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h3 className="font-bold text-amber-950 text-sm flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-amber-700" />
                1. Quotation Window & Date Extensions
              </h3>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Extend Cutoff & Validity Here
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Quotation Window START *</label>
                <input
                  type="datetime-local"
                  name="quotation_from_date"
                  value={formData.quotation_from_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="font-bold text-amber-950 block mb-1">Submission Deadline (Extend Date) *</label>
                <input
                  type="datetime-local"
                  name="quotation_to_date"
                  value={formData.quotation_to_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border-2 border-amber-400 rounded-lg bg-white font-bold text-gov-900 shadow-sm"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Quotation Opening Date</label>
                <input
                  type="datetime-local"
                  name="opening_date"
                  value={formData.opening_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="font-bold text-indigo-950 block mb-1">Quotation Valid Upto (Date) *</label>
                <input
                  type="datetime-local"
                  name="quotation_valid_upto"
                  value={formData.quotation_valid_upto}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg bg-white font-bold text-indigo-900 shadow-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Quotation Validity Period (Text) *</label>
                <input
                  type="text"
                  name="validity_period"
                  value={formData.validity_period}
                  onChange={handleChange}
                  placeholder="e.g. 90 Days from Quotation Opening"
                  required
                  className="w-full px-3 py-2 border rounded-lg font-semibold text-slate-800 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: RFQ Identification & Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 border-b pb-1 text-sm">2. RFQ Title & Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">RFQ Title / Work Description *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">RFQ Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg font-bold text-slate-800 bg-white"
                >
                  <option value="PUBLISHED">PUBLISHED (Open for Quotations)</option>
                  <option value="DRAFT">DRAFT (Saved as Draft)</option>
                  <option value="CLOSED">CLOSED (Submissions Ended)</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: RFQ Items Schedule */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center">
                  <Briefcase className="w-4 h-4 mr-1.5 text-gov-600" />
                  3. RFQ Items Schedule ({jobs.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Update itemized line items, category types, quantities, and specifications.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddJob}
                className="px-3 py-1.5 bg-gov-50 text-gov-700 hover:bg-gov-100 rounded-lg text-xs font-bold border border-gov-200 flex items-center transition"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add RFQ Item
              </button>
            </div>

            <div className="space-y-4">
              {jobs.map((job, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="font-bold text-gov-800 text-xs">RFQ Item #{idx + 1}</span>
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
                      <label className="font-semibold text-slate-600 block mb-1">Item Code *</label>
                      <input
                        type="text"
                        value={job.job_code}
                        onChange={(e) => handleJobChange(idx, 'job_code', e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 border rounded bg-white font-mono"
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="font-semibold text-slate-600 block mb-1">Item Description / Work Name *</label>
                      <input
                        type="text"
                        value={job.job_name}
                        onChange={(e) => handleJobChange(idx, 'job_name', e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 border rounded bg-white font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="font-semibold text-slate-600 block mb-1">Category Type *</label>
                      <select
                        value={job.category}
                        onChange={(e) => handleJobChange(idx, 'category', e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded bg-white font-semibold text-gov-800"
                      >
                        <option value="Supply Item">Supply Item</option>
                        <option value="Only Rate">Only Rate</option>
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="font-semibold text-slate-600 block mb-1">Estimated Quantity *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={job.estimated_quantity}
                        onChange={(e) => handleJobChange(idx, 'estimated_quantity', e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 border rounded bg-white font-mono font-bold"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="font-semibold text-slate-600 block mb-1">Unit of Measure *</label>
                      <select
                        value={job.unit}
                        onChange={(e) => handleJobChange(idx, 'unit', e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded bg-white text-center font-semibold"
                      >
                        <option value="MT">MT (Metric Ton)</option>
                        <option value="KG">KG (Kilogram)</option>
                        <option value="NOS">NOS (Numbers)</option>
                        <option value="PCS">PCS (Pieces)</option>
                        <option value="SET">SET (Sets)</option>
                        <option value="SQM">SQM (Square Meter)</option>
                        <option value="SQFT">SQFT (Square Feet)</option>
                        <option value="RMT">RMT (Running Meter)</option>
                        <option value="LOT">LOT (Lot)</option>
                        <option value="JOB">JOB (Lump Sum Job)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-4">
                      <label className="font-semibold text-slate-600 block mb-1">Completion Period</label>
                      <input
                        type="text"
                        value={job.completion_period}
                        onChange={(e) => handleJobChange(idx, 'completion_period', e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>

                    <div className="sm:col-span-12">
                      <label className="font-semibold text-slate-600 block mb-1">Item Deliverables & Specifications</label>
                      <textarea
                        rows={2}
                        value={job.job_description}
                        onChange={(e) => handleJobChange(idx, 'job_description', e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Scope & Background */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 border-b pb-1 text-sm">4. Scope of Work & Background</h3>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Overall Scope of Work *</label>
                <textarea
                  rows={3}
                  name="scope_of_work"
                  value={formData.scope_of_work}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Project Background</label>
                <input
                  type="text"
                  name="background"
                  value={formData.background}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Technical Specs & Weight Parameters */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 border-b pb-1 text-sm">5. Technical Specs & Weight Parameters</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Total Elements (pcs)</label>
                <input
                  type="number"
                  name="total_elements"
                  value={formData.total_elements}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Element Types</label>
                <input
                  type="number"
                  name="element_types"
                  value={formData.element_types}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Avg Weight (MT)</label>
                <input
                  type="number"
                  step="0.01"
                  name="avg_weight_mt"
                  value={formData.avg_weight_mt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Max Weight (MT)</label>
                <input
                  type="number"
                  step="0.01"
                  name="max_weight_mt"
                  value={formData.max_weight_mt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Contact Officer Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 border-b pb-1 text-sm">6. Authority Contact & Office Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Officer Name</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Email</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="font-bold text-slate-700 block mb-1">Office Address</label>
                <input
                  type="text"
                  name="office_address"
                  value={formData.office_address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/ce/dashboard')}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-gov-950 font-black rounded-xl shadow transition flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving Changes...' : 'Save & Update RFQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
