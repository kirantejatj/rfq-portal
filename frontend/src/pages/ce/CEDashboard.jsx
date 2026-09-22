import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { 
  Building2, PlusCircle, Layers, FileCheck, IndianRupee, Users, 
  Clock, Eye, ArrowRight, ShieldCheck, Edit3, Calendar, Search, 
  Filter, CheckCircle2, AlertCircle, Award, FileText, Download, ShieldAlert, Sparkles
} from 'lucide-react';

export default function CEDashboard() {
  const { user } = useAuth();
  const currentUserId = user?.id || user?.userId;

  const [stats, setStats] = useState(null);
  const [tenders, setTenders] = useState([]);
  const [allQuotes, setAllQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rfqs'); // 'rfqs' | 'quotes'

  // Filters for RFQs tab
  const [rfqScope, setRfqScope] = useState('ALL'); // 'ALL' | 'MY'
  const [rfqFilter, setRfqFilter] = useState('ALL');
  const [rfqSearch, setRfqSearch] = useState('');

  // Filters for Quotations tab
  const [quoteFilter, setQuoteFilter] = useState('ALL');
  const [quoteSearch, setQuoteSearch] = useState('');

  useEffect(() => {
    fetchCEDashboard();
  }, []);

  const fetchCEDashboard = async () => {
    setLoading(true);
    try {
      const [sRes, tRes, qRes] = await Promise.all([
        api.get('/stats/ce'),
        api.get('/tenders?status_filter=ALL'),
        api.get('/applications/officer/all')
      ]);
      setStats(sRes.data);
      setTenders(tRes.data);
      setAllQuotes(qRes.data || []);
    } catch (err) {
      console.error('Failed to load CE dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (tenderId, newStatus) => {
    try {
      await api.patch(`/tenders/${tenderId}/status?new_status=${newStatus}`);
      fetchCEDashboard();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleDownloadAllZip = (applicationId) => {
    const token = localStorage.getItem('rfq_token');
    window.open(`http://127.0.0.1:8000/api/applications/${applicationId}/download-all?token=${token}`, '_blank');
  };

  // Count my tenders
  const myTendersCount = tenders.filter(t => t.created_by === currentUserId).length;

  // Filtered RFQs
  const filteredTenders = tenders.filter(t => {
    const matchScope = rfqScope === 'ALL' || (rfqScope === 'MY' && t.created_by === currentUserId);
    const matchStatus = rfqFilter === 'ALL' || t.status === rfqFilter;
    const matchSearch = !rfqSearch || 
      t.title?.toLowerCase().includes(rfqSearch.toLowerCase()) ||
      t.tender_ref_no?.toLowerCase().includes(rfqSearch.toLowerCase()) ||
      t.contact_person?.toLowerCase().includes(rfqSearch.toLowerCase());
    return matchScope && matchStatus && matchSearch;
  });

  // Filtered Quotations (already strictly isolated by backend to this officer's RFQs)
  const filteredQuotes = allQuotes.filter(q => {
    const matchStatus = quoteFilter === 'ALL' || q.status === quoteFilter;
    const matchSearch = !quoteSearch || 
      q.firm_name?.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      q.tender_ref_no?.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      q.tender_title?.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      q.application_no?.toLowerCase().includes(quoteSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Loading Officer Executive Dashboard & Quotations Center...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gov-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Officer Executive Control Panel</span>
          </div>
          <h1 className="text-2xl font-bold">RFQ Management & Quotations Evaluation Center</h1>
          <p className="text-xs text-slate-400">
            Government of Andhra Pradesh • Total RFQs Raised: <strong>{tenders.length}</strong> | Total Quotations Received: <strong>{allQuotes.length}</strong>
          </p>
        </div>
        <Link
          to="/ce/tenders/create"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-gov-900 font-bold rounded-lg shadow text-xs transition flex items-center shrink-0"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Raise New RFQ
        </Link>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block font-semibold">Total RFQs Raised</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats?.total_tenders || tenders.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-emerald-600 block font-semibold">Active Windows</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{stats?.active_tenders || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-blue-600 block font-semibold">Total Quotes Received</span>
          <span className="text-2xl font-extrabold text-blue-700 mt-1 block">{allQuotes.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-amber-600 block font-semibold">Under Review</span>
          <span className="text-2xl font-extrabold text-amber-700 mt-1 block">
            {allQuotes.filter(q => q.status === 'UNDER_REVIEW' || q.status === 'SUBMITTED').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-emerald-600 block font-semibold">Accepted (Award L1)</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
            {allQuotes.filter(q => q.status === 'ACCEPTED').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-rose-600 block font-semibold">Rejected</span>
          <span className="text-2xl font-extrabold text-rose-700 mt-1 block">
            {allQuotes.filter(q => q.status === 'REJECTED').length}
          </span>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 text-xs font-bold">
          <button
            onClick={() => setActiveTab('rfqs')}
            className={`px-6 py-3.5 flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'rfqs'
                ? 'border-gov-600 text-gov-800 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 text-gov-600" />
            <span>All RFQs Raised ({tenders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-6 py-3.5 flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'quotes'
                ? 'border-gov-600 text-gov-800 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>Master Quotations Review Center ({allQuotes.length})</span>
          </button>
        </div>

        {/* TAB 1: ALL RFQS RAISED */}
        {activeTab === 'rfqs' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center space-x-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search RFQs by Title, Ref No, or Officer..."
                    value={rfqSearch}
                    onChange={(e) => setRfqSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Scope Filter Pill */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRfqScope('ALL')}
                    className={`px-3 py-1.5 rounded-md font-bold transition ${
                      rfqScope === 'ALL'
                        ? 'bg-white text-slate-800 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All RFQs ({tenders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRfqScope('MY')}
                    className={`px-3 py-1.5 rounded-md font-bold transition flex items-center ${
                      rfqScope === 'MY'
                        ? 'bg-amber-500 text-gov-950 shadow-xs'
                        : 'text-amber-700 hover:text-amber-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Raised by You ({myTendersCount})
                  </button>
                </div>

                <div className="flex items-center space-x-1 pl-2">
                  <span className="text-slate-500 font-semibold">Status:</span>
                  <select
                    value={rfqFilter}
                    onChange={(e) => setRfqFilter(e.target.value)}
                    className="px-2.5 py-1.5 border rounded-lg bg-white font-semibold text-slate-700"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Visual Color Legend Guide */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-amber-200 border-2 border-amber-500 inline-block"></span>
                  <span className="font-bold text-amber-950">Highlighted Amber Rows:</span>
                  <span className="text-slate-600">RFQs Raised by You ({user?.name || 'Logged-in Officer'}) — Full Edit & Submission Rights</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-white border border-slate-300 inline-block"></span>
                  <span className="text-slate-500">White Rows: RFQs Raised by other Officers (Read-only view)</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-gov-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                Logged in as: <strong>{user?.name} ({user?.designation || 'CE'})</strong>
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-3 px-3">RFQ Ref & Origin</th>
                    <th className="py-3 px-3">Title & Work Scope</th>
                    <th className="py-3 px-3">RFQ Items</th>
                    <th className="py-3 px-3">Quotation Window & Validity</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Submissions</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTenders.length > 0 ? (
                    filteredTenders.map(t => {
                      const isMine = t.created_by === currentUserId;
                      return (
                        <tr 
                          key={t.tender_id} 
                          className={`transition ${
                            isMine
                              ? 'bg-amber-50/70 hover:bg-amber-100/70 border-l-4 border-l-amber-500 shadow-xs'
                              : 'bg-white hover:bg-slate-50/80 border-l-4 border-l-transparent opacity-90'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="font-mono font-bold text-gov-800">{t.tender_ref_no}</div>
                            {isMine ? (
                              <span className="inline-flex items-center text-[10px] font-extrabold text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-full border border-amber-300 mt-1 shadow-xs">
                                👑 Raised by You ({user?.name ? user.name.split(' ')[0] : 'CE'})
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 mt-1">
                                Officer: {t.contact_person || `Officer #${t.created_by}`}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <Link to={`/tenders/${t.tender_id}`} className="font-bold text-slate-900 hover:text-gov-600 line-clamp-1">
                              {t.title}
                            </Link>
                            <span className="text-[10px] text-slate-500 block">{t.completion_period || 'Standard timeline'}</span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-700">
                            {t.jobs ? t.jobs.length : 0} Items
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            <div><strong>Deadline:</strong> {new Date(t.quotation_to_date).toLocaleDateString()}</div>
                            {t.validity_period && <div className="text-indigo-600 font-semibold">{t.validity_period}</div>}
                          </td>
                          <td className="py-3 px-3">
                            <StatusBadge status={t.status} size="sm" />
                          </td>
                          <td className="py-3 px-3 text-center">
                            {isMine ? (
                              <Link
                                to={`/ce/tenders/${t.tender_id}/submissions`}
                                className="px-3 py-1 bg-gov-700 hover:bg-gov-800 text-white font-bold rounded text-xs inline-flex items-center shadow-xs transition"
                              >
                                {t.submission_count || 0} Quotes
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Link>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">
                                Private to Creator ({t.submission_count || 0} Quotes)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {isMine ? (
                              <div className="flex items-center justify-center space-x-2">
                                <Link
                                  to={`/ce/tenders/${t.tender_id}/edit`}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-gov-950 font-bold rounded border border-amber-600 text-xs flex items-center transition shadow-xs"
                                  title="Extend Dates and Edit RFQ details"
                                >
                                  <Edit3 className="w-3 h-3 mr-1" />
                                  Edit & Extend
                                </Link>
                                <select
                                  value={t.status}
                                  onChange={(e) => handleStatusChange(t.tender_id, e.target.value)}
                                  className="px-2 py-1 border border-slate-300 rounded text-[11px] font-bold bg-white text-slate-700 shadow-xs"
                                >
                                  <option value="PUBLISHED">PUBLISHED</option>
                                  <option value="DRAFT">DRAFT</option>
                                  <option value="CLOSED">CLOSED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>
                              </div>
                            ) : (
                              <Link
                                to={`/tenders/${t.tender_id}`}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs inline-flex items-center"
                              >
                                <Eye className="w-3 h-3 mr-1 text-slate-500" />
                                View RFQ
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        No RFQs found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MASTER QUOTATIONS REVIEW CENTER */}
        {activeTab === 'quotes' && (
          <div className="p-6 space-y-4">
            {/* Officer Scoped Isolation Banner */}
            <div className="p-4 bg-gov-50/90 border border-gov-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gov-800 text-amber-400 flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gov-900 text-sm flex items-center">
                    Officer-Scoped Master Quotations Review Center
                    <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold border border-emerald-200">
                      🔒 100% Isolated & Private
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600">
                    Displaying <strong>{allQuotes.length} quotations</strong> received strictly for RFQs raised by <strong>{user?.name}</strong>. Quotations for other officers are restricted.
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
                Designation: <strong className="text-gov-800">{user?.designation || 'Chief Engineer'}</strong>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center space-x-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by Vendor Name, Quotation No, or RFQ Ref..."
                    value={quoteSearch}
                    onChange={(e) => setQuoteSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 font-semibold">Quotation Status:</span>
                <select
                  value={quoteFilter}
                  onChange={(e) => setQuoteFilter(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg bg-white font-semibold text-slate-700"
                >
                  <option value="ALL">All Quotations ({allQuotes.length})</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="ACCEPTED">ACCEPTED (Awarded L1)</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-3 px-3">Quotation Ref</th>
                    <th className="py-3 px-3">Vendor / Firm Name</th>
                    <th className="py-3 px-3">RFQ Reference & Title</th>
                    <th className="py-3 px-3">Quoted Amount (₹)</th>
                    <th className="py-3 px-3">Submission Time</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Evaluation & Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuotes.length > 0 ? (
                    filteredQuotes.map(q => (
                      <tr key={q.application_id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 font-mono font-bold text-gov-700">
                          {q.application_no || `APP-${q.application_id}`}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{q.firm_name}</div>
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                            {q.vendor_type || q.registration_type || 'Contractor'}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-mono text-[11px] font-bold text-slate-700">{q.tender_ref_no}</div>
                          <div className="text-slate-500 line-clamp-1">{q.tender_title}</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-black text-slate-900 text-sm">
                          ₹{q.quoted_amount ? q.quoted_amount.toLocaleString('en-IN') : '0.00'}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {new Date(q.submitted_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={q.status} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Link
                              to={`/ce/applications/${q.application_id}/review`}
                              className="px-2.5 py-1.5 bg-gov-700 hover:bg-gov-800 text-white font-bold rounded-lg text-xs inline-flex items-center shadow-xs transition"
                              title="Review Quotation Dossier"
                            >
                              <FileText className="w-3.5 h-3.5 mr-1" />
                              Review
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDownloadAllZip(q.application_id)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs inline-flex items-center border border-slate-300 transition"
                              title="Download all vendor documents as ZIP"
                            >
                              <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
                              ZIP
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        No quotations found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
