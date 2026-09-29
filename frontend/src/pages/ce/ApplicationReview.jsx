import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { 
  Building2, Layers, IndianRupee, Calendar, User, FileText, Download, 
  ArrowLeft, CheckCircle2, AlertCircle, Shield, Briefcase, Clock, Archive, ExternalLink, ShieldAlert, ShieldCheck 
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
        setAuthError(err.response?.data?.detail || 'Access Restricted: Only the Officer who created this RFQ has authority to view and evaluate this quotation, or quotation is currently sealed.');
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
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#7A1315] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-[#58595B] text-xs font-medium">Loading vendor quotation dossier...</p>
      </div>
    );
  }

  if (authError || (appData && appData.is_sealed)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <Link to="/ce/dashboard" className="inline-flex items-center text-xs font-bold text-[#7A1315] hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Officer Dashboard
        </Link>
        <div className="bg-white rounded-2xl p-8 border border-amber-300 shadow-md text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#231F20]">
            {appData?.is_sealed ? '🔒 Quotation Sealed Bid Protection' : 'Officer Authorization Restriction'}
          </h2>
          <p className="text-sm text-[#414042] max-w-lg mx-auto">
            {appData?.is_sealed
              ? `This vendor quotation is strictly sealed and encrypted until the official Quotation Revealing Date: ${appData?.revealing_date ? new Date(appData.revealing_date).toLocaleString() : 'scheduled date'}.`
              : authError}
          </p>
          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#A7A9AC]/30 text-xs text-[#58595B] max-w-md mx-auto">
            <strong>Security Rule:</strong> Officer cannot inspect rates or award bids prior to the official opening timestamp.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      <Link to={`/ce/tenders/${appData.tender_id}/submissions`} className="inline-flex items-center text-xs font-bold text-[#7A1315] hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Quotation Submissions Matrix
      </Link>

      {/* Header Dossier */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#A7A9AC]/30 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-[#7A1315] bg-[#FDE6D3] px-2.5 py-0.5 rounded border border-[#FBB97D]/50">
              {appData.application_no}
            </span>
            <h1 className="text-2xl font-bold text-[#231F20] mt-1">{appData.firm_name}</h1>
            <p className="text-xs text-[#58595B] font-medium">RFQ: <strong>{appData.tender_title}</strong> ({appData.tender_ref_no})</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <StatusBadge status={appData.status} />
            <div className="text-right mt-1">
              <span className="text-[10px] uppercase font-bold text-[#58595B] block">Submitted Quoted Amount</span>
              <span className="text-2xl font-black text-[#7A1315] flex items-center justify-end font-mono">
                <IndianRupee className="w-6 h-6 mr-0.5 text-[#CB902E]" />
                ₹{appData.quoted_amount ? appData.quoted_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Firm Profile Summary including Category, Validity, & Minimum Supply Time */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#FAF8F5] rounded-xl border border-[#A7A9AC]/30 text-xs">
          <div>
            <span className="text-[#58595B] block text-[10px] uppercase font-bold">Vendor Category</span>
            <span className="font-bold text-[#0E2C49]">{appData.vendor_type || appData.registration_type || 'Contractor'}</span>
          </div>
          <div>
            <span className="text-[#58595B] block text-[10px] uppercase font-bold">Quotation Valid Upto</span>
            <span className="font-bold text-[#7A1315]">{appData.valid_upto ? new Date(appData.valid_upto).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div>
            <span className="text-[#58595B] block text-[10px] uppercase font-bold">Min Time to Supply</span>
            <span className="font-bold text-[#231F20]">{appData.min_supply_time || '30 Days'}</span>
          </div>
          <div>
            <span className="text-[#58595B] block text-[10px] uppercase font-bold">Annual Turnover</span>
            <span className="font-bold text-emerald-800">{appData.turnover || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[#58595B] block text-[10px] uppercase font-bold">GSTIN / PAN</span>
            <span className="font-mono font-bold text-[#231F20]">{appData.gstin || 'N/A'} / {appData.pan_no || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[#58595B] block text-[10px] uppercase font-bold">Submission Timestamp</span>
            <span className="font-semibold text-[#231F20]">{new Date(appData.submitted_at).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[#58595B] block text-[10px] uppercase font-bold">Authorized Signatory</span>
            <span className="font-bold text-[#231F20]">{appData.signatory_name} ({appData.signatory_designation || 'Signatory'})</span>
          </div>
          <div>
            <span className="text-[#58595B] block text-[10px] uppercase font-bold">Contact Mobile / Email</span>
            <span className="font-semibold text-[#231F20]">+91 {appData.mobile_no} • {appData.email}</span>
          </div>
        </div>
      </div>

      {/* Uploaded Documents & 1-Click ZIP Download Section */}
      <div className="bg-white rounded-xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#231F20] uppercase tracking-wider flex items-center">
              <FileText className="w-4 h-4 mr-2 text-[#7A1315]" />
              Uploaded Vendor Documents & Dossier Attachments ({appData.documents?.length || 0})
            </h3>
            <p className="text-[11px] text-[#58595B]">Download and review technical, commercial, and statutory documents submitted by the vendor.</p>
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
              <div key={idx} className="p-3 bg-[#FAF8F5] rounded-lg border border-[#A7A9AC]/30 flex justify-between items-center hover:bg-slate-100 transition">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-[#7A1315] shrink-0" />
                  <div className="truncate">
                    <strong className="block text-[#231F20] truncate">{doc.file_name}</strong>
                    <span className="text-[10px] text-[#58595B] uppercase font-semibold">
                      Type: {doc.document_type} • {doc.file_size_kb || 0} KB
                    </span>
                  </div>
                </div>
                <a
                  href={`http://127.0.0.1:8000${doc.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white border border-[#A7A9AC]/50 hover:border-[#7A1315] text-[#7A1315] rounded text-xs font-bold shrink-0 flex items-center ml-2 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-[#FAF8F5] rounded-lg text-xs text-[#58595B] italic text-center">
            No external document files attached with this quotation.
          </div>
        )}
      </div>

      {/* Officer Evaluation Decision Box */}
      <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#FBB97D] space-y-4">
        <h3 className="text-sm font-bold text-[#7A1315] uppercase tracking-wider flex items-center">
          <Shield className="w-4 h-4 mr-2 text-[#CB902E]" />
          Officer Evaluation & Approval Decision
        </h3>
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-[#231F20] block mb-1">Set Quotation Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg bg-white font-bold text-[#231F20]"
              >
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="ACCEPTED">ACCEPTED (Select / L1 Award)</option>
                <option value="REJECTED">REJECTED (Non-compliant)</option>
                <option value="WITHDRAWN">WITHDRAWN</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-[#231F20] block mb-1">Review Remarks / Selection Justification</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter technical audit remarks or award notes..."
                className="w-full px-3 py-2 border border-[#A7A9AC]/50 rounded-lg bg-white"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-[#7A1315] hover:bg-[#A31E22] text-white font-bold rounded-lg shadow text-xs transition"
          >
            {saving ? 'Updating Database...' : 'Save Evaluation Decision'}
          </button>
        </form>
      </div>

      {/* Selected RFQ Items & Vendor Quotations */}
      {appData.selected_jobs && appData.selected_jobs.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#231F20] uppercase tracking-wider flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-[#7A1315]" />
              Selected RFQ Items & Vendor Quotations ({appData.selected_jobs.length})
            </h3>
            <span className="text-[11px] text-[#58595B] font-medium">Vendor-selected scope</span>
          </div>
          <div className="border border-[#A7A9AC]/30 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#FAF8F5] border-b border-[#A7A9AC]/30 font-bold text-[#58595B]">
                <tr>
                  <th className="p-3">Item Code</th>
                  <th className="p-3">Item Name & Details</th>
                  <th className="p-3">Est. Qty</th>
                  <th className="p-3">Valid Upto</th>
                  <th className="p-3">Supply Time</th>
                  <th className="p-3 text-right">Vendor Submitted Quote</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appData.selected_jobs.map(sj => (
                  <tr key={sj.job_id}>
                    <td className="p-3 font-mono font-bold text-[#7A1315]">{sj.job_code || `Item #${sj.job_id}`}</td>
                    <td className="p-3">
                      <strong className="block text-[#231F20]">{sj.job_name}</strong>
                      {sj.remarks && (
                        <span className="text-[11px] text-[#58595B] block mt-0.5">
                          Remark: {sj.remarks}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[#231F20]">{sj.estimated_quantity ? `${sj.estimated_quantity} ${sj.unit || ''}` : '-'}</td>
                    <td className="p-3 text-[#7A1315] font-semibold">{sj.valid_upto ? new Date(sj.valid_upto).toLocaleDateString() : 'Standard'}</td>
                    <td className="p-3 text-[#231F20] font-semibold">{sj.min_supply_time || '30 Days'}</td>
                    <td className="p-3 text-right font-bold text-emerald-800 text-sm font-mono">
                      ₹{sj.quoted_amount ? sj.quoted_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Annexure III Line Items Breakdown */}
      {appData.proposal_items && appData.proposal_items.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-[#231F20] uppercase tracking-wider">
            Annexure III: Technical Proposal & Price Line Items
          </h3>
          <div className="border border-[#A7A9AC]/30 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#FAF8F5] border-b border-[#A7A9AC]/30 font-bold text-[#58595B]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Quoted Rate (₹)</th>
                  <th className="p-3">Supply Time</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appData.proposal_items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-bold text-[#58595B]">#{item.sl_no}</td>
                    <td className="p-3 font-semibold text-[#231F20]">{item.item_description}</td>
                    <td className="p-3">{item.unit}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3 font-mono font-bold text-[#7A1315]">₹{item.rate_per_unit ? item.rate_per_unit.toLocaleString('en-IN') : '-'}</td>
                    <td className="p-3 font-medium text-[#231F20]">{item.min_supply_time || '30 Days'}</td>
                    <td className="p-3 text-right font-bold font-mono text-emerald-800">
                      ₹{item.amount ? item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Annexure II Past Capabilities */}
      {appData.capabilities && appData.capabilities.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-[#231F20] uppercase tracking-wider">
            Annexure II: Past Technical & Financial Capabilities
          </h3>
          <div className="border border-[#A7A9AC]/30 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#FAF8F5] border-b border-[#A7A9AC]/30 font-bold text-[#58595B]">
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
                    <td className="p-3 font-semibold text-[#231F20]">{c.work_description}</td>
                    <td className="p-3 text-[#231F20]">{c.client_name}</td>
                    <td className="p-3 font-bold text-[#7A1315]">₹{c.cost_lakhs} L</td>
                    <td className="p-3 text-center">{c.financial_year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
