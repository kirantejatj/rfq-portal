import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, FileText, User, LogOut, PlusCircle, LayoutDashboard, Shield, Send } from 'lucide-react';

export default function Navbar() {
  const { user, isCE, isApplicant, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      {/* Top Govt Bar */}
      <div className="bg-gov-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white tracking-wide">Government of Andhra Pradesh</span>
          <span className="text-slate-500">|</span>
          <span className="hidden sm:inline">Amaravati Growth and Infrastructure Corporation Limited (AGIC)</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-400">
          <span>e-Procurement Portal (v2.0)</span>
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded text-[10px] font-mono">
            SECURE RFQ SYSTEM
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-lg bg-gov-800 flex items-center justify-center text-amber-400 shadow-md group-hover:bg-gov-700 transition">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-bold text-gov-900 leading-tight">RFQ Submission Portal</div>
            <div className="text-xs text-slate-500 font-medium">Chief Engineer & Applicant Quotation Management</div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-2 sm:space-x-4">
          <Link
            to="/"
            className="text-sm font-medium text-slate-700 hover:text-gov-600 px-3 py-2 rounded-md hover:bg-slate-100 transition"
          >
            Tenders
          </Link>

          {/* CE Specific Navigation */}
          {isCE && (
            <>
              <Link
                to="/ce/dashboard"
                className="flex items-center text-sm font-medium text-gov-700 hover:text-gov-800 bg-gov-50 hover:bg-gov-100 px-3 py-2 rounded-md transition"
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                CE Dashboard
              </Link>
              <Link
                to="/ce/tenders/create"
                className="flex items-center text-sm font-medium text-white bg-gov-600 hover:bg-gov-700 px-3.5 py-2 rounded-md shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Raise New Tender
              </Link>
            </>
          )}

          {/* Applicant Specific Navigation */}
          {isApplicant && (
            <>
              <Link
                to="/applicant/dashboard"
                className="flex items-center text-sm font-medium text-slate-700 hover:text-gov-600 px-3 py-2 rounded-md hover:bg-slate-100 transition"
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                Dashboard
              </Link>
              <Link
                to="/applicant/my-applications"
                className="flex items-center text-sm font-medium text-gov-700 bg-gov-50 hover:bg-gov-100 px-3 py-2 rounded-md transition"
              >
                <FileText className="w-4 h-4 mr-1.5" />
                My Quotations
              </Link>
            </>
          )}

          {/* Auth State & User Menu */}
          {user ? (
            <div className="flex items-center pl-3 border-l border-slate-200 space-x-3">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-slate-800 truncate max-w-[160px]">{user.name}</div>
                <div className="text-[10px] text-slate-500 font-mono font-medium uppercase">
                  {isCE ? 'Chief Engineer' : 'Applicant'} • {user.mobile}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <Link
                to="/applicant/login"
                className="text-xs font-semibold text-slate-700 hover:text-gov-600 px-3 py-2 rounded-md border border-slate-300 hover:border-gov-500 transition"
              >
                Applicant Login
              </Link>
              <Link
                to="/ce/login"
                className="flex items-center text-xs font-semibold text-white bg-gov-800 hover:bg-gov-900 px-3 py-2 rounded-md shadow-sm transition"
              >
                <Shield className="w-3.5 h-3.5 mr-1 text-amber-400" />
                CE Portal
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
