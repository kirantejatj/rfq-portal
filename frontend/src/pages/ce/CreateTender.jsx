import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Building2, Layers, Calendar, IndianRupee, FileText, Upload, ArrowRight, Plus, Trash2, Briefcase } from 'lucide-react';

export default function CreateTender() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(now.getDate() + 30);

  const [formData, setFormData] = useState({
    tender_ref_no: `RFQ/AGIC/2026/PROJ-${Math.floor(10 + Math.random() * 90)}`,
    title: '',
    authority_name: 'Amaravati Growth and Infrastructure Corporation Limited',
    background: '',
    scope_of_work: '',
    total_elements: 500,
    element_types: 10,
    max_weight_mt: 10.0,
    min_weight_mt: 1.0,
    avg_weight_mt: 4.5,
    emd_amount: 300000,
    completion_period: '12 Months',
    quotation_from_date: now.toISOString().slice(0, 16),
    quotation_to_date: nextMonth.toISOString().slice(0, 16),
    opening_date: nextMonth.toISOString().slice(0, 16),
    contact_person: 'Chief Engineer (Procurement)',
    contact_email: 'tenders.infra@agic.gov.in',
    contact_phone: '+91 866 2459800',
    office_address: 'AGIC Bhavan, Sector 4, Capital Complex, Amaravati - 522503',
    status: 'PUBLISHED'
  });

  const [jobs, setJobs] = useState([
    {
      job_code: 'JOB-01',
      job_name: 'Structural Steel Fabrication & Surface Preparation',
      job_description: 'Precision fabrication of heavy steel columns, beams and trusses with zinc-rich epoxy primer coating.',
      category: 'Steel Fabrication',
      estimated_quantity: 250,
      unit: 'MT',
      estimated_cost: 21500000,
      completion_period: '6 Months',
      status: 'ACTIVE'
    },
    {
      job_code: 'JOB-02',
      job_name: 'Crane Erection, Torque Bolting & Structural Alignment',
      job_description: 'On-site mobile crane positioning, alignment, torque tension bolting, and temporary bracing.',
      category: 'Site Erection',
      estimated_quantity: 250,
      unit: 'MT',
      estimated_cost: 8500000,
      completion_period: '6 Months',
      status: 'ACTIVE'
    }
  ]);

  const [tenderFile, setTenderFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddJob = () => {
    const jobNum = jobs.length + 1;
    setJobs([
      ...jobs,
      {
        job_code: `JOB-${jobNum < 10 ? '0' + jobNum : jobNum}`,
        job_name: '',
        job_description: '',
        category: 'General Works',
        estimated_quantity: 100,
        unit: 'MT',
        estimated_cost: 1000000,
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

  const totalEstimatedCost = jobs.reduce((sum, j) => sum + (parseFloat(j.estimated_cost) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...formData,
        total_elements: parseInt(formData.total_elements) || null,
        element_types: parseInt(formData.element_types) || null,
        max_weight_mt: parseFloat(formData.max_weight_mt) || null,
        min_weight_mt: parseFloat(formData.min_weight_mt) || null,
        avg_weight_mt: parseFloat(formData.avg_weight_mt) || null,
        emd_amount: parseFloat(formData.emd_amount) || 0,
        quotation_from_date: new Date(formData.quotation_from_date).toISOString(),
        quotation_to_date: new Date(formData.quotation_to_date).toISOString(),
        opening_date: formData.opening_date ? new Date(formData.opening_date).toISOString() : null,
        jobs: jobs.map((j, idx) => ({
          job_code: j.job_code || `JOB-${idx + 1}`,
          job_name: j.job_name,
          job_description: j.job_description,
          category: j.category,
          estimated_quantity: parseFloat(j.estimated_quantity) || null,
          unit: j.unit,
          estimated_cost: parseFloat(j.estimated_cost) || null,
          completion_period: j.completion_period,
          status: j.status || 'ACTIVE'
        }))
      };

      const res = await api.post('/tenders', payload);
      const newTenderId = res.data.tender_id;

      // Upload file attachment if provided
      if (tenderFile) {
        const fData = new FormData();
        fData.append('document_type', 'RFQ_DOCUMENT');
        fData.append('file', tenderFile);
        try {
          await api.post(`/tenders/${newTenderId}/documents`, fData);
        } catch (fErr) {
          console.error('File upload failed', fErr);
        }
      }

      alert(`Tender ${res.data.tender_ref_no} raised with ${jobs.length} jobs and published successfully!`);
      navigate('/ce/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create tender');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold text-gov-600 uppercase tracking-wider">CE Tender Creation Module</span>
          <h1 className="text-2xl font-bold text-slate-900">Raise New RFQ Tender & Jobs</h1>
          <p className="text-xs text-slate-500">Configure technical specifications, work packages/jobs, quotation window & EMD</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Section 1 */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 border-b pb-1 text-sm">1. Tender Identification & Title</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tender Ref No *</label>
                <input
                  type="text"
                  name="tender_ref_no"
                  value={formData.tender_ref_no}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Tender Title / Work Name *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Design, Fabrication, and Erection of Pre-Engineered Steel Structures..."
                  required
                  className="w-full px-3 py-2 border rounded-lg font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Multiple RFQ Jobs / Work Packages */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center">
                  <Briefcase className="w-4 h-4 mr-1.5 text-gov-600" />
                  2. RFQ Jobs / Work Packages ({jobs.length})
                </h3>
                <p className="text-[11px] text-slate-500">Define separate jobs under this tender. Applicants can select a subset or all jobs to quote.</p>
              </div>
              <button
                type="button"
                onClick={handleAddJob}
                className="px-3 py-1.5 bg-gov-50 text-gov-700 hover:bg-gov-100 rounded-lg text-xs font-bold border border-gov-200 flex items-center transition"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Job Package
              </button>
            </div>

            <div className="space-y-4">
              {jobs.map((job, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="font-bold text-gov-800 text-xs">Job Package #{idx + 1}</span>
                    {jobs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveJob(idx)}
                        className="text-rose-500 hover:text-rose-700 font-semibold text-xs flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Remove Job
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-3">
                      <label className="font-semibold text-slate-600 block mb-1">Job Code *</label>
                      <input
                        type="text"
                        value={job.job_code}
                        onChange={(e) => handleJobChange(idx, 'job_code', e.target.value)}
                        placeholder="e.g. JOB-01"
                        required
                        className="w-full px-2.5 py-1.5 border rounded bg-white font-mono"
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="font-semibold text-slate-600 block mb-1">Job Title / Work Name *</label>
                      <input
                        type="text"
                        value={job.job_name}
                        onChange={(e) => handleJobChange(idx, 'job_name', e.target.value)}
                        placeholder="e.g. Structural Steel Fabrication & Surface Preparation"
                        required
                        className="w-full px-2.5 py-1.5 border rounded bg-white font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="font-semibold text-slate-600 block mb-1">Category</label>
                      <input
                        type="text"
                        value={job.category}
                        onChange={(e) => handleJobChange(idx, 'category', e.target.value)}
                        placeholder="e.g. Steel / Civil / Electrical"
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="font-semibold text-slate-600 block mb-1">Est. Quantity</label>
                      <input
                        type="number"
                        step="0.01"
                        value={job.estimated_quantity}
                        onChange={(e) => handleJobChange(idx, 'estimated_quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded bg-white font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-slate-600 block mb-1">Unit</label>
                      <input
                        type="text"
                        value={job.unit}
                        onChange={(e) => handleJobChange(idx, 'unit', e.target.value)}
                        placeholder="MT / SQM / NOS"
                        className="w-full px-2.5 py-1.5 border rounded bg-white text-center"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="font-semibold text-slate-600 block mb-1">Est. Cost (₹ INR)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={job.estimated_cost}
                        onChange={(e) => handleJobChange(idx, 'estimated_cost', e.target.value)}
                        placeholder="e.g. 5000000"
                        className="w-full px-2.5 py-1.5 border rounded bg-white font-mono font-bold"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="font-semibold text-slate-600 block mb-1">Completion Period</label>
                      <input
                        type="text"
                        value={job.completion_period}
                        onChange={(e) => handleJobChange(idx, 'completion_period', e.target.value)}
                        placeholder="e.g. 6 Months"
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>

                    <div className="sm:col-span-12">
                      <label className="font-semibold text-slate-600 block mb-1">Job Deliverables / Description</label>
                      <textarea
                        rows={2}
                        value={job.job_description}
                        onChange={(e) => handleJobChange(idx, 'job_description', e.target.value)}
                        placeholder="Detailed technical specifications and deliverables for this job package..."
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalEstimatedCost > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex justify-between items-center text-xs">
                <span className="font-bold text-amber-900">Total Cumulative Estimated Cost Across {jobs.length} Jobs:</span>
                <span className="font-extrabold text-amber-900 text-sm flex items-center">
                  <IndianRupee className="w-4 h-4 mr-0.5" />
                  ₹{totalEstimatedCost.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 border-b pb-1 text-sm">3. Scope of Work & Background</h3>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Overall Scope of Work *</label>
                <textarea
                  rows={3}
                  name="scope_of_work"
                  value={formData.scope_of_work}
                  onChange={handleChange}
                  required
                  placeholder="Detailed deliverables, standards (IS codes), painting, quality specs..."
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
                  placeholder="Infrastructure area / sector context..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 border-b pb-1 text-sm">4. Technical Specs & Weight Parameters</h3>
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

          {/* Section 5 */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 border-b pb-1 text-sm">5. Quotation Window & EMD Commercials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Quotation Window START *</label>
                <input
                  type="datetime-local"
                  name="quotation_from_date"
                  value={formData.quotation_from_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Quotation Window END (Hard Cutoff) *</label>
                <input
                  type="datetime-local"
                  name="quotation_to_date"
                  value={formData.quotation_to_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg font-bold text-gov-700"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">EMD Amount (INR) *</label>
                <input
                  type="number"
                  name="emd_amount"
                  value={formData.emd_amount}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Document Upload */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 border-b pb-1 text-sm">6. Attach RFQ Document (PDF)</h3>
            <input
              type="file"
              onChange={(e) => setTenderFile(e.target.files[0])}
              className="text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gov-800 hover:bg-gov-900 text-white font-bold rounded-lg shadow-md text-sm transition flex items-center justify-center"
          >
            {loading ? 'Creating & Publishing Tender...' : `Publish Tender with ${jobs.length} Job Packages`}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

