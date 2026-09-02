import React from 'react';
import { Building2, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gov-900 text-slate-300 mt-20 border-t border-gov-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2 text-white font-bold text-lg">
              <Building2 className="w-6 h-6 text-amber-400" />
              <span>Amaravati Growth and Infrastructure Corporation Limited</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pr-6">
              Official e-Procurement and RFQ Applicant Submission Portal for capital city infrastructure development projects. Ensuring transparency, competitive quotations, and rigorous technical compliance.
            </p>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold pt-2">
              <ShieldCheck className="w-4 h-4" />
              <span>PostgreSQL Schema (v2) Role-Restricted & Window-Enforced</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider">Helpdesk & Contact</h4>
            <div className="text-xs space-y-2 text-slate-400">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+91 866 2459800 / 801</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>tenders.infra@agic.gov.in</span>
              </div>
              <div className="flex items-start space-x-2 pt-1">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>AGIC Bhavan, Sector 4, Capital Complex, Amaravati - 522503</span>
              </div>
            </div>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider">Access Roles</h4>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li>• <strong className="text-white">Applicant</strong>: Mobile verification, tender discovery, structured submission, single quotation visibility.</li>
              <li>• <strong className="text-white">Chief Engineer</strong>: Full administrative evaluation, tender publishing, and audit remarks.</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gov-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <div>© {new Date().getFullYear()} Amaravati Growth and Infrastructure Corporation Limited. All rights reserved.</div>
          <div className="mt-2 sm:mt-0 font-mono text-[11px]">Database: RFQ_DB (PostgreSQL 18) | FastAPI Backend</div>
        </div>
      </div>
    </footer>
  );
}
