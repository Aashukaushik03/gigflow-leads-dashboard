import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';
import { Lead, SOURCE_CONFIG } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onView: (lead: Lead) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onEdit, onDelete, onView }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const isOwner = user?._id === lead.createdBy?._id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isAdmin || isOwner;

  const sourceConfig = SOURCE_CONFIG[lead.source];
  const initials = lead.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="card p-4 hover:shadow-md transition-all duration-200 animate-fade-in group">
      <div className="flex items-start justify-between gap-3">
        {/* Avatar + Info */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold font-display">
            {initials}
          </div>
          <div className="min-w-0">
            <button
              onClick={() => onView(lead)}
              className="text-sm font-semibold text-surface-800 dark:text-surface-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left truncate block max-w-[160px] sm:max-w-[220px]"
            >
              {lead.name}
            </button>
            <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{lead.email}</p>
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 card shadow-lg z-20 py-1 animate-slide-up">
                <button
                  onClick={() => { onView(lead); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                >
                  <Eye size={14} /> View Details
                </button>
                {canEdit && (
                  <button
                    onClick={() => { onEdit(lead); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => { onDelete(lead); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Badges + date */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <StatusBadge status={lead.status} />
        <span className={`badge bg-surface-100 dark:bg-surface-700 ${sourceConfig.color}`}>
          {sourceConfig.icon} {lead.source}
        </span>
        <span className="ml-auto text-xs text-surface-400 dark:text-surface-500">
          {formatDate(lead.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default LeadCard;
