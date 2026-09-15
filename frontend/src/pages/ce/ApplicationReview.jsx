import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { 
  Building2, Layers, IndianRupee, Calendar, User, FileText, Download, 
  ArrowLeft, CheckCircle2, AlertCircle, Shield, Briefcase, DollarSign, Archive, ExternalLink, ShieldAlert, ShieldCheck
} from 'lucide-react';

export default function ApplicationReview() {
  const { applicationId } = useParams();
  const [appData, setAppData] = useState(null);
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const res = await api.get(`/applications/${applicationId}`);
      setAppData(res.data);
      setStatus(res.data.status);
      setRemarks(res.data.remarks || '');
    } catch (err) {
      console.error('Failed to load application', err);
      if (err.response?.status === 403) {
        setAuthError(err.response?.data?.detail || 'Access Restricted: Only the Officer who created this RFQ has authority to view and evaluate this quotation.');
      } else {
        setAuthError('Failed to load quotation dossier.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/applications/${applicationId}/status`, {
        status: status,
        remarks: remarks
      });
      alert('Quotation evaluation status updated in RFQ_DB!');
      fetchApplication();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadAllZip = () => {
    const token = localStorage.getItem('rfq_token');
    window.open(`http://127.0.0.1:8000/api/applications/${applicationId}/download-all?token=${token}`, '_blank');
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading vendor quotation dossier...</div>;
  }

  if (authError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <Link to="/ce/dashboard" className="inline-flex items-center text-xs font-bold text-gov-700 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Officer Dashboard
        </Link>
        <div className="bg-white rounded-2xl p-8 border border-rose-200 shadow-md text-center space-y-4">
          <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Officer Authorization Restriction</h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            {authError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      <Link to={`/ce/tenders/${appData.tender_id}/submissions`} className="inline-flex items-center text-xs font-bold text-gov-700 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Quotation Submissions Matrix
      </Link>

      {/* Header Dossier */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded">
              {appData.application_no}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{appData.firm_name}</h1>
            <p className="text-xs text-slate-500 font-medium">RFQ: <strong>{appData.tender_title}</strong> ({appData.tender_ref_no})</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <StatusBadge status={appData.status} />
            <div className="text-right mt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Submitted Quoted Amount</span>
              <span className="text-2xl font-black text-slate-900 flex items-center justify-end font-mono">
                <IndianRupee className="w-6 h-6 mr-0.5 text-amber-600" />
                ₹{appData.quoted_amount ? appData.quoted_amount.toLocaleString('en-IN') : '0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Firm Profile Summary including Category, Turnover & Experience */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Vendor Category</span>
            <span className="font-bold text-indigo-800">{appData.vendor_type || appData.registration_type || 'Contractor'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Annual Turnover</span>
            <span className="font-bold text-emerald-800">{appData.turnover || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Work Experience</span>
            <span className="font-bold text-slate-800">{appData.work_experience || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">GSTIN / PAN</span>
            <span className="font-mono font-bold text-slate-800">{appData.gstin || 'N/A'} / {appData.pan_no || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Submission Date/Time</span>
            <span className="font-semibold text-slate-700">{new Date(appData.submitted_at).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Authorized Signatory</span>
            <span className="font-bold text-slate-800">{appData.signatory_name} ({appData.signatory_designation || 'Signatory'})</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact Mobile</span>
            <span className="font-mono font-bold text-slate-800">+91 {appData.mobile_no}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact Email</span>
            <span className="font-semibold text-slate-700">{appData.email || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Uploaded Documents & 1-Click ZIP Download Section */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <FileText className="w-4 h-4 mr-2 text-gov-600" />
              Uploaded Vendor Documents & Dossier Attachments ({appData.documents?.length || 0})
            </h3>
            <p className="text-[11px] text-slate-500">Download and review technical, commercial, and statutory documents submitted by the vendor.</p>
          </div>
          <button
            type="button"
            onClick={handleDownloadAllZip}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow flex items-center transition"
          >
            <Archive className="w-4 h-4 mr-1.5" />
            Download All Documents (ZIP)
          </button>
        </div>

        {appData.documents && appData.documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {appData.documents.map((doc, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center hover:bg-slate-100 transition">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-gov-600 shrink-0" />
                  <div className="truncate">
                    <strong className="block text-slate-900 truncate">{doc.file_name}</strong>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      Type: {doc.document_type} • {doc.file_size_kb || 0} KB
                    </span>
                  </div>
                </div>
                <a
                  href={`http://127.0.0.1:8000${doc.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:border-gov-500 text-gov-700 rounded text-xs font-bold shrink-0 flex items-center ml-2"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-500 italic text-center">
            No external document files attached with this quotation.
          </div>
        )}
      </div>

      {/* Officer Evaluation Decision Box */}
      <div className="bg-gov-50 rounded-2xl p-6 border border-gov-200 space-y-4">
        <h3 className="text-sm font-bold text-gov-900 uppercase tracking-wider flex items-center">
          <Shield className="w-4 h-4 mr-2 text-gov-700" />
          Officer Evaluation & Approval Decision
        </h3>
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-gov-900 block mb-1">Set Quotation Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-800"
              >
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="ACCEPTED">ACCEPTED (Select / L1 Award)</option>
                <option value="REJECTED">REJECTED (Non-compliant)</option>
                <option value="WITHDRAWN">WITHDRAWN</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-gov-900 block mb-1">Review Remarks / Selection Justification</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter technical audit remarks or award notes..."
                className="w-full px-3 py-2 border rounded-lg bg-white"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-gov-800 hover:bg-gov-900 text-white font-bold rounded-lg shadow text-xs transition"
          >
            {saving ? 'Updating Database...' : 'Save Evaluation Decision'}
          </button>
        </form>
      </div>

      {/* Selected RFQ Items & Vendor Quotations */}
      {appData.selected_jobs && appData.selected_jobs.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-gov-600" />
              Selected RFQ Items & Vendor Quotations ({appData.selected_jobs.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Vendor-selected scope</span>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                <tr>
                  <th className="p-3">Item Code</th>
                  <th className="p-3">Item Name & Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Est. Qty / Scope</th>
                  <th className="p-3">Est. Indicative Budget</th>
                  <th className="p-3 text-right">Vendor Submitted Quote</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appData.selected_jobs.map(sj => (
                  <tr key={sj.job_id}>
                    <td className="p-3 font-mono font-bold text-gov-700">{sj.job_code || `Item #${sj.job_id}`}</td>
                    <td className="p-3">
                      <strong className="block text-slate-900">{sj.job_name}</strong>
                      {sj.remarks && (
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Vendor Remark: {sj.remarks}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">{sj.category || '-'}</td>
                    <td className="p-3 text-slate-600">{sj.estimated_quantity ? `${sj.estimated_quantity} ${sj.unit || ''}` : '-'}</td>
                    <td className="p-3 text-slate-600">₹{sj.estimated_cost ? sj.estimated_cost.toLocaleString('en-IN') : '-'}</td>
                    <td className="p-3 text-right font-bold text-emerald-800 text-sm font-mono">
                      ₹{sj.quoted_amount ? sj.quoted_amount.toLocaleString('en-IN') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Annexure III Line Items */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Annexure III: Technical Proposal & Price Line Items
        </h3>
        <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">RFQ Item</th>
                <th className="p-3">Item Description</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Rate (₹)</th>
                <th className="p-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appData.proposal_items.map((item, idx) => {
                const matchedJob = appData.selected_jobs?.find(j => j.job_id === item.job_id);
                return (
                  <tr key={idx}>
                    <td className="p-3">{item.sl_no}</td>
                    <td className="p-3 font-mono text-gov-700 font-bold text-[11px]">
                      {matchedJob ? (matchedJob.job_code || `Item #${matchedJob.job_id}`) : (item.job_id ? `Item #${item.job_id}` : 'General')}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">{item.item_description}</td>
                    <td className="p-3">{item.unit}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3">₹{item.rate_per_unit ? item.rate_per_unit.toLocaleString('en-IN') : '-'}</td>
                    <td className="p-3 text-right font-bold font-mono">₹{item.amount ? item.amount.toLocaleString('en-IN') : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Annexure II Past Capabilities */}
      {appData.capabilities && appData.capabilities.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Annexure II: Past Technical & Financial Capabilities
          </h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Work Description</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Cost (₹ Lakhs)</th>
                  <th className="p-3">FY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appData.capabilities.map((c, idx) => (
                  <tr key={idx}>
                    <td className="p-3">{c.sl_no}</td>
                    <td className="p-3 font-semibold">{c.work_description}</td>
                    <td className="p-3">{c.client_name}</td>
                    <td className="p-3 font-bold">₹{c.cost_lakhs} L</td>
                    <td className="p-3">{c.financial_year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit History Log */}
      {appData.history && appData.history.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Audit Trail & History Log (PostgreSQL application_status_history)
          </h3>
          <div className="space-y-2 text-xs">
            {appData.history.map(h => (
              <div key={h.history_id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  Status set to <strong className="text-slate-900">{h.new_status}</strong>
                  {h.remarks && <span className="text-slate-600"> — {h.remarks}</span>}
                </div>
                <span className="text-[11px] text-slate-400">{new Date(h.changed_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
