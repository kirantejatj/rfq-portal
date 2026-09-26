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
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-[#A7A9AC]/30 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#7A1315] text-[#CB902E] flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-[#231F20]">Vendor Portal Login</h1>
          <p className="text-xs text-[#58595B]">Sign in to participate in RFQs, submit quotations, and track quotation status</p>
        </div>

        {/* Method Toggle */}
        <div className="flex bg-[#FAF8F5] p-1 rounded-lg text-xs font-bold border border-[#FDE6D3]">
          <button
            type="button"
            onClick={() => { setLoginMethod('OTP'); setError(''); }}
            className={`flex-1 py-1.5 rounded-md transition ${loginMethod === 'OTP' ? 'bg-[#7A1315] text-white shadow-sm' : 'text-[#58595B] hover:text-[#231F20]'}`}
          >
            Mobile OTP Login
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod('PASSWORD'); setError(''); }}
            className={`flex-1 py-1.5 rounded-md transition ${loginMethod === 'PASSWORD' ? 'bg-[#7A1315] text-white shadow-sm' : 'text-[#58595B] hover:text-[#231F20]'}`}
          >
            Password Login
          </button>
        </div>

        {error && (
          <div className="p-3 bg-[#7A1315]/10 text-[#7A1315] rounded-lg text-xs flex items-center border border-[#7A1315]/30">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loginMethod === 'OTP' ? (
          !otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#414042] block mb-1">Registered Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-[#58595B]" />
                  <input
                    type="text"
                    placeholder="Enter 10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#A7A9AC]/50 focus:ring-2 focus:ring-[#CB902E] focus:outline-none bg-[#FAF8F5] font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#A31E22] hover:bg-[#7A1315] text-white font-bold rounded-lg shadow-sm transition text-sm flex items-center justify-center"
              >
                {loading ? 'Sending OTP...' : 'Send Login OTP'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg text-xs border border-emerald-200">
                <div className="flex items-center font-bold">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                  OTP sent to +91 {mobile}
                </div>
                {debugOtp && (
                  <div className="mt-1 font-mono text-[11px] text-emerald-700 font-bold">
                    Test Auto-Code: <strong>{debugOtp}</strong>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-[#414042] block mb-1">Enter 6-Digit OTP</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-[#58595B]" />
                  <input
                    type="text"
                    placeholder="e.g. 123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 text-center tracking-widest font-mono text-base font-bold rounded-lg border border-[#A7A9AC]/50 focus:ring-2 focus:ring-[#CB902E] focus:outline-none bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-1/3 py-2.5 bg-[#FAF8F5] hover:bg-[#FDE6D3] text-[#414042] font-semibold rounded-lg text-xs transition border border-[#A7A9AC]/30"
                >
                  Change No.
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 bg-[#A31E22] hover:bg-[#7A1315] text-white font-bold rounded-lg shadow-sm transition text-sm flex items-center justify-center"
                >
                  {loading ? 'Verifying...' : 'Verify & Enter'}
                </button>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#414042] block mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-[#58595B]" />
                <input
                  type="text"
                  placeholder="Enter 10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#A7A9AC]/50 focus:ring-2 focus:ring-[#CB902E] focus:outline-none bg-[#FAF8F5] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#414042] block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#58595B]" />
                <input
                  type="password"
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#A7A9AC]/50 focus:ring-2 focus:ring-[#CB902E] focus:outline-none bg-[#FAF8F5]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#A31E22] hover:bg-[#7A1315] text-white font-bold rounded-lg shadow-sm transition text-sm flex items-center justify-center"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#FDE6D3] space-y-3 text-xs">
          <span className="text-[11px] font-bold text-[#58595B] uppercase tracking-wider block text-center">
            ⚡ Quick Demo Accounts (Select to Auto-Fill):
          </span>
          <div className="grid grid-cols-1 gap-1.5 text-left text-xs">
            <button
              type="button"
              onClick={() => { setMobile('9111222333'); setPassword('password123'); setLoginMethod('PASSWORD'); setError(''); }}
              className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#FDE6D3]/60 border border-[#FDE6D3] transition flex justify-between items-center text-[#231F20]"
            >
              <div>
                <strong className="block text-[11px] text-[#7A1315]">Vendor 1: Apex Heavy Engineering</strong>
                <span className="text-[10px] text-[#58595B]">Manufacturer (Heavy Steel & Girders)</span>
              </div>
              <span className="font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-[#A7A9AC]/40">9111222333</span>
            </button>

            <button
              type="button"
              onClick={() => { setMobile('9222333444'); setPassword('password123'); setLoginMethod('PASSWORD'); setError(''); }}
              className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#FDE6D3]/60 border border-[#FDE6D3] transition flex justify-between items-center text-[#231F20]"
            >
              <div>
                <strong className="block text-[11px] text-[#7A1315]">Vendor 2: Godavari Flow & Hydro Controls</strong>
                <span className="text-[10px] text-[#58595B]">Authorised Dealer (Pumps & Valves)</span>
              </div>
              <span className="font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-[#A7A9AC]/40">9222333444</span>
            </button>

            <button
              type="button"
              onClick={() => { setMobile('9333444555'); setPassword('password123'); setLoginMethod('PASSWORD'); setError(''); }}
              className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#FDE6D3]/60 border border-[#FDE6D3] transition flex justify-between items-center text-[#231F20]"
            >
              <div>
                <strong className="block text-[11px] text-[#7A1315]">Vendor 3: Amaravati Premier Infra Contractors</strong>
                <span className="text-[10px] text-[#58595B]">Contractor (Civil & Precast Works)</span>
              </div>
              <span className="font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-[#A7A9AC]/40">9333444555</span>
            </button>

            <button
              type="button"
              onClick={() => { setMobile('9444555666'); setPassword('password123'); setLoginMethod('PASSWORD'); setError(''); }}
              className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#FDE6D3]/60 border border-[#FDE6D3] transition flex justify-between items-center text-[#231F20]"
            >
              <div>
                <strong className="block text-[11px] text-[#7A1315]">Vendor 4: VoltMatrix Electrical & Power</strong>
                <span className="text-[10px] text-[#58595B]">Authorised Distributor (Substations & Cables)</span>
              </div>
              <span className="font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-[#A7A9AC]/40">9444555666</span>
            </button>

            <button
              type="button"
              onClick={() => { setMobile('9555666777'); setPassword('password123'); setLoginMethod('PASSWORD'); setError(''); }}
              className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#FDE6D3]/60 border border-[#FDE6D3] transition flex justify-between items-center text-[#231F20]"
            >
              <div>
                <strong className="block text-[11px] text-[#7A1315]">Vendor 5: Southern Precision Valves</strong>
                <span className="text-[10px] text-[#58595B]">Manufacturer (Precision Valves & Sluice Gates)</span>
              </div>
              <span className="font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-[#A7A9AC]/40">9555666777</span>
            </button>
          </div>

          <div className="text-center pt-1 text-[11px] text-[#58595B]">
            Password for all accounts: <code className="bg-[#FDE6D3] px-1 py-0.5 rounded text-[#7A1315] font-bold">password123</code> or <code className="bg-[#FDE6D3] px-1 py-0.5 rounded text-[#7A1315] font-bold">app123</code>
          </div>

          <div className="text-center text-[#58595B] pt-2 border-t border-[#FDE6D3]">
            First time vendor / bidder?{' '}
            <Link to="/applicant/register" className="text-[#A31E22] font-bold hover:underline">
              Register Vendor Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
