import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Phone, AlertCircle, ArrowRight } from 'lucide-react';

export default function CELogin() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginCE } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginCE(mobile, password);
      navigate('/ce/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid Chief Engineer credentials');
    } finally {
      setLoading(false);
    }
  };

  const setOfficerCreds = (mob, pwd = 'password123') => {
    setMobile(mob);
    setPassword(pwd);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-[#A7A9AC]/30 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#7A1315] text-[#CB902E] flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-[#231F20]">Officer / Departmental Login</h1>
          <p className="text-xs text-[#58595B]">Authorized access for Officers to create RFQs, evaluate quotes, and approve submissions</p>
        </div>

        {error && (
          <div className="p-3 bg-[#7A1315]/10 text-[#7A1315] rounded-lg text-xs flex items-center border border-[#7A1315]/30">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#A7A9AC]/50 focus:ring-2 focus:ring-[#CB902E] focus:outline-none font-mono bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#414042] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#58595B]" />
              <input
                type="password"
                placeholder="Enter password"
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
            className="w-full py-2.5 bg-[#7A1315] hover:bg-[#A31E22] text-white font-bold rounded-lg shadow-sm transition text-sm flex items-center justify-center"
          >
            {loading ? 'Authenticating...' : 'Sign In as Officer'}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </form>

        {/* Demo Helper / Quick Login Options */}
        <div className="pt-4 border-t border-[#FDE6D3] space-y-2">
          <span className="text-[11px] font-bold text-[#58595B] uppercase tracking-wider block text-center">
            ⚡ Quick Demo Accounts (Select to Auto-Fill):
          </span>
          <div className="grid grid-cols-1 gap-1.5 text-left text-xs">
            <button
              type="button"
              onClick={() => setOfficerCreds('9876543210')}
              className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#FDE6D3]/60 border border-[#FDE6D3] transition flex justify-between items-center text-[#231F20]"
            >
              <div>
                <strong className="block text-[11px] text-[#7A1315]">Officer 1: Er. K. V. Ramanathan</strong>
                <span className="text-[10px] text-[#58595B]">Infrastructure & Bridges (5 RFQs)</span>
              </div>
              <span className="font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-[#A7A9AC]/40">9876543210</span>
            </button>

            <button
              type="button"
              onClick={() => setOfficerCreds('9876543222')}
              className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#FDE6D3]/60 border border-[#FDE6D3] transition flex justify-between items-center text-[#231F20]"
            >
              <div>
                <strong className="block text-[11px] text-[#7A1315]">Officer 2: Er. M. S. Lakshmi Prasanna</strong>
                <span className="text-[10px] text-[#58595B]">Water & Environmental Systems (4 RFQs)</span>
              </div>
              <span className="font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-[#A7A9AC]/40">9876543222</span>
            </button>

            <button
              type="button"
              onClick={() => setOfficerCreds('9876543233')}
              className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#FDE6D3]/60 border border-[#FDE6D3] transition flex justify-between items-center text-[#231F20]"
            >
              <div>
                <strong className="block text-[11px] text-[#7A1315]">Officer 3: Er. G. Ravindra Kumar</strong>
                <span className="text-[10px] text-[#58595B]">Electrical & Automation (5 RFQs)</span>
              </div>
              <span className="font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-[#A7A9AC]/40">9876543233</span>
            </button>
          </div>

          <div className="text-center pt-2 text-[11px] text-[#58595B]">
            Password for all accounts: <code className="bg-[#FDE6D3] px-1 py-0.5 rounded text-[#7A1315] font-bold">password123</code> or <code className="bg-[#FDE6D3] px-1 py-0.5 rounded text-[#7A1315] font-bold">ce123</code>
          </div>

          <div className="text-center pt-1 text-[11px] text-[#58595B]">
            Are you a vendor / bidder? <Link to="/applicant/login" className="text-[#A31E22] font-bold hover:underline">Vendor Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
