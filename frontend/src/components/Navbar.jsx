import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, FileText, FileCheck, User, LogOut, PlusCircle, LayoutDashboard, Shield, Send, Terminal } from 'lucide-react';

export default function Navbar() {
  const { user, isCE, isApplicant, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-[#A7A9AC]/30 sticky top-0 z-50 shadow-sm">
      {/* Top Govt Bar: Black #231F20 with Gold and Light Peach text */}
      <div className="bg-[#231F20] text-[#FDE6D3] text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center border-b border-[#414042]">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-[#CB902E] tracking-wide">Government of Andhra Pradesh</span>
          <span className="text-[#58595B]">|</span>
          <span className="hidden sm:inline text-slate-200">Amaravati Growth and Infrastructure Corporation Limited (AGIC)</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-300">
          <span className="hidden md:inline text-[11px] text-[#A7A9AC]">e-Procurement Portal (v2.0)</span>
          <span className="bg-[#CB902E]/20 text-[#FBB97D] border border-[#CB902E]/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider">
            SECURE RFQ SYSTEM
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#7A1315] flex items-center justify-center text-[#CB902E] shadow-md group-hover:bg-[#A31E22] transition">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-black text-[#7A1315] leading-tight tracking-tight">RFQ Portal</div>
            <div className="text-xs text-[#58595B] font-medium">Officer & Vendor Quotation Management</div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-2 sm:space-x-3">
          <Link
            to="/"
            className="text-xs sm:text-sm font-semibold text-[#414042] hover:text-[#7A1315] px-3 py-2 rounded-lg hover:bg-[#FDE6D3]/40 transition"
          >
            Quotations / RFQs
          </Link>

          {/* Officer Specific Navigation */}
          {isCE && (
            <>
              <Link
                to="/ce/approved-non-sor-items"
                className="flex items-center text-xs font-extrabold text-[#231F20] bg-gradient-to-r from-[#CB902E] via-[#FBB97D] to-[#CB902E] hover:from-[#B07B23] hover:to-[#CA6E28] hover:text-white px-3 py-2 rounded-lg shadow-sm transition border border-[#67491C]/30 tracking-wide uppercase"
                title="View Official Minutes & 24 Approved Non-SOR Items Schedule"
              >
                <FileCheck className="w-4 h-4 mr-1.5" />
                APPROVED NON SOR ITEMS
              </Link>
              <Link
                to="/ce/dashboard"
                className="flex items-center text-xs sm:text-sm font-semibold text-[#7A1315] hover:text-[#A31E22] bg-[#FDE6D3]/60 hover:bg-[#FDE6D3] px-3 py-2 rounded-lg border border-[#FBB97D]/50 transition"
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                Officer Dashboard
              </Link>
              <Link
                to="/ce/tenders/create"
                className="flex items-center text-xs sm:text-sm font-bold text-white bg-[#A31E22] hover:bg-[#7A1315] px-3.5 py-2 rounded-lg shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4 mr-1.5 text-[#FBB97D]" />
                Raise New RFQ
              </Link>
            </>
          )}

          {/* Vendor Specific Navigation */}
          {isApplicant && (
            <>
              <Link
                to="/applicant/dashboard"
                className="flex items-center text-xs sm:text-sm font-semibold text-[#414042] hover:text-[#7A1315] px-3 py-2 rounded-lg hover:bg-[#FDE6D3]/40 transition"
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                Vendor Dashboard
              </Link>
              <Link
                to="/applicant/my-applications"
                className="flex items-center text-xs sm:text-sm font-bold text-[#7A1315] bg-[#FDE6D3]/60 hover:bg-[#FDE6D3] px-3 py-2 rounded-lg border border-[#FBB97D]/50 transition"
              >
                <FileText className="w-4 h-4 mr-1.5" />
                My Quotations
              </Link>
            </>
          )}

          {/* Auth State & User Menu */}
          {user ? (
            <div className="flex items-center pl-3 border-l border-[#A7A9AC]/40 space-x-3">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-[#231F20] truncate max-w-[160px]">{user.name}</div>
                <div className="text-[10px] text-[#58595B] font-mono font-semibold uppercase">
                  {isCE ? 'Officer' : 'Vendor'} • {user.mobile}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-[#58595B] hover:text-[#A31E22] hover:bg-[#FDE6D3]/50 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pl-2 border-l border-[#A7A9AC]/40">
              <Link
                to="/applicant/login"
                className="text-xs font-bold text-[#414042] hover:text-[#7A1315] px-3 py-2 rounded-lg border border-[#A7A9AC] hover:border-[#CB902E] hover:bg-[#FDE6D3]/30 transition"
              >
                Vendor Login
              </Link>
              <Link
                to="/ce/login"
                className="flex items-center text-xs font-bold text-white bg-[#7A1315] hover:bg-[#A31E22] px-3 py-2 rounded-lg shadow-sm transition"
              >
                <Shield className="w-3.5 h-3.5 mr-1 text-[#CB902E]" />
                Officer Login
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
