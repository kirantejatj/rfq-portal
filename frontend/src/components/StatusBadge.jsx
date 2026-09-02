import React from 'react';

const statusConfig = {
  PUBLISHED: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', label: 'Published / Open' },
  DRAFT: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200', label: 'Draft' },
  CLOSED: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200', label: 'Closed' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', label: 'Cancelled' },
  SUBMITTED: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', label: 'Submitted' },
  UNDER_REVIEW: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', label: 'Under Review' },
  ACCEPTED: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', label: 'Accepted (L1 / Selected)' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', label: 'Rejected' },
  WITHDRAWN: { bg: 'bg-zinc-100', text: 'text-zinc-800', border: 'border-zinc-200', label: 'Withdrawn' },
};

export default function StatusBadge({ status, size = 'md' }) {
  const conf = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', label: status };
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center rounded-full border ${conf.bg} ${conf.text} ${conf.border} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {conf.label}
    </span>
  );
}
