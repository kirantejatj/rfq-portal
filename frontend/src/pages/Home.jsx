import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import CountdownTimer from '../components/CountdownTimer';
import { Search, Filter, Calendar, IndianRupee, Layers, Weight, ArrowRight, FileCheck, Briefcase } from 'lucide-react';

export default function Home() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PUBLISHED');

  useEffect(() => {
    fetchTenders();
  }, [statusFilter]);

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tenders', {
        params: { status_filter: statusFilter }
      });
      setTenders(res.data);
    } catch (err) {
      console.error('Failed to load tenders', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tenders.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.tender_ref_no && t.tender_ref_no.toLowerCase().includes(search.toLowerCase())) ||
    (t.authority_name && t.authority_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-gov-900 via-gov-800 to-gov-700 rounded-2xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold">
            <span>✨ AGIC Infrastructure Tender Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Request for Quotation (RFQ) Submissions
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Discover active engineering, fabrication, and infrastructure tenders. Submit competitive quotations with Annexure II capabilities and Annexure III itemized pricing within the authorized window.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/applicant/login"
              className="bg-amber-500 hover:bg-amber-600 text-gov-900 font-bold px-5 py-2.5 rounded-lg shadow-md transition text-sm flex items-center"
            >
              Submit Quotation as Applicant
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
            <Link
              to="/ce/login"
              className="bg-gov-700/80 hover:bg-gov-700 text-white font-medium px-5 py-2.5 rounded-lg border border-gov-600 transition text-sm"
            >
              Chief Engineer Evaluation Login
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by tender ref no, keyword, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gov-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600 uppercase">Status:</span>
          {['PUBLISHED', 'ALL', 'CLOSED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-gov-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'PUBLISHED' ? 'Active / Published' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Tender Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading RFQ tenders from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Tenders Found</h3>
          <p className="text-slate-500 text-xs mt-1">There are currently no tenders matching your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map(t => (
            <div
              key={t.tender_id}
              className="bg-white rounded-xl border border-slate-200 hover:border-gov-500 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-gov-600 bg-gov-50 px-2 py-0.5 rounded border border-gov-100">
                      {t.tender_ref_no || `TENDER #${t.tender_id}`}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 hover:text-gov-700 transition">
                      <Link to={`/tenders/${t.tender_id}`}>{t.title}</Link>
                    </h2>
                    <div className="text-xs text-slate-500 font-medium">
                      Authority: <span className="text-slate-700 font-semibold">{t.authority_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CountdownTimer fromDate={t.quotation_from_date} toDate={t.quotation_to_date} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {t.scope_of_work || t.background || 'No scope of work summary provided.'}
                </p>

                {/* Key Spec Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs mb-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">EMD Amount</span>
                    <span className="font-bold text-slate-800 flex items-center">
                      <IndianRupee className="w-3 h-3 mr-0.5 text-amber-600" />
                      ₹{t.emd_amount ? t.emd_amount.toLocaleString('en-IN') : '0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Completion Period</span>
                    <span className="font-bold text-slate-800">{t.completion_period || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Elements / Types</span>
                    <span className="font-bold text-slate-800">
                      {t.total_elements ? `${t.total_elements} pcs (${t.element_types || 1} types)` : 'Custom'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Weight Spec</span>
                    <span className="font-bold text-slate-800">
                      {t.avg_weight_mt ? `Avg ${t.avg_weight_mt} MT (Max ${t.max_weight_mt || '-'} MT)` : 'Standard'}
                    </span>
                  </div>
                </div>

                {/* Work Packages / Jobs Badges */}
                {t.jobs && t.jobs.length > 0 && (
                  <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-gov-800 font-bold text-[11px] flex items-center mr-1">
                      <Briefcase className="w-3 h-3 mr-1 text-gov-600" />
                      {t.jobs.length} Work Package{t.jobs.length > 1 ? 's' : ''}:
                    </span>
                    {t.jobs.map(j => (
                      <span key={j.job_id} className="px-2 py-0.5 bg-gov-50 text-gov-800 border border-gov-200 rounded font-medium text-[11px]">
                        <strong>{j.job_code}</strong>: {j.job_name.length > 30 ? j.job_name.slice(0, 30) + '...' : j.job_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center text-xs gap-3">
                <div className="text-slate-500 flex items-center space-x-4">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Window: <strong>{new Date(t.quotation_from_date).toLocaleDateString()}</strong> to <strong>{new Date(t.quotation_to_date).toLocaleDateString()}</strong>
                  </span>
                  {t.documents && t.documents.length > 0 && (
                    <span className="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                      📁 {t.documents.length} Attached Doc(s)
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/tenders/${t.tender_id}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
                  >
                    View Details & Docs
                  </Link>
                  {t.status === 'PUBLISHED' && t.is_window_open && (
                    <Link
                      to={`/applicant/apply/${t.tender_id}`}
                      className="px-4 py-2 bg-gov-600 hover:bg-gov-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center"
                    >
                      Submit Quotation
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
