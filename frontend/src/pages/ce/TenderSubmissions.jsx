import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { 
  Building2, Layers, IndianRupee, Calendar, User, Eye, ArrowLeft, Download, 
  Award, Briefcase, Filter, FileText, Archive, ShieldAlert, ShieldCheck, Clock, AlertTriangle 
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
      // Sort by quoted_amount ascending (L1 comparison) if not sealed
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
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#7A1315] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-[#58595B] text-xs font-medium">Loading vendor quotation submissions...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <Link to="/ce/dashboard" className="inline-flex items-center text-xs font-bold text-[#7A1315] hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Officer Dashboard
        </Link>
        <div className="bg-white rounded-2xl p-8 border border-rose-200 shadow-md text-center space-y-4">
          <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#231F20]">Officer Authorization Restriction</h2>
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

  const isSealed = apps.some(a => a.is_sealed) || (tender?.revealing_date && new Date() < new Date(tender.revealing_date));

  const filteredApps = selectedJobFilter === 'ALL'
    ? apps
    : apps.filter(app => (app.selected_jobs || []).some(j => j.job_id === parseInt(selectedJobFilter)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      <Link to="/ce/dashboard" className="inline-flex items-center text-xs font-bold text-[#7A1315] hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Officer Dashboard
      </Link>

      {/* RFQ Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-3">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div>
            <span className="text-xs font-mono font-bold text-[#7A1315] bg-[#FDE6D3] px-2.5 py-0.5 rounded border border-[#FBB97D]/50">
              {tender.tender_ref_no}
            </span>
            <h1 className="text-2xl font-bold text-[#231F20] mt-1">{tender.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs mt-1.5">
              {tender.revealing_date && (
                <span className="flex items-center text-[#7A1315] bg-[#FDE6D3]/60 px-2.5 py-1 rounded font-bold border border-[#FBB97D]">
                  <Clock className="w-3.5 h-3.5 mr-1 text-[#CB902E]" />
                  Quotation Revealing Date: {new Date(tender.revealing_date).toLocaleString()}
                </span>
              )}
              {tender.validity_period && (
                <span className="flex items-center text-[#0E2C49] bg-[#E8EEF5] px-2.5 py-1 rounded font-semibold border border-[#0E2C49]/20">
                  Validity: {tender.validity_period}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs text-[#58595B]">
            <span>Total Quotations Received: <strong className="text-[#231F20] text-sm font-bold">{apps.length}</strong></span>
          </div>
        </div>

        {/* Sealed Bid Alert Banner */}
        {isSealed && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-300 text-amber-900 text-xs flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong>🔒 Strict Sealed Bid Protection Active:</strong>
              <p>
                Vendor quotation pricing and details are currently encrypted and sealed. They will be automatically revealed on <strong>{new Date(tender.revealing_date).toLocaleString()}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* RFQ Items in header */}
        {tender.jobs && tender.jobs.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center text-xs">
            <span className="font-bold text-[#231F20] flex items-center">
              <Briefcase className="w-3.5 h-3.5 mr-1 text-[#7A1315]" />
              RFQ Items ({tender.jobs.length}):
            </span>
            {tender.jobs.map(j => (
              <span key={j.job_id} className="px-2 py-0.5 bg-[#FAF8F5] text-[#231F20] rounded border border-[#A7A9AC]/30 text-[11px]">
                <strong>{j.job_code}</strong>: {j.job_name.slice(0, 30)}...
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submissions Table with L1 Ranking & Item Filter */}
      <div className="bg-white rounded-xl border border-[#A7A9AC]/30 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <h2 className="text-base font-bold text-[#231F20] flex items-center">
            <Award className="w-5 h-5 mr-2 text-[#CB902E]" />
            Comparative Evaluation Matrix ({isSealed ? 'Sealed Bids' : 'Ranked by Lowest Price L1'})
          </h2>

          {tender.jobs && tender.jobs.length > 0 && (
            <div className="flex items-center space-x-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#58595B]" />
              <span className="font-semibold text-[#58595B]">Filter by Item:</span>
              <select
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                className="px-2.5 py-1 border border-[#A7A9AC]/50 rounded-lg text-xs bg-white font-medium focus:ring-2 focus:ring-[#7A1315]"
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
          <div className="text-center py-12 text-[#58595B] text-xs italic">
            No vendors have submitted quotations matching this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] text-[#58595B] font-bold border-b border-[#A7A9AC]/30 uppercase tracking-wider">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Quotation Ref</th>
                  <th className="py-3 px-3">Vendor Firm</th>
                  <th className="py-3 px-3">Valid Upto</th>
                  <th className="py-3 px-3">Min Supply Time</th>
                  <th className="py-3 px-3">Submitted Quoted Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Docs</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app, idx) => {
                  const sealed = app.is_sealed || isSealed;
                  return (
                    <tr key={app.application_id} className={`hover:bg-slate-50/80 transition ${!sealed && idx === 0 ? 'bg-amber-50/30' : ''}`}>
                      <td className="py-3 px-3">
                        {sealed ? (
                          <span className="font-bold text-slate-400"># -</span>
                        ) : idx === 0 ? (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300 whitespace-nowrap">
                            👑 L1 (Lowest)
                          </span>
                        ) : (
                          <span className="font-bold text-slate-500">L{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#7A1315]">{app.application_no}</td>
                      <td className="py-3 px-3">
                        <strong className="block text-[#231F20]">{app.firm_name}</strong>
                        <span className="text-[10px] text-[#58595B]">Signatory: {app.signatory_name || 'Authorized'}</span>
                      </td>
                      <td className="py-3 px-3 text-[#231F20] font-medium">
                        {sealed ? '🔒 Sealed' : (app.valid_upto ? new Date(app.valid_upto).toLocaleDateString() : 'Standard')}
                      </td>
                      <td className="py-3 px-3 text-[#231F20] font-medium">
                        {sealed ? '🔒 Sealed' : (app.min_supply_time || '30 Days')}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#231F20] text-sm">
                        {sealed ? (
                          <span className="text-amber-800 font-semibold text-xs flex items-center">
                            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-600" />
                            Sealed until Revealing
                          </span>
                        ) : (
                          <span className="flex items-center text-emerald-800 font-mono font-black">
                            <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-[#CB902E]" />
                            ₹{app.quoted_amount ? app.quoted_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={app.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-center">
                        {sealed ? (
                          <span className="text-[10px] text-slate-400 italic">Locked</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDownloadAllZip(app.application_id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded border text-[11px] font-bold inline-flex items-center"
                            title="Download all submitted vendor documents (ZIP)"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            ZIP
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {sealed ? (
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded text-xs font-bold inline-flex items-center cursor-not-allowed">
                            🔒 Locked
                          </span>
                        ) : (
                          <Link
                            to={`/ce/applications/${app.application_id}/review`}
                            className="px-3 py-1.5 bg-[#7A1315] hover:bg-[#A31E22] text-white rounded font-bold text-xs inline-flex items-center shadow-sm whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Evaluate Dossier
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
