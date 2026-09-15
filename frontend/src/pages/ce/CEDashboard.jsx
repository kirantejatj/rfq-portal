import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { 
  Building2, PlusCircle, Layers, FileCheck, IndianRupee, Users, 
  Clock, Eye, ArrowRight, ShieldCheck 
} from 'lucide-react';

export default function CEDashboard() {
  const [stats, setStats] = useState(null);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCEDashboard();
  }, []);

  const fetchCEDashboard = async () => {
    setLoading(true);
    try {
      const [sRes, tRes] = await Promise.all([
        api.get('/stats/ce'),
        api.get('/tenders?status_filter=ALL')
      ]);
      setStats(sRes.data);
      setTenders(tRes.data);
    } catch (err) {
      console.error('Failed to load CE stats', err);
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

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Loading Chief Engineer Executive Dashboard...</p>
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
            <span>Officer Executive Panel</span>
          </div>
          <h1 className="text-2xl font-bold">RFQ & Vendor Quotation Evaluation Center</h1>
          <p className="text-xs text-slate-400">
            Authorized Procurement Management • Total Quotations Received: <strong>{stats?.total_applications || 0}</strong>
          </p>
        </div>
        <Link
          to="/ce/tenders/create"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-gov-900 font-bold rounded-lg shadow text-xs transition flex items-center"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Raise New RFQ
        </Link>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block font-semibold">Total RFQs</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats?.total_tenders || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-emerald-600 block font-semibold">Active Windows</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{stats?.active_tenders || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-blue-600 block font-semibold">All Quotations</span>
          <span className="text-2xl font-extrabold text-blue-700 mt-1 block">{stats?.total_applications || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-amber-600 block font-semibold">Under Review</span>
          <span className="text-2xl font-extrabold text-amber-700 mt-1 block">{stats?.under_review_applications || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-emerald-600 block font-semibold">Accepted (L1)</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{stats?.accepted_applications || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-purple-600 block font-semibold">Registered Vendors</span>
          <span className="text-2xl font-extrabold text-purple-700 mt-1 block">{stats?.total_registered_applicants || 0}</span>
        </div>
      </div>

      {/* RFQs Master Management Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <Layers className="w-5 h-5 mr-2 text-gov-600" />
            All RFQs Raised
          </h2>
          <span className="text-xs text-slate-500 font-medium">Manage status, evaluate vendor quotation submissions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <th className="py-3 px-3">RFQ Ref No</th>
                <th className="py-3 px-3">Title</th>
                <th className="py-3 px-3">EMD (₹)</th>
                <th className="py-3 px-3">Quotation Window & Validity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Quotations</th>
                <th className="py-3 px-3 text-center">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenders.map(t => (
                <tr key={t.tender_id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-mono font-bold text-gov-700">{t.tender_ref_no}</td>
                  <td className="py-3 px-3 max-w-sm">
                    <Link to={`/tenders/${t.tender_id}`} className="font-bold text-slate-900 hover:text-gov-600 line-clamp-1">
                      {t.title}
                    </Link>
                    <span className="text-[10px] text-slate-400">{t.completion_period || 'Standard period'}</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">
                    ₹{t.emd_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[11px]">
                    <div>To: {new Date(t.quotation_to_date).toLocaleDateString()}</div>
                    {t.validity_period && <div className="text-indigo-600 font-semibold">{t.validity_period}</div>}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={t.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Link
                      to={`/ce/tenders/${t.tender_id}/submissions`}
                      className="px-3 py-1 bg-gov-50 text-gov-800 hover:bg-gov-100 font-bold rounded text-xs inline-flex items-center"
                    >
                      {t.submission_count || 0} Quotations
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.tender_id, e.target.value)}
                      className="px-2 py-1 border rounded text-[11px] font-semibold bg-white"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="CLOSED">CLOSED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
