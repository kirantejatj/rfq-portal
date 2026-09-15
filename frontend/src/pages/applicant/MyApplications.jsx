import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { 
  FileText, IndianRupee, Calendar, User, Eye, X, Download, ShieldAlert, Briefcase, Layers 
} from 'lucide-react';

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications/my');
      setApps(res.data);
    } catch (err) {
      console.error('Failed to load my applications', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Submitted Quotations</h1>
          <p className="text-xs text-slate-500">
            Role Policy: You can see <strong>ONLY</strong> your own firm's submissions across all RFQs.
          </p>
        </div>
        <Link
          to="/"
          className="px-4 py-2 bg-gov-600 hover:bg-gov-700 text-white font-bold rounded-lg text-xs transition"
        >
          + Submit New Quotation
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading your submissions from RFQ_DB...</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Quotations Submitted Yet</h3>
          <p className="text-slate-500 text-xs mt-1">Browse published RFQs and submit your technical & commercial bids.</p>
          <Link
            to="/"
            className="mt-4 inline-block px-4 py-2 bg-gov-600 text-white text-xs font-bold rounded-lg"
          >
            Explore Active RFQs
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3 px-4">App Ref No</th>
                  <th className="py-3 px-4">RFQ Ref / Title</th>
                  <th className="py-3 px-4">Selected RFQ Items</th>
                  <th className="py-3 px-4">Signatory</th>
                  <th className="py-3 px-4">Quoted Amount</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apps.map(app => (
                  <tr key={app.application_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-gov-700">{app.application_no}</td>
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-bold text-slate-900 block truncate">{app.tender_title}</span>
                      <span className="text-[11px] font-mono text-slate-500">{app.tender_ref_no}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {app.selected_jobs && app.selected_jobs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {app.selected_jobs.map(sj => (
                            <span key={sj.job_id} className="px-1.5 py-0.5 bg-gov-50 text-gov-800 font-mono font-semibold rounded text-[10px] border border-gov-200" title={sj.job_name}>
                              {sj.job_code || `Item #${sj.job_id}`}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">All Scope</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-semibold block">{app.signatory_name || 'N/A'}</span>
                      <span className="text-[10px] text-slate-400">{app.signatory_designation}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span className="flex items-center">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-amber-600" />
                        ₹{app.quoted_amount ? app.quoted_amount.toLocaleString('en-IN') : '0'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} size="sm" />
                      {app.remarks && (
                        <div className="text-[10px] text-slate-500 mt-1 max-w-[150px] truncate" title={app.remarks}>
                          CE: {app.remarks}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1.5 bg-gov-50 text-gov-700 hover:bg-gov-100 rounded font-semibold text-xs transition inline-flex items-center"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Full Application Dossier View */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded">
                  {selectedApp.application_no}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedApp.tender_title}</h2>
                <span className="text-xs text-slate-500">Tender Ref: {selectedApp.tender_ref_no}</span>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Status & Review Remarks */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Evaluation Status</span>
                <div className="mt-1"><StatusBadge status={selectedApp.status} /></div>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Total Quoted Commercials</span>
                <span className="text-lg font-bold text-slate-900 flex items-center">
                  <IndianRupee className="w-4 h-4 mr-0.5 text-amber-600" />
                  ₹{selectedApp.quoted_amount ? selectedApp.quoted_amount.toLocaleString('en-IN') : '0'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Submission Timestamp</span>
                <span className="font-semibold text-slate-800">{new Date(selectedApp.submitted_at).toLocaleString()}</span>
              </div>
            </div>

            {selectedApp.remarks && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                <strong>Chief Engineer Review Remarks:</strong> {selectedApp.remarks}
              </div>
            )}

            {/* Selected Work Packages / Jobs Schedule */}
            {selectedApp.selected_jobs && selectedApp.selected_jobs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
                  <Briefcase className="w-4 h-4 mr-1.5 text-gov-600" />
                  Selected Work Packages & Job-Wise Quotations ({selectedApp.selected_jobs.length})
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <tr>
                        <th className="p-2.5">Job Code</th>
                        <th className="p-2.5">Job Name</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Est. Qty</th>
                        <th className="p-2.5">Est. Budget</th>
                        <th className="p-2.5 text-right">Applicant Quote</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedApp.selected_jobs.map(sj => (
                        <tr key={sj.job_id}>
                          <td className="p-2.5 font-mono font-bold text-gov-700">{sj.job_code || `Job #${sj.job_id}`}</td>
                          <td className="p-2.5 font-semibold text-slate-800">
                            {sj.job_name}
                            {sj.remarks && <span className="block text-[10px] text-slate-500 font-normal">Note: {sj.remarks}</span>}
                          </td>
                          <td className="p-2.5 text-slate-600">{sj.category || '-'}</td>
                          <td className="p-2.5 text-slate-600">{sj.estimated_quantity ? `${sj.estimated_quantity} ${sj.unit || ''}` : '-'}</td>
                          <td className="p-2.5 text-slate-600">₹{sj.estimated_cost ? sj.estimated_cost.toLocaleString('en-IN') : '-'}</td>
                          <td className="p-2.5 text-right font-bold text-emerald-800">
                            ₹{sj.quoted_amount ? sj.quoted_amount.toLocaleString('en-IN') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Annexure III: Line Items */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Annexure III: Technical Proposal & Price Line Items
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Job / Package</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5">Unit</th>
                      <th className="p-2.5">Qty</th>
                      <th className="p-2.5">Rate (₹)</th>
                      <th className="p-2.5 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedApp.proposal_items.map((item, idx) => {
                      const matchedJob = selectedApp.selected_jobs?.find(j => j.job_id === item.job_id);
                      return (
                        <tr key={idx}>
                          <td className="p-2.5">{item.sl_no}</td>
                          <td className="p-2.5 font-mono text-gov-700 font-bold text-[11px]">
                            {matchedJob ? (matchedJob.job_code || `Job #${matchedJob.job_id}`) : (item.job_id ? `Job #${item.job_id}` : 'General')}
                          </td>
                          <td className="p-2.5 font-semibold text-slate-800">{item.item_description}</td>
                          <td className="p-2.5">{item.unit || 'pcs'}</td>
                          <td className="p-2.5">{item.quantity}</td>
                          <td className="p-2.5">₹{item.rate_per_unit ? item.rate_per_unit.toLocaleString('en-IN') : '-'}</td>
                          <td className="p-2.5 text-right font-bold">₹{item.amount ? item.amount.toLocaleString('en-IN') : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Annexure II: Past Capabilities */}
            {selectedApp.capabilities && selectedApp.capabilities.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Annexure II: Past Technical & Financial Capabilities
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Work Description</th>
                        <th className="p-2.5">Client</th>
                        <th className="p-2.5">Cost (₹ Lakhs)</th>
                        <th className="p-2.5">FY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedApp.capabilities.map((c, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5">{c.sl_no}</td>
                          <td className="p-2.5 font-semibold">{c.work_description}</td>
                          <td className="p-2.5">{c.client_name || '-'}</td>
                          <td className="p-2.5 font-bold">₹{c.cost_lakhs} L</td>
                          <td className="p-2.5">{c.financial_year || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Attached Documents */}
            {selectedApp.documents && selectedApp.documents.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Attached Verification Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedApp.documents.map(doc => (
                    <div key={doc.document_id} className="flex justify-between items-center p-3 rounded-lg border border-slate-200">
                      <div>
                        <span className="font-bold block">{doc.file_name}</span>
                        <span className="text-[10px] text-slate-500">{doc.document_type}</span>
                      </div>
                      <a
                        href={doc.file_path.startsWith('http') ? doc.file_path : `http://127.0.0.1:8000${doc.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-gov-50 text-gov-700 rounded font-semibold text-xs flex items-center"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Status History */}
            {selectedApp.history && selectedApp.history.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Status Transition Audit Trail
                </h3>
                <div className="space-y-1.5 text-xs text-slate-600">
                  {selectedApp.history.map(h => (
                    <div key={h.history_id} className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                      <div>
                        Transitioned to <strong className="text-slate-900">{h.new_status}</strong>
                        {h.remarks && <span className="text-slate-500 italic"> — "{h.remarks}"</span>}
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(h.changed_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
