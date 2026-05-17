import React from 'react';
import { Search, SlidersHorizontal, Download, X } from 'lucide-react';
import { LeadFilters, LeadStatus, LeadSource, LEAD_STATUSES, LEAD_SOURCES, SortOrder } from '../../types';
import { leadsApi } from '../../api/leads';
import toast from 'react-hot-toast';

interface LeadFiltersBarProps {
  filters: LeadFilters;
  onFiltersChange: (filters: Partial<LeadFilters>) => void;
  totalCount: number;
}

const LeadFiltersBar: React.FC<LeadFiltersBarProps> = ({ filters, onFiltersChange, totalCount }) => {
  const hasActiveFilters = Boolean(filters.status || filters.source || filters.search);

  const handleExportCSV = async () => {
    const toastId = toast.loading('Exporting leads...');
    try {
      const res = await leadsApi.exportCSV({
        status: filters.status,
        source: filters.source,
        search: filters.search,
      });
      const url = URL.createObjectURL(new Blob([res.data as BlobPart], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `gigflow-leads-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported!', { id: toastId });
    } catch {
      toast.error('Export failed', { id: toastId });
    }
  };

  const clearFilters = () => {
    onFiltersChange({ status: '', source: '', search: '', page: 1 });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search + Export row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ search: e.target.value, page: 1 })}
            placeholder="Search by name or email..."
            className="input-field pl-9"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ search: '', page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-secondary flex items-center gap-2 whitespace-nowrap"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 text-sm text-surface-500 dark:text-surface-400">
          <SlidersHorizontal size={14} />
          <span>Filters:</span>
        </div>

        {/* Status filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => onFiltersChange({ status: e.target.value as LeadStatus | '', page: 1 })}
          className="text-sm px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
        >
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Source filter */}
        <select
          value={filters.source || ''}
          onChange={(e) => onFiltersChange({ source: e.target.value as LeadSource | '', page: 1 })}
          className="text-sm px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
        >
          <option value="">All Sources</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sort || 'latest'}
          onChange={(e) => onFiltersChange({ sort: e.target.value as SortOrder, page: 1 })}
          className="text-sm px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
          >
            <X size={14} />
            Clear
          </button>
        )}

        {/* Count */}
        <span className="ml-auto text-sm text-surface-400 dark:text-surface-500">
          {totalCount} lead{totalCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

export default LeadFiltersBar;
