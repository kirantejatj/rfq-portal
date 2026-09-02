import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Building2, Phone, KeyRound, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ApplicantLogin() {
  const [mobile, setMobile] = useState('');
  const [loginMethod, setLoginMethod] = useState('OTP'); // 'OTP' or 'PASSWORD'
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginApplicant, verifyApplicantOTP } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/applicant/request-otp', { mobile_no: mobile, purpose: 'LOGIN' });
      setOtpSent(true);
      if (res.data.otp_debug) {
        setDebugOtp(res.data.otp_debug);
        setOtpCode(res.data.otp_debug); // Auto-fill for instant testing convenience
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyApplicantOTP(mobile, otpCode);
      navigate('/applicant/dashboard');
    } catch (err) {
      if (err.response?.status === 404) {
        // Not registered yet
        navigate('/applicant/register', { state: { mobile } });
      } else {
        setError(err.response?.data?.detail || 'Invalid OTP code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginApplicant(mobile, password);
      navigate('/applicant/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid mobile number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gov-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Applicant Portal Login</h1>
          <p className="text-xs text-slate-500">Sign in to submit quotations and track application status</p>
        </div>

        {/* Method Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setLoginMethod('OTP'); setError(''); }}
            className={`flex-1 py-1.5 rounded-md transition ${loginMethod === 'OTP' ? 'bg-white text-gov-700 shadow-sm' : 'text-slate-600'}`}
          >
            Mobile OTP Login
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod('PASSWORD'); setError(''); }}
            className={`flex-1 py-1.5 rounded-md transition ${loginMethod === 'PASSWORD' ? 'bg-white text-gov-700 shadow-sm' : 'text-slate-600'}`}
          >
            Password Login
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center border border-red-200">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loginMethod === 'OTP' ? (
          !otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Registered Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter 10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gov-600 hover:bg-gov-700 text-white font-bold rounded-lg shadow-sm transition text-sm flex items-center justify-center"
              >
                {loading ? 'Sending OTP...' : 'Send Login OTP'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs border border-emerald-200">
                <div className="flex items-center font-bold">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                  OTP sent to +91 {mobile}
                </div>
                {debugOtp && (
                  <div className="mt-1 font-mono text-[11px] text-emerald-700">
                    Test Auto-Code: <strong>{debugOtp}</strong>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Enter 6-Digit OTP</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. 123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 text-center tracking-widest font-mono text-base rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
                >
                  Change No.
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 bg-gov-600 hover:bg-gov-700 text-white font-bold rounded-lg shadow-sm transition text-sm flex items-center justify-center"
                >
                  {loading ? 'Verifying...' : 'Verify & Enter'}
                </button>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter 10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gov-600 hover:bg-gov-700 text-white font-bold rounded-lg shadow-sm transition text-sm flex items-center justify-center"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center space-y-2 text-xs">
          <div className="text-slate-600">
            First time applicant?{' '}
            <Link to="/applicant/register" className="text-gov-600 font-bold hover:underline">
              Register Firm Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
