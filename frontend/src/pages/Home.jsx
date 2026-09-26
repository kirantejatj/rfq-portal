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
      {/* Hero Banner: Black -> Deep Maroon -> Red Maroon Gradient */}
      <div className="bg-gradient-to-r from-[#231F20] via-[#7A1315] to-[#A31E22] rounded-2xl p-8 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden border border-[#7A1315]/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#CB902E]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-[#FDE6D3]/15 text-[#FBB97D] border border-[#CB902E]/40 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
            <span>🏛️ AGIC Infrastructure Procurement System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            RFQ Portal
          </h1>
          <p className="text-[#FDE6D3] text-xs sm:text-sm leading-relaxed opacity-90">
            Discover active engineering, procurement, and infrastructure RFQs. Submit competitive quotations with Annexure II capabilities and itemized RFQ pricing within the authorized window.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/applicant/login"
              className="bg-gradient-to-r from-[#CB902E] to-[#CA6E28] hover:from-[#B07B23] hover:to-[#B25D1D] text-[#231F20] font-black px-5 py-2.5 rounded-lg shadow-md transition text-xs sm:text-sm flex items-center border border-[#CB902E]/50 uppercase tracking-wide"
            >
              Submit Quotation as Vendor
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
            <Link
              to="/ce/login"
              className="bg-[#231F20]/60 hover:bg-[#231F20] text-white font-bold px-5 py-2.5 rounded-lg border border-[#CB902E]/40 transition text-xs sm:text-sm flex items-center"
            >
              Officer Portal Login
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="bg-white rounded-xl p-4 border border-[#A7A9AC]/30 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#58595B]" />
          <input
            type="text"
            placeholder="Search by RFQ ref no, keyword, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#A7A9AC]/50 focus:outline-none focus:ring-2 focus:ring-[#CB902E] focus:border-transparent bg-[#FAF8F5]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <Filter className="w-4 h-4 text-[#58595B]" />
          <span className="text-xs font-bold text-[#414042] uppercase tracking-wider">Status:</span>
          {['PUBLISHED', 'ALL', 'CLOSED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-[#7A1315] text-white shadow-sm'
                  : 'bg-[#FDE6D3]/40 text-[#414042] hover:bg-[#FDE6D3] hover:text-[#7A1315]'
              }`}
            >
              {st === 'PUBLISHED' ? 'Active / Published' : st}
            </button>
          ))}
        </div>
      </div>

      {/* RFQ Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#7A1315] border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-[#58595B] text-xs font-medium">Loading RFQs from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#A7A9AC]/30 p-12 text-center shadow-sm">
          <FileCheck className="w-12 h-12 text-[#A7A9AC] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#414042]">No RFQs Found</h3>
          <p className="text-[#58595B] text-xs mt-1">There are currently no RFQs matching your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map(t => (
            <div
              key={t.tender_id}
              className="bg-white rounded-xl border border-[#A7A9AC]/30 hover:border-[#CB902E] shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-[#7A1315] bg-[#FDE6D3] px-2.5 py-0.5 rounded border border-[#FBB97D]">
                      {t.tender_ref_no || `RFQ #${t.tender_id}`}
                    </span>
                    <h2 className="text-lg font-bold text-[#231F20] hover:text-[#7A1315] transition">
                      <Link to={`/tenders/${t.tender_id}`}>{t.title}</Link>
                    </h2>
                    <div className="text-xs text-[#58595B] font-medium">
                      Authority: <span className="text-[#231F20] font-semibold">{t.authority_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CountdownTimer fromDate={t.quotation_from_date} toDate={t.quotation_to_date} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>

                <p className="text-xs text-[#414042] line-clamp-2 mb-4 leading-relaxed">
                  {t.scope_of_work || t.background || 'No scope of work summary provided.'}
                </p>

                {/* Key Spec Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-3 rounded-lg border border-[#FDE6D3] text-xs mb-3">
                  <div>
                    <span className="text-[#58595B] block text-[10px] uppercase font-bold">RFQ Scope Items</span>
                    <span className="font-bold text-[#7A1315] flex items-center">
                      <Briefcase className="w-3 h-3 mr-1 text-[#CB902E]" />
                      {t.jobs && t.jobs.length > 0 ? `${t.jobs.length} Item(s)` : 'Full Scope'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#58595B] block text-[10px] uppercase font-bold">Completion Period</span>
                    <span className="font-bold text-[#231F20]">{t.completion_period || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#58595B] block text-[10px] uppercase font-bold">Quotation Validity</span>
                    <span className="font-bold text-[#0E2C49]">
                      {t.validity_period || 'Standard Period'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#58595B] block text-[10px] uppercase font-bold">Weight Spec</span>
                    <span className="font-bold text-[#231F20]">
                      {t.avg_weight_mt ? `Avg ${t.avg_weight_mt} MT (Max ${t.max_weight_mt || '-'} MT)` : 'Standard'}
                    </span>
                  </div>
                </div>

                {/* RFQ Items Badges */}
                {t.jobs && t.jobs.length > 0 && (
                  <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[#7A1315] font-bold text-[11px] flex items-center mr-1">
                      <Briefcase className="w-3 h-3 mr-1 text-[#CB902E]" />
                      {t.jobs.length} RFQ Item{t.jobs.length > 1 ? 's' : ''}:
                    </span>
                    {t.jobs.map(j => (
                      <span key={j.job_id} className="px-2 py-0.5 bg-[#FDE6D3]/60 text-[#7A1315] border border-[#FBB97D]/60 rounded font-medium text-[11px]">
                        <strong>{j.job_code}</strong> ({j.category || 'Supply'}): {j.job_name.length > 30 ? j.job_name.slice(0, 30) + '...' : j.job_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#FDE6D3] flex flex-wrap justify-between items-center text-xs gap-3">
                <div className="text-[#58595B] flex items-center space-x-4">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-[#CB902E]" />
                    Window: <strong>{new Date(t.quotation_from_date).toLocaleDateString()}</strong> to <strong>{new Date(t.quotation_to_date).toLocaleDateString()}</strong>
                  </span>
                  {t.documents && t.documents.length > 0 && (
                    <span className="bg-[#FAF8F5] text-[#414042] border border-[#A7A9AC]/40 px-2 py-0.5 rounded text-[11px] font-semibold">
                      📁 {t.documents.length} Attached Doc(s)
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/tenders/${t.tender_id}`}
                    className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#FDE6D3] text-[#414042] hover:text-[#7A1315] font-bold rounded-lg transition border border-[#A7A9AC]/30"
                  >
                    View Details & Docs
                  </Link>
                  {t.status === 'PUBLISHED' && t.is_window_open && (
                    <Link
                      to={`/applicant/apply/${t.tender_id}`}
                      className="px-4 py-2 bg-[#A31E22] hover:bg-[#7A1315] text-white font-bold rounded-lg shadow-sm transition flex items-center"
                    >
                      Submit Quotation
                      <ArrowRight className="w-3 h-3 ml-1" />
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
