import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { 
  Building2, FileText, CheckCircle2, Clock, PlusCircle, ArrowRight, IndianRupee 
} from 'lucide-react';

export default function ApplicantDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myApps, setMyApps] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [sRes, aRes, tRes] = await Promise.all([
          api.get('/stats/applicant'),
          api.get('/applications/my'),
          api.get('/tenders?status_filter=PUBLISHED')
        ]);
        setStats(sRes.data);
        setMyApps(aRes.data);
        setTenders(tRes.data);
      } catch (err) {
        console.error('Failed to load applicant dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Loading Applicant Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Applicant Workspace</span>
          <h1 className="text-2xl font-bold text-slate-900">{user?.firm_name || user?.name || 'Registered Applicant'}</h1>
          <p className="text-xs text-slate-500">
            GSTIN: <strong>{user?.gstin || 'Registered'}</strong> • Mobile: <strong>+91 {user?.mobile}</strong>
          </p>
        </div>
        <Link
          to="/"
          className="px-4 py-2.5 bg-gov-600 hover:bg-gov-700 text-white font-bold rounded-lg shadow-sm text-xs transition flex items-center"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Browse Active Tenders
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">Total Quotations Submitted</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats?.my_total_applications || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-blue-600 block">Submitted / Queued</span>
          <span className="text-2xl font-extrabold text-blue-700 mt-1 block">{stats?.submitted || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-amber-600 block">Under CE Review</span>
          <span className="text-2xl font-extrabold text-amber-700 mt-1 block">{stats?.under_review || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 block">Accepted Quotations</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{stats?.accepted || 0}</span>
        </div>
      </div>

      {/* 2 Column Layout: Recent Submissions & Active RFQs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: My Recent Quotations */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gov-600" />
              My Quotation Submissions
            </h2>
            <Link to="/applicant/my-applications" className="text-xs text-gov-600 font-bold hover:underline">
              View All ({myApps.length})
            </Link>
          </div>

          {myApps.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">You haven't submitted any quotations yet.</p>
          ) : (
            <div className="space-y-3">
              {myApps.slice(0, 3).map(app => (
                <div key={app.application_id} className="p-4 rounded-lg border border-slate-200 hover:border-gov-400 transition space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[10px] text-gov-700 font-bold block">{app.application_no}</span>
                      <h3 className="font-bold text-slate-900">{app.tender_title}</h3>
                    </div>
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                  <div className="flex justify-between items-center text-slate-600 pt-1">
                    <span className="font-bold text-slate-900 flex items-center">
                      <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-amber-600" />
                      ₹{app.quoted_amount ? app.quoted_amount.toLocaleString('en-IN') : '0'}
                    </span>
                    <span className="text-[11px] text-slate-400">Submitted: {new Date(app.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Active Tenders Open For Quotation */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gov-600" />
              Tenders Open for Submission
            </h2>
            <Link to="/" className="text-xs text-gov-600 font-bold hover:underline">
              Browse All
            </Link>
          </div>

          <div className="space-y-3">
            {tenders.slice(0, 3).map(t => (
              <div key={t.tender_id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900">{t.title}</h3>
                  <span className="font-mono text-[10px] text-slate-500 font-semibold">{t.tender_ref_no}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 text-[11px]">
                    EMD: <strong>₹{t.emd_amount.toLocaleString('en-IN')}</strong>
                  </span>
                  <Link
                    to={`/applicant/apply/${t.tender_id}`}
                    className="px-3 py-1.5 bg-gov-600 hover:bg-gov-700 text-white rounded font-bold transition flex items-center"
                  >
                    Submit Quotation
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
