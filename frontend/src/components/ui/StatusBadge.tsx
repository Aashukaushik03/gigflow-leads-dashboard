import React from 'react';
import { LeadStatus, STATUS_CONFIG } from '../../types';

interface StatusBadgeProps {
  status: LeadStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`badge ${config.bg} ${config.darkBg} ${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
