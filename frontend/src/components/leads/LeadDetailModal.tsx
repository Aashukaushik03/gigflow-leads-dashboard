import React from 'react';
import { Lead, SOURCE_CONFIG } from '../../types';
import Modal from '../ui/Modal';
import StatusBadge from '../ui/StatusBadge';
import { Calendar, Mail, User, FileText, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, isOpen, onClose, onEdit }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isOwner = user?._id === lead?.createdBy?._id;
  const canEdit = isAdmin || isOwner;

  if (!lead) return null;

  const sourceConfig = SOURCE_CONFIG[lead.source];
  const initials = lead.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lead Details" size="md">
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xl font-bold font-display">
            {initials}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100 font-display">
              {lead.name}
            </h3>
            <p className="text-sm text-surface-500 dark:text-surface-400">{lead.email}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          <StatusBadge status={lead.status} />
          <span className={`badge bg-surface-100 dark:bg-surface-700 ${sourceConfig.color}`}>
            {sourceConfig.icon} {lead.source}
          </span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 gap-3">
          <DetailRow icon={<Mail size={15} />} label="Email" value={lead.email} />
          <DetailRow
            icon={<Calendar size={15} />}
            label="Created"
            value={new Date(lead.createdAt).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
          <DetailRow
            icon={<User size={15} />}
            label="Created By"
            value={lead.createdBy?.name || '—'}
          />
          {lead.notes && (
            <div className="p-3 bg-surface-50 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-2 text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">
                <FileText size={13} /> Notes
              </div>
              <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="flex justify-end pt-2 border-t border-surface-200 dark:border-surface-700">
            <button
              onClick={() => { onClose(); onEdit(lead); }}
              className="btn-primary flex items-center gap-2"
            >
              <Edit2 size={15} />
              Edit Lead
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon, label, value,
}) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-500 dark:text-surface-400 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-xs text-surface-400 dark:text-surface-500">{label}</p>
      <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{value}</p>
    </div>
  </div>
);

export default LeadDetailModal;
