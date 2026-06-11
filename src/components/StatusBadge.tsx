import React from 'react';

type StatusType = 'halal' | 'haram' | 'doubtful' | 'unknown';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

const statusConfig: Record<StatusType, { bg: string; text: string; label: string }> = {
  halal: { bg: 'bg-green-100', text: 'text-green-800', label: 'Halal' },
  haram: { bg: 'bg-red-100', text: 'text-red-800', label: 'Haram' },
  doubtful: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Doubtful' },
  unknown: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unknown' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {label || config.label}
    </span>
  );
};

export default StatusBadge;
