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
        <div className="animate-spin w-8 h-8 border-4 border-[#7A1315] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-[#58595B] text-xs font-medium">Loading Applicant Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#A7A9AC]/30 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#58595B] uppercase tracking-wider">Vendor Workspace</span>
            {user?.vendor_type && (
              <span className="text-[11px] font-bold text-[#0E2C49] bg-[#EEF3F8] px-2 py-0.5 rounded border border-[#A7BFD7]">
                {user.vendor_type}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-[#231F20]">{user?.firm_name || user?.name || 'Registered Vendor'}</h1>
          <p className="text-xs text-[#58595B]">
            GSTIN: <strong>{user?.gstin || 'Registered'}</strong> • Mobile: <strong>+91 {user?.mobile}</strong>
          </p>
        </div>
        <Link
          to="/"
          className="px-4 py-2.5 bg-[#A31E22] hover:bg-[#7A1315] text-white font-bold rounded-lg shadow-sm text-xs transition flex items-center"
        >
          <PlusCircle className="w-4 h-4 mr-1.5 text-[#FBB97D]" />
          Browse Active RFQs
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#A7A9AC]/30 shadow-sm">
          <span className="text-xs font-bold text-[#58595B] block">Total Quotations Submitted</span>
          <span className="text-2xl font-black text-[#231F20] mt-1 block">{stats?.my_total_applications || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#A7A9AC]/30 shadow-sm">
          <span className="text-xs font-bold text-[#0E2C49] block">Submitted / Queued</span>
          <span className="text-2xl font-black text-[#0E2C49] mt-1 block">{stats?.submitted || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#A7A9AC]/30 shadow-sm">
          <span className="text-xs font-bold text-[#67491C] block">Under Officer Review</span>
          <span className="text-2xl font-black text-[#CB902E] mt-1 block">{stats?.under_review || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#A7A9AC]/30 shadow-sm">
          <span className="text-xs font-bold text-emerald-700 block">Accepted Quotations</span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block">{stats?.accepted || 0}</span>
        </div>
      </div>

      {/* 2 Column Layout: Recent Submissions & Active RFQs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: My Recent Quotations */}
        <div className="bg-white rounded-xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#FDE6D3] pb-3">
            <h2 className="text-base font-bold text-[#231F20] flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#7A1315]" />
              My Quotation Submissions
            </h2>
            <Link to="/applicant/my-applications" className="text-xs text-[#A31E22] font-bold hover:underline">
              View All ({myApps.length})
            </Link>
          </div>

          {myApps.length === 0 ? (
            <p className="text-xs text-[#58595B] italic py-6 text-center">You haven't submitted any quotations yet.</p>
          ) : (
            <div className="space-y-3">
              {myApps.slice(0, 3).map(app => (
                <div key={app.application_id} className="p-4 rounded-lg border border-[#A7A9AC]/30 hover:border-[#CB902E] transition space-y-2 text-xs bg-[#FAF8F5]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[10px] text-[#7A1315] font-bold block">{app.application_no}</span>
                      <h3 className="font-bold text-[#231F20]">{app.tender_title}</h3>
                    </div>
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                  <div className="flex justify-between items-center text-[#58595B] pt-1">
                    <span className="font-bold text-[#231F20] flex items-center">
                      <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-[#CB902E]" />
                      ₹{app.quoted_amount ? app.quoted_amount.toLocaleString('en-IN') : '0'}
                    </span>
                    <span className="text-[11px] text-[#58595B]">Submitted: {new Date(app.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Active RFQs Open For Quotation */}
        <div className="bg-white rounded-xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#FDE6D3] pb-3">
            <h2 className="text-base font-bold text-[#231F20] flex items-center">
              <Clock className="w-5 h-5 mr-2 text-[#7A1315]" />
              RFQs Open for Quotation
            </h2>
            <Link to="/" className="text-xs text-[#A31E22] font-bold hover:underline">
              Browse All
            </Link>
          </div>

          <div className="space-y-3">
            {tenders.slice(0, 3).map(t => (
              <div key={t.tender_id} className="p-4 rounded-lg bg-[#FAF8F5] border border-[#A7A9AC]/30 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-[#231F20]">{t.title}</h3>
                  <span className="font-mono text-[10px] text-[#7A1315] font-bold bg-[#FDE6D3] px-1.5 py-0.5 rounded border border-[#FBB97D]">{t.tender_ref_no}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[#58595B] text-[11px]">
                    Validity: <strong>{t.validity_period || 'Standard'}</strong>
                  </span>
                  <Link
                    to={`/applicant/apply/${t.tender_id}`}
                    className="px-3 py-1.5 bg-[#A31E22] hover:bg-[#7A1315] text-white rounded font-bold transition flex items-center"
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
