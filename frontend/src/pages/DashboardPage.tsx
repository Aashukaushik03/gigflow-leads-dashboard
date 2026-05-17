import React, { useState, useCallback } from 'react';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { Lead } from '../types';
import { useLeads } from '../hooks/useLeads';
import Navbar from '../components/layout/Navbar';
import StatsBanner from '../components/dashboard/StatsBanner';
import LeadFiltersBar from '../components/leads/LeadFiltersBar';
import LeadCard from '../components/leads/LeadCard';
import LeadForm from '../components/leads/LeadForm';
import LeadDetailModal from '../components/leads/LeadDetailModal';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { leads, pagination, isLoading, error, filters, setFilters, refetch, deleteLead } = useLeads();

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = useCallback((lead: Lead) => setEditLead(lead), []);
  const handleView = useCallback((lead: Lead) => setViewLead(lead), []);
  const handleDelete = useCallback((lead: Lead) => setDeletingLead(lead), []);

  const handleFormSuccess = () => {
    setIsCreateOpen(false);
    setEditLead(null);
    refetch();
  };

  const confirmDelete = async () => {
    if (!deletingLead) return;
    setIsDeleting(true);
    await deleteLead(deletingLead._id);
    setDeletingLead(null);
    setIsDeleting(false);
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-surface-900 dark:text-white">
              Leads Dashboard
            </h1>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              className="btn-secondary p-2"
              title="Refresh"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Lead</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <StatsBanner />

        {/* Filters */}
        <div className="card p-4 mb-4">
          <LeadFiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            totalCount={pagination?.total || 0}
          />
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4 animate-fade-in">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button onClick={refetch} className="ml-auto text-xs text-red-600 hover:underline">Retry</button>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <p className="text-sm text-surface-400">Loading leads...</p>
            </div>
          </div>
        )}

        {/* Leads grid */}
        {!isLoading && !error && leads.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {leads.map((lead) => (
                <LeadCard
                  key={lead._id}
                  lead={lead}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="mt-4">
                <Pagination
                  pagination={pagination}
                  onPageChange={(page) => setFilters({ page })}
                />
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!isLoading && !error && leads.length === 0 && (
          <EmptyState
            title={filters.search || filters.status || filters.source ? 'No leads match your filters' : 'No leads yet'}
            description={
              filters.search || filters.status || filters.source
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by adding your first lead to get going!'
            }
            action={
              !filters.search && !filters.status && !filters.source ? (
                <button onClick={() => setIsCreateOpen(true)} className="btn-primary flex items-center gap-2">
                  <Plus size={16} /> Add First Lead
                </button>
              ) : undefined
            }
          />
        )}
      </main>

      {/* Create Lead Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Lead">
        <LeadForm
          onSuccess={handleFormSuccess}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Edit Lead Modal */}
      <Modal isOpen={Boolean(editLead)} onClose={() => setEditLead(null)} title="Edit Lead">
        {editLead && (
          <LeadForm
            lead={editLead}
            onSuccess={handleFormSuccess}
            onCancel={() => setEditLead(null)}
          />
        )}
      </Modal>

      {/* View Lead Modal */}
      <LeadDetailModal
        lead={viewLead}
        isOpen={Boolean(viewLead)}
        onClose={() => setViewLead(null)}
        onEdit={handleEdit}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deletingLead)}
        onClose={() => setDeletingLead(null)}
        onConfirm={confirmDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deletingLead?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DashboardPage;
