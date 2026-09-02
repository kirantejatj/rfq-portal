import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Phone, Mail, User, FileText, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function ApplicantRegister() {
  const location = useLocation();
  const initialMobile = location.state?.mobile || '';
  
  const [formData, setFormData] = useState({
    mobile_no: initialMobile,
    firm_name: '',
    registration_type: 'Private Limited',
    prime_line_business: 'Civil & Structural Engineering',
    chairperson_name: '',
    md_ceo_name: '',
    postal_address: '',
    email: '',
    gstin: '',
    pan_no: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerApplicant } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.firm_name.trim() || !formData.mobile_no.trim()) {
      setError('Firm name and mobile number are required');
      return;
    }
    setLoading(true);
    try {
      await registerApplicant(formData);
      navigate('/applicant/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-gov-600 bg-gov-50 px-2.5 py-1 rounded">
            <span>Official Applicant Onboarding</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Register Firm / Enterprise Profile</h1>
          <p className="text-xs text-slate-500">Create an applicant account to participate in RFQ tenders across Amaravati Infrastructure</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center border border-red-200">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Section 1: Firm Identification */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">1. Firm & Entity Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Firm / Company Name *</label>
                <input
                  type="text"
                  name="firm_name"
                  value={formData.firm_name}
                  onChange={handleChange}
                  placeholder="e.g. Acme Infra & Precast Solutions Pvt Ltd"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Registration Type</label>
                <select
                  name="registration_type"
                  value={formData.registration_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
                >
                  <option value="Private Limited">Private Limited</option>
                  <option value="Public Limited">Public Limited</option>
                  <option value="Partnership">Partnership Firm</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="LLP">Limited Liability Partnership (LLP)</option>
                  <option value="Joint Venture">Joint Venture (JV)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Prime Line of Business</label>
                <input
                  type="text"
                  name="prime_line_business"
                  value={formData.prime_line_business}
                  onChange={handleChange}
                  placeholder="e.g. Steel Structures, Precast RCC"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Statutory Tax Codes */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">2. Statutory Identifiers & Key Personnel</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="37AAAAA0000A1Z5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">PAN Number</label>
                <input
                  type="text"
                  name="pan_no"
                  value={formData.pan_no}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">MD / CEO Name</label>
                <input
                  type="text"
                  name="md_ceo_name"
                  value={formData.md_ceo_name}
                  onChange={handleChange}
                  placeholder="Managing Director Name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Chairperson Name</label>
                <input
                  type="text"
                  name="chairperson_name"
                  value={formData.chairperson_name}
                  onChange={handleChange}
                  placeholder="Chairperson Name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Auth Credentials */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">3. Login & Official Communication</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Number (Primary Login) *</label>
                <input
                  type="text"
                  name="mobile_no"
                  value={formData.mobile_no}
                  onChange={handleChange}
                  placeholder="10-digit mobile"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tenders@yourfirm.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Registered Postal Address</label>
                <textarea
                  name="postal_address"
                  rows={2}
                  value={formData.postal_address}
                  onChange={handleChange}
                  placeholder="Complete office / factory address with PIN code..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Set Account Password (Optional for Password Sign-In)</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gov-600 hover:bg-gov-700 text-white font-bold rounded-lg shadow-md transition text-sm flex items-center justify-center"
          >
            {loading ? 'Creating Account...' : 'Complete Registration & Access Portal'}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2">
          Already registered?{' '}
          <Link to="/applicant/login" className="text-gov-600 font-bold hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
