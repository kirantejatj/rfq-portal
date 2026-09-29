import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import CountdownTimer from '../components/CountdownTimer';
import { 
  Building2, Calendar, IndianRupee, Layers, FileText, Download, 
  HelpCircle, MessageSquare, ArrowRight, UserCheck, Phone, Mail, 
  MapPin, Send, Edit3, ShieldAlert, Image as ImageIcon, Clock 
} from 'lucide-react';

export default function TenderDetails() {
  const { id } = useParams();
  const { user, isApplicant, isCE } = useAuth();
  const [tender, setTender] = useState(null);
  const [clarifications, setClarifications] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [answerInput, setAnswerInput] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingQ, setSubmittingQ] = useState(false);

  useEffect(() => {
    fetchTenderData();
  }, [id]);

  const fetchTenderData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        api.get(`/tenders/${id}`),
        api.get(`/clarifications/tender/${id}`)
      ]);
      setTender(tRes.data);
      setClarifications(cRes.data);
    } catch (err) {
      console.error('Failed to load tender details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setSubmittingQ(true);
    try {
      await api.post('/clarifications', {
        tender_id: parseInt(id),
        question: newQuestion.trim()
      });
      setNewQuestion('');
      fetchTenderData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit query');
    } finally {
      setSubmittingQ(false);
    }
  };

  const handleAnswerQuestion = async (clarificationId) => {
    const ans = answerInput[clarificationId];
    if (!ans || !ans.trim()) return;
    try {
      await api.post(`/clarifications/${clarificationId}/answer`, {
        answer: ans.trim()
      });
      setAnswerInput(prev => ({ ...prev, [clarificationId]: '' }));
      fetchTenderData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reply');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#7A1315] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-[#58595B] text-sm">Loading Tender Specification Dossier...</p>
      </div>
    );
  }

  if (!tender) {
    return <div className="text-center py-20 text-slate-500">Tender not found.</div>;
  }

  const isCreatorOfficer = isCE && (user?.id === tender.created_by || user?.role === 'SUPER_ADMIN');
  const paperClippingDocs = (tender.documents || []).filter(d => d.document_type === 'PAPER_CLIPPING');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#A7A9AC]/30 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#7A1315] bg-[#FDE6D3] px-2.5 py-1 rounded border border-[#FBB97D]/50">
              {tender.tender_ref_no || `RFQ ID #${tender.tender_id}`}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#231F20] leading-tight">
              {tender.title}
            </h1>
            <div className="text-xs text-[#58595B] font-medium">
              Procuring Authority: <strong className="text-[#231F20]">{tender.authority_name}</strong>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <StatusBadge status={tender.status} />
            <CountdownTimer fromDate={tender.quotation_from_date} toDate={tender.quotation_to_date} />
          </div>
        </div>

        {/* Action Button Strip & Validity Note */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#58595B]">
            <span>Quotation Window: <strong>{new Date(tender.quotation_from_date).toLocaleDateString()}</strong> — <strong>{new Date(tender.quotation_to_date).toLocaleDateString()}</strong></span>
            {tender.revealing_date && (
              <span className="font-bold text-[#7A1315] bg-[#FDE6D3]/60 px-2 py-0.5 rounded border border-[#FBB97D] flex items-center">
                <Clock className="w-3 h-3 mr-1 text-[#CB902E]" />
                Reveals: {new Date(tender.revealing_date).toLocaleString()}
              </span>
            )}
            {tender.validity_period && (
              <span className="font-semibold text-[#0E2C49] bg-[#E8EEF5] px-2 py-0.5 rounded border border-[#0E2C49]/20">
                Validity: {tender.validity_period}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isCreatorOfficer && (
              <Link
                to={`/ce/tenders/${tender.tender_id}/edit`}
                className="px-4 py-2 bg-[#CB902E] hover:bg-[#B07B23] text-[#231F20] font-black rounded-lg shadow-sm text-xs transition flex items-center"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Edit RFQ & Extend Dates
              </Link>
            )}

            {isCreatorOfficer && (
              <Link
                to={`/ce/tenders/${tender.tender_id}/submissions`}
                className="px-4 py-2 bg-[#7A1315] hover:bg-[#A31E22] text-white font-semibold rounded-lg shadow-sm text-xs transition"
              >
                View Received Quotations ({tender.submission_count || 0})
              </Link>
            )}

            {tender.status === 'PUBLISHED' && tender.is_window_open && (
              <Link
                to={`/applicant/apply/${tender.tender_id}`}
                className="px-5 py-2.5 bg-[#7A1315] hover:bg-[#A31E22] text-white font-bold rounded-lg shadow-md text-sm transition flex items-center"
              >
                Submit Quotation Online
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Scope & Specifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* RFQ Items Schedule */}
          {tender.jobs && tender.jobs.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-[#231F20] flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-[#7A1315]" />
                  RFQ Items Schedule ({tender.jobs.length} Items Available)
                </h2>
                <span className="text-[11px] text-[#58595B] font-medium">Vendors can select specific items or entire schedule to quote</span>
              </div>

              <div className="space-y-3">
                {tender.jobs.map((job, idx) => (
                  <div key={job.job_id} className="p-4 bg-[#FAF8F5] rounded-xl border border-[#A7A9AC]/30 text-xs space-y-2 hover:border-[#7A1315]/40 transition">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-[#7A1315] bg-[#FDE6D3] px-2 py-0.5 rounded text-[11px] border border-[#FBB97D]/50">
                            {job.job_code || `ITEM #${idx + 1}`}
                          </span>
                          <span className="font-bold text-[#231F20] text-sm">{job.job_name}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          {job.work_type && (
                            <span className="text-[10px] font-semibold text-[#0E2C49] bg-[#E8EEF5] px-2 py-0.5 rounded border border-[#0E2C49]/20">
                              {job.work_type}
                            </span>
                          )}
                          {job.cl_number && (
                            <span className="text-[10px] font-mono text-[#58595B]">
                              Cl: {job.cl_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {job.job_description && (
                      <p className="text-[#414042] text-xs leading-relaxed">{job.job_description}</p>
                    )}

                    <div className="pt-2 border-t border-[#A7A9AC]/20 flex flex-wrap gap-4 text-[11px] text-[#58595B]">
                      {job.estimated_quantity && (
                        <span>Quantity: <strong className="text-[#231F20]">{job.estimated_quantity} {job.unit || 'units'}</strong></span>
                      )}
                      <span className="text-emerald-700 font-semibold">Status: {job.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Newspaper Tender Notice / Paper Clipping Section */}
          {paperClippingDocs.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#231F20] flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-[#7A1315]" />
                Newspaper Advertisement / Paper Clipping Notice
              </h2>
              <div className="space-y-3">
                {paperClippingDocs.map(doc => {
                  const isImg = /\.(jpg|jpeg|png|webp)$/i.test(doc.file_name);
                  return (
                    <div key={doc.tender_document_id} className="p-4 bg-[#FAF8F5] rounded-xl border border-[#A7A9AC]/30 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#231F20]">{doc.file_name}</span>
                        <a
                          href={`http://127.0.0.1:8000${doc.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-[#7A1315] hover:bg-[#A31E22] text-white rounded font-bold text-xs flex items-center"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" />
                          View / Download Clipping
                        </a>
                      </div>
                      {isImg && (
                        <div className="border rounded-lg overflow-hidden max-h-72 bg-white flex items-center justify-center p-2">
                          <img
                            src={`http://127.0.0.1:8000${doc.file_path}`}
                            alt="Newspaper Clipping"
                            className="max-h-64 object-contain rounded"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scope of Work */}
          <div className="bg-white rounded-xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-[#231F20] flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#7A1315]" />
              Scope of Work & Technical Requirements
            </h2>
            <div className="text-xs sm:text-sm text-[#414042] whitespace-pre-line leading-relaxed">
              {tender.scope_of_work || 'Details as per standard schedule.'}
            </div>
            {tender.background && (
              <div className="pt-3 border-t border-slate-100 text-xs text-[#58595B]">
                <strong>Project Background:</strong> {tender.background}
              </div>
            )}
          </div>

          {/* Technical Elements Breakdown */}
          <div className="bg-white rounded-xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#231F20] flex items-center">
              <Layers className="w-5 h-5 mr-2 text-[#7A1315]" />
              Technical Elements & Weight Parameters
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#A7A9AC]/30">
                <span className="text-[#58595B] block">Total Elements</span>
                <span className="text-base font-bold text-[#231F20]">{tender.total_elements || 'N/A'} pcs</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#A7A9AC]/30">
                <span className="text-[#58595B] block">Element Types</span>
                <span className="text-base font-bold text-[#231F20]">{tender.element_types || 'N/A'} types</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#A7A9AC]/30">
                <span className="text-[#58595B] block">Avg Weight</span>
                <span className="text-base font-bold text-[#231F20]">{tender.avg_weight_mt ? `${tender.avg_weight_mt} MT` : 'N/A'}</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#A7A9AC]/30">
                <span className="text-[#58595B] block">Min Weight</span>
                <span className="text-base font-bold text-[#231F20]">{tender.min_weight_mt ? `${tender.min_weight_mt} MT` : 'N/A'}</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#A7A9AC]/30">
                <span className="text-[#58595B] block">Max Weight</span>
                <span className="text-base font-bold text-[#231F20]">{tender.max_weight_mt ? `${tender.max_weight_mt} MT` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Official Attached Documents */}
          <div className="bg-white rounded-xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#231F20] flex items-center">
              <Download className="w-5 h-5 mr-2 text-[#7A1315]" />
              Official RFQ Documents & Technical Specification Files
            </h2>
            {tender.documents && tender.documents.filter(d => d.document_type !== 'PAPER_CLIPPING').length > 0 ? (
              <div className="space-y-2">
                {tender.documents.filter(d => d.document_type !== 'PAPER_CLIPPING').map(doc => (
                  <div
                    key={doc.tender_document_id}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#A7A9AC]/30 hover:bg-[#FAF8F5] transition"
                  >
                    <div className="flex items-center space-x-3 text-xs">
                      <FileText className="w-5 h-5 text-[#7A1315] shrink-0" />
                      <div>
                        <span className="font-bold text-[#231F20] block">{doc.file_name}</span>
                        <span className="text-[#58595B]">{doc.document_type} • {doc.file_size_kb || 120} KB • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <a
                      href={`http://127.0.0.1:8000${doc.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#FAF8F5] text-[#7A1315] hover:bg-[#FDE6D3] font-bold rounded text-xs transition flex items-center border border-[#FBB97D]"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Download
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#58595B] italic p-3 bg-[#FAF8F5] rounded">
                No external document attachments uploaded for this RFQ yet.
              </div>
            )}
          </div>

          {/* Pre-Bid Queries & Clarifications */}
          <div className="bg-white rounded-xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#231F20] flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-[#7A1315]" />
                Pre-Bid Clarifications & Queries ({clarifications.length})
              </div>
            </h2>

            <div className="space-y-3">
              {clarifications.length === 0 ? (
                <p className="text-xs text-[#58595B] italic">No pre-bid questions asked yet.</p>
              ) : (
                clarifications.map(c => (
                  <div key={c.clarification_id} className="p-4 rounded-lg bg-[#FAF8F5] border border-[#A7A9AC]/30 text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-[#231F20]">Q: {c.question}</span>
                      <span className="text-[10px] text-[#58595B]">{new Date(c.asked_at).toLocaleDateString()}</span>
                    </div>
                    {c.answer ? (
                      <div className="p-3 bg-emerald-50 text-emerald-900 rounded border border-emerald-200">
                        <strong className="block font-bold">Officer Response:</strong>
                        <p className="mt-1">{c.answer}</p>
                      </div>
                    ) : (
                      <div className="text-amber-700 italic text-[11px]">
                        Pending Officer Clarification
                        {isCE && (
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              placeholder="Type Officer reply here..."
                              value={answerInput[c.clarification_id] || ''}
                              onChange={(e) => setAnswerInput({ ...answerInput, [c.clarification_id]: e.target.value })}
                              className="flex-1 px-3 py-1 text-xs border rounded focus:outline-none"
                            />
                            <button
                              onClick={() => handleAnswerQuestion(c.clarification_id)}
                              className="px-3 py-1 bg-[#7A1315] text-white rounded font-bold hover:bg-[#A31E22] text-xs"
                            >
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Ask Query Form for Vendors */}
            {isApplicant && (
              <form onSubmit={handleAskQuestion} className="pt-4 border-t border-slate-100 space-y-2">
                <label className="text-xs font-bold text-[#231F20] block">Ask a Pre-Bid Technical Query</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter your technical or procedural question..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-[#A7A9AC]/50 rounded-lg focus:ring-2 focus:ring-[#7A1315] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingQ}
                    className="px-4 py-2 bg-[#7A1315] text-white rounded-lg font-bold text-xs hover:bg-[#A31E22] flex items-center"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Submit Query
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right 1 Col: Key Info & Authority Contact */}
        <div className="space-y-6">
          {/* Timelines & Quotation Revealing Date Card */}
          <div className="bg-white rounded-xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#231F20] uppercase tracking-wider">Quotation Timelines</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#58595B] block text-[11px]">Submission Deadline</span>
                <span className="font-bold text-[#7A1315] text-sm">
                  {new Date(tender.quotation_to_date).toLocaleString()}
                </span>
              </div>

              {tender.revealing_date && (
                <div className="p-3 bg-[#FDE6D3]/60 rounded-lg border border-[#FBB97D]">
                  <span className="text-[#7A1315] block text-[11px] font-bold flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-[#CB902E]" />
                    Quotation Revealing Date & Time
                  </span>
                  <span className="font-extrabold text-[#7A1315] text-sm mt-0.5 block">
                    {new Date(tender.revealing_date).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#58595B] block mt-1">
                    🔒 Vendor quotes remain securely sealed until this time.
                  </span>
                </div>
              )}

              {tender.validity_period && (
                <div className="p-3 bg-[#E8EEF5] rounded-lg border border-[#0E2C49]/20">
                  <span className="text-[#0E2C49] block text-[11px] font-semibold">Quotation Validity Period</span>
                  <span className="font-extrabold text-[#0E2C49] text-sm mt-0.5 block">
                    {tender.validity_period}
                  </span>
                  {tender.quotation_valid_upto && (
                    <span className="text-[10px] text-[#58595B] block mt-1">
                      Valid Upto: {new Date(tender.quotation_valid_upto).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Inviting Authority Contact Card */}
          <div className="bg-white rounded-xl p-6 border border-[#A7A9AC]/30 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#231F20] uppercase tracking-wider">RFQ Inviting Authority</h3>
            <div className="space-y-2.5 text-xs text-[#414042]">
              <div className="font-bold text-[#231F20]">{tender.contact_person || 'Office of Chief Engineer'}</div>
              {tender.contact_phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-[#7A1315]" />
                  <span>{tender.contact_phone}</span>
                </div>
              )}
              {tender.contact_email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-[#7A1315]" />
                  <span>{tender.contact_email}</span>
                </div>
              )}
              {tender.office_address && (
                <div className="flex items-start space-x-2 pt-1">
                  <MapPin className="w-4 h-4 text-[#7A1315] shrink-0 mt-0.5" />
                  <span>{tender.office_address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
