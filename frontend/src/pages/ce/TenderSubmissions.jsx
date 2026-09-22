import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { 
  Building2, Layers, IndianRupee, Calendar, User, Eye, ArrowLeft, Download, Award, Briefcase, Filter, FileText, Archive, ShieldAlert, ShieldCheck, Clock
} from 'lucide-react';

export default function TenderSubmissions() {
  const { tenderId } = useParams();
  const [tender, setTender] = useState(null);
  const [apps, setApps] = useState([]);
  const [selectedJobFilter, setSelectedJobFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [tenderId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const [tRes, aRes] = await Promise.all([
        api.get(`/tenders/${tenderId}`),
        api.get(`/applications/tender/${tenderId}`)
      ]);
      setTender(tRes.data);
      // Sort by quoted_amount ascending (L1 comparison)
      const sorted = [...aRes.data].sort((a, b) => (a.quoted_amount || 0) - (b.quoted_amount || 0));
      setApps(sorted);
    } catch (err) {
      console.error('Failed to load RFQ submissions', err);
      if (err.response?.status === 403) {
        setAuthError(err.response?.data?.detail || 'Access Restricted: Only the Officer who raised this RFQ has authority to view and approve quotations.');
      } else {
        setAuthError('Failed to load quotation submissions. Please verify access.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAllZip = (applicationId) => {
    const token = localStorage.getItem('rfq_token');
    window.open(`http://127.0.0.1:8000/api/applications/${applicationId}/download-all?token=${token}`, '_blank');
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading vendor quotation submissions...</div>;
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
          <div className="p-4 bg-slate-50 rounded-xl border text-xs text-slate-500 max-w-md mx-auto">
            <strong>Security Policy:</strong> Each RFQ is strictly managed by its originating Officer. Only the Officer who created the RFQ has authority to view vendor bids and make acceptance decisions.
          </div>
        </div>
      </div>
    );
  }

  const filteredApps = selectedJobFilter === 'ALL'
    ? apps
    : apps.filter(app => (app.selected_jobs || []).some(j => j.job_id === parseInt(selectedJobFilter)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      <Link to="/ce/dashboard" className="inline-flex items-center text-xs font-bold text-gov-700 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Officer Dashboard
      </Link>

      {/* RFQ Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div>
            <span className="text-xs font-mono font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded">
              {tender.tender_ref_no}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{tender.title}</h1>
            {tender.validity_period && (
              <div className="flex items-center text-xs text-indigo-700 font-semibold mt-1">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Quotation Validity: {tender.validity_period}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <span>Total Quotations Received: <strong className="text-slate-800 text-sm font-bold">{apps.length}</strong></span>
          </div>
        </div>

        {/* RFQ Items in header */}
        {tender.jobs && tender.jobs.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center text-xs">
            <span className="font-bold text-slate-700 flex items-center">
              <Briefcase className="w-3.5 h-3.5 mr-1 text-gov-600" />
              RFQ Items:
            </span>
            {tender.jobs.map(j => (
              <span key={j.job_id} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 text-[11px]">
                <strong>{j.job_code}</strong> ({j.category || 'Supply'}): {j.job_name.slice(0, 30)}...
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submissions Table with L1 Ranking & Item Filter */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <Award className="w-5 h-5 mr-2 text-amber-500" />
            Comparative Evaluation Matrix (Ranked by Submitted Quoted Price)
          </h2>

          {tender.jobs && tender.jobs.length > 0 && (
            <div className="flex items-center space-x-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-600">Filter by Item:</span>
              <select
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                className="px-2.5 py-1 border rounded-lg text-xs bg-white font-medium focus:ring-2 focus:ring-gov-500"
              >
                <option value="ALL">All Items ({apps.length} bids)</option>
                {tender.jobs.map(j => (
                  <option key={j.job_id} value={j.job_id}>
                    {j.job_code} - {j.job_name.slice(0, 25)}...
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {filteredApps.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs italic">
            No vendors have submitted quotations matching this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">App Ref No</th>
                  <th className="py-3 px-3">Vendor Details & Category</th>
                  <th className="py-3 px-3">Selected RFQ Items</th>
                  <th className="py-3 px-3">Submitted Quoted Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Docs</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app, idx) => (
                  <tr key={app.application_id} className={`hover:bg-slate-50/80 transition ${idx === 0 ? 'bg-amber-50/30' : ''}`}>
                    <td className="py-3 px-3">
                      {idx === 0 ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300 whitespace-nowrap">
                          👑 L1 (Lowest)
                        </span>
                      ) : (
                        <span className="font-bold text-slate-500">L{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-gov-700">{app.application_no}</td>
                    <td className="py-3 px-3">
                      <strong className="block text-slate-900">{app.firm_name}</strong>
                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mt-0.5">
                        {app.turnover && <span><strong>Turnover:</strong> {app.turnover}</span>}
                        {app.work_experience && <span><strong>Exp:</strong> {app.work_experience}</span>}
                        <span><strong>Signatory:</strong> {app.signatory_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      {app.selected_jobs && app.selected_jobs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {app.selected_jobs.map(sj => (
                            <span key={sj.job_id} className="px-1.5 py-0.5 bg-gov-50 text-gov-800 font-mono font-semibold rounded text-[10px] border border-gov-200">
                              {sj.job_code || `Item #${sj.job_id}`}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">All Scope</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 text-sm">
                      <span className="flex items-center text-emerald-800 font-mono font-black">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-amber-600" />
                        ₹{app.quoted_amount ? app.quoted_amount.toLocaleString('en-IN') : '0.00'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDownloadAllZip(app.application_id)}
                        className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded border text-[11px] font-bold inline-flex items-center"
                        title="Download all submitted vendor documents (ZIP)"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        ZIP
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Link
                        to={`/ce/applications/${app.application_id}/review`}
                        className="px-3 py-1.5 bg-gov-800 hover:bg-gov-900 text-white rounded font-bold text-xs inline-flex items-center shadow-sm whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Evaluate Dossier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
