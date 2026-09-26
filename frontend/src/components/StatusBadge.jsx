import React from 'react';

const statusConfig = {
  PUBLISHED: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300', label: 'Published / Open' },
  DRAFT: { bg: 'bg-[#A7A9AC]/20', text: 'text-[#414042]', border: 'border-[#A7A9AC]', label: 'Draft' },
  CLOSED: { bg: 'bg-[#A31E22]/10', text: 'text-[#7A1315]', border: 'border-[#A31E22]/30', label: 'Closed' },
  CANCELLED: { bg: 'bg-[#58595B]/15', text: 'text-[#414042]', border: 'border-[#58595B]/30', label: 'Cancelled' },
  SUBMITTED: { bg: 'bg-[#0E2C49]/10', text: 'text-[#0E2C49]', border: 'border-[#0E2C49]/30', label: 'Submitted' },
  UNDER_REVIEW: { bg: 'bg-[#FDE6D3]', text: 'text-[#67491C]', border: 'border-[#CB902E]/50', label: 'Under Review' },
  ACCEPTED: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-400', label: 'Accepted (L1 / Selected)' },
  REJECTED: { bg: 'bg-[#7A1315]/10', text: 'text-[#7A1315]', border: 'border-[#7A1315]/30', label: 'Rejected' },
  WITHDRAWN: { bg: 'bg-[#58595B]/15', text: 'text-[#58595B]', border: 'border-[#58595B]/30', label: 'Withdrawn' },
};

export default function StatusBadge({ status, size = 'md' }) {
  const conf = statusConfig[status] || { bg: 'bg-[#A7A9AC]/20', text: 'text-[#414042]', border: 'border-[#A7A9AC]', label: status };
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs font-bold';

  return (
    <span className={`inline-flex items-center rounded-full border ${conf.bg} ${conf.text} ${conf.border} ${sizeClasses} shadow-xs`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-80"></span>
      {conf.label}
    </span>
  );
}
