import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import CountdownTimer from '../components/CountdownTimer';
import { 
  Building2, Calendar, IndianRupee, Layers, FileText, Download, 
  HelpCircle, MessageSquare, ArrowRight, UserCheck, Phone, Mail, MapPin, Send
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
        <div className="animate-spin w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Loading Tender Specification Dossier...</p>
      </div>
    );
  }

  if (!tender) {
    return <div className="text-center py-20 text-slate-500">Tender not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-gov-700 bg-gov-50 px-2.5 py-1 rounded border border-gov-100">
              {tender.tender_ref_no || `RFQ ID #${tender.tender_id}`}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {tender.title}
            </h1>
            <div className="text-xs text-slate-500 font-medium">
              Procuring Authority: <strong className="text-slate-800">{tender.authority_name}</strong>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <StatusBadge status={tender.status} />
            <CountdownTimer fromDate={tender.quotation_from_date} toDate={tender.quotation_to_date} />
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4 text-xs text-slate-600">
            <span>Quotation Window: <strong>{new Date(tender.quotation_from_date).toLocaleString()}</strong> — <strong>{new Date(tender.quotation_to_date).toLocaleString()}</strong></span>
          </div>

          <div className="flex items-center space-x-3">
            {isCE && (
              <Link
                to={`/ce/tenders/${tender.tender_id}/submissions`}
                className="px-4 py-2 bg-gov-800 hover:bg-gov-900 text-white font-semibold rounded-lg shadow-sm text-xs transition"
              >
                View All Submissions ({tender.submission_count || 0})
              </Link>
            )}

            {tender.status === 'PUBLISHED' && tender.is_window_open && (
              <Link
                to={`/applicant/apply/${tender.tender_id}`}
                className="px-5 py-2.5 bg-gov-600 hover:bg-gov-700 text-white font-bold rounded-lg shadow-md text-sm transition flex items-center"
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
          {/* Work Packages & Jobs Schedule */}
          {tender.jobs && tender.jobs.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-gov-600" />
                  Work Packages & Job Schedule ({tender.jobs.length} Jobs Available)
                </h2>
                <span className="text-[11px] text-slate-500 font-medium">Applicants can select specific jobs to quote</span>
              </div>

              <div className="space-y-3">
                {tender.jobs.map((job, idx) => (
                  <div key={job.job_id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 hover:border-gov-300 transition">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-gov-700 bg-gov-100/70 px-2 py-0.5 rounded text-[11px]">
                            {job.job_code || `JOB #${idx + 1}`}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">{job.job_name}</span>
                        </div>
                        {job.category && (
                          <span className="inline-block text-[10px] uppercase font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                            {job.category}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {job.estimated_cost ? (
                          <span className="font-extrabold text-gov-800 text-sm flex items-center">
                            <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-amber-600" />
                            ₹{job.estimated_cost.toLocaleString('en-IN')}
                          </span>
                        ) : null}
                        <span className="text-[10px] text-slate-400 block">Est. Budget</span>
                      </div>
                    </div>

                    {job.job_description && (
                      <p className="text-slate-600 text-xs leading-relaxed">{job.job_description}</p>
                    )}

                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-4 text-[11px] text-slate-600">
                      {job.estimated_quantity && (
                        <span>Quantity: <strong>{job.estimated_quantity} {job.unit || 'units'}</strong></span>
                      )}
                      {job.completion_period && (
                        <span>Period: <strong>{job.completion_period}</strong></span>
                      )}
                      <span className="text-emerald-700 font-semibold">Status: {job.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scope of Work */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gov-600" />
              Scope of Work & Technical Requirements
            </h2>
            <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {tender.scope_of_work || 'Details as per standard schedule.'}
            </div>
            {tender.background && (
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                <strong>Project Background:</strong> {tender.background}
              </div>
            )}
          </div>

          {/* Technical Elements Breakdown */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-gov-600" />
              Technical Elements & Weight Parameters
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Total Elements</span>
                <span className="text-base font-bold text-slate-900">{tender.total_elements || 'N/A'} pcs</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Element Types</span>
                <span className="text-base font-bold text-slate-900">{tender.element_types || 'N/A'} types</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Avg Weight</span>
                <span className="text-base font-bold text-slate-900">{tender.avg_weight_mt ? `${tender.avg_weight_mt} MT` : 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Min Weight</span>
                <span className="text-base font-bold text-slate-900">{tender.min_weight_mt ? `${tender.min_weight_mt} MT` : 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Max Weight</span>
                <span className="text-base font-bold text-slate-900">{tender.max_weight_mt ? `${tender.max_weight_mt} MT` : 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Completion Period</span>
                <span className="text-base font-bold text-slate-900">{tender.completion_period || 'As per agreement'}</span>
              </div>
            </div>
          </div>

          {/* Official Tender Documents */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Download className="w-5 h-5 mr-2 text-gov-600" />
              Attached RFQ Documents & Corrigenda
            </h2>
            {tender.documents && tender.documents.length > 0 ? (
              <div className="space-y-2">
                {tender.documents.map(doc => (
                  <div
                    key={doc.tender_document_id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center space-x-3 text-xs">
                      <FileText className="w-5 h-5 text-gov-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 block">{doc.file_name}</span>
                        <span className="text-slate-500">{doc.document_type} • {doc.file_size_kb || 120} KB • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-gov-50 text-gov-700 hover:bg-gov-100 font-semibold rounded text-xs transition flex items-center"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Download
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded">
                No external document attachments uploaded for this tender yet.
              </div>
            )}
          </div>

          {/* Pre-Bid Queries & Clarifications */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-gov-600" />
                Pre-Bid Clarifications & Queries ({clarifications.length})
              </div>
            </h2>

            {/* List */}
            <div className="space-y-3">
              {clarifications.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No pre-bid questions asked yet.</p>
              ) : (
                clarifications.map(c => (
                  <div key={c.clarification_id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900">Q: {c.question}</span>
                      <span className="text-[10px] text-slate-400">{new Date(c.asked_at).toLocaleDateString()}</span>
                    </div>
                    {c.answer ? (
                      <div className="p-3 bg-emerald-50 text-emerald-900 rounded border border-emerald-200">
                        <strong className="block font-bold">Chief Engineer Response:</strong>
                        <p className="mt-1">{c.answer}</p>
                      </div>
                    ) : (
                      <div className="text-amber-700 italic text-[11px]">
                        Pending CE Clarification
                        {isCE && (
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              placeholder="Type CE reply here..."
                              value={answerInput[c.clarification_id] || ''}
                              onChange={(e) => setAnswerInput({ ...answerInput, [c.clarification_id]: e.target.value })}
                              className="flex-1 px-3 py-1 text-xs border rounded focus:outline-none"
                            />
                            <button
                              onClick={() => handleAnswerQuestion(c.clarification_id)}
                              className="px-3 py-1 bg-gov-700 text-white rounded font-bold hover:bg-gov-800 text-xs"
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

            {/* Ask Query Form for Applicants */}
            {isApplicant && (
              <form onSubmit={handleAskQuestion} className="pt-4 border-t border-slate-100 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Ask a Pre-Bid Technical Query</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter your technical or procedural question..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingQ}
                    className="px-4 py-2 bg-gov-600 text-white rounded-lg font-bold text-xs hover:bg-gov-700 flex items-center"
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
          {/* EMD & Commercial Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Commercial Summary</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-amber-800 block text-[11px] font-semibold">Earnest Money Deposit (EMD)</span>
                <span className="text-xl font-extrabold text-amber-900 flex items-center mt-0.5">
                  <IndianRupee className="w-5 h-5 mr-0.5" />
                  ₹{tender.emd_amount ? tender.emd_amount.toLocaleString('en-IN') : '0'}
                </span>
                <span className="text-[10px] text-amber-700 block mt-1">Payable online via Portal / NEFT / RTGS</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Technical Bid Opening Date</span>
                <span className="font-bold text-slate-800">
                  {tender.opening_date ? new Date(tender.opening_date).toLocaleString() : 'To be notified'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Tender Inviting Authority</h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="font-bold text-slate-900">{tender.contact_person || 'Office of Chief Engineer'}</div>
              {tender.contact_phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gov-600" />
                  <span>{tender.contact_phone}</span>
                </div>
              )}
              {tender.contact_email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gov-600" />
                  <span>{tender.contact_email}</span>
                </div>
              )}
              {tender.office_address && (
                <div className="flex items-start space-x-2 pt-1">
                  <MapPin className="w-4 h-4 text-gov-600 shrink-0 mt-0.5" />
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
