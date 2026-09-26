import React from 'react';
import { Building2, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#231F20] text-[#A7A9AC] mt-20 border-t-2 border-[#7A1315]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2 text-[#FDE6D3] font-bold text-lg">
              <Building2 className="w-6 h-6 text-[#CB902E]" />
              <span>Amaravati Growth and Infrastructure Corporation Limited</span>
            </div>
            <p className="text-xs text-[#A7A9AC] leading-relaxed pr-6">
              Official e-Procurement and RFQ Portal for capital city infrastructure development projects. Ensuring transparency, competitive quotations, and rigorous technical compliance across all Non-SoR and SoR packages.
            </p>
            <div className="flex items-center space-x-2 text-[#FBB97D] text-xs font-semibold pt-2">
              <ShieldCheck className="w-4 h-4 text-[#CB902E]" />
              <span>RFQ Portal Secure Authorization & Window-Enforced</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-[#FDE6D3] text-sm font-bold uppercase tracking-wider">Helpdesk & Contact</h4>
            <div className="text-xs space-y-2 text-[#A7A9AC]">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#CB902E] shrink-0" />
                <span>+91 866 2459800 / 801</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#CB902E] shrink-0" />
                <span>rfq.infra@agic.gov.in</span>
              </div>
              <div className="flex items-start space-x-2 pt-1">
                <MapPin className="w-4 h-4 text-[#CB902E] shrink-0 mt-0.5" />
                <span>AGIC Bhavan, Sector 4, Capital Complex, Amaravati - 522503</span>
              </div>
            </div>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-[#FDE6D3] text-sm font-bold uppercase tracking-wider">Access Roles</h4>
            <ul className="text-xs space-y-1.5 text-[#A7A9AC]">
              <li>• <strong className="text-white">Vendor</strong>: Mobile verification, RFQ discovery, structured quote submission.</li>
              <li>• <strong className="text-white">Officer</strong>: RFQ creation, item breakdown, and quotation review & approval.</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#414042] mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[#58595B]">
          <div className="text-[#A7A9AC]">© {new Date().getFullYear()} Amaravati Growth and Infrastructure Corporation Limited. All rights reserved.</div>
          <div className="mt-2 sm:mt-0 font-mono text-[11px] text-[#CB902E]">Database: RFQ_DB (PostgreSQL 18) | FastAPI Backend</div>
        </div>
      </div>
    </footer>
  );
}
