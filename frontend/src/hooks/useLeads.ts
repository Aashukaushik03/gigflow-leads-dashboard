import { useState, useEffect, useCallback, useRef } from 'react';
import { Lead, LeadFilters, Pagination } from '../types';
import { leadsApi } from '../api/leads';
import toast from 'react-hot-toast';

interface UseLeadsReturn {
  leads: Lead[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  filters: LeadFilters;
  setFilters: (filters: Partial<LeadFilters>) => void;
  refetch: () => void;
  deleteLead: (id: string) => Promise<void>;
}

const DEBOUNCE_MS = 400;

export const useLeads = (): UseLeadsReturn => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<LeadFilters>({
    sort: 'latest',
    page: 1,
  });

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const fetchLeads = useCallback(async (currentFilters: LeadFilters) => {
    // Cancel previous request
    if (abortController.current) abortController.current.abort();
    abortController.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const res = await leadsApi.getLeads(currentFilters);
      if (res.data.success && res.data.data) {
        setLeads(res.data.data.items);
        setPagination(res.data.data.pagination);
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'CanceledError') return;
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to fetch leads';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search, immediate for non-search filter changes
  const setFilters = useCallback(
    (newFilters: Partial<LeadFilters>) => {
      setFiltersState((prev) => {
        const updated = { ...prev, ...newFilters, page: newFilters.page ?? 1 };

        if ('search' in newFilters) {
          // Debounce search
          if (debounceTimer.current) clearTimeout(debounceTimer.current);
          debounceTimer.current = setTimeout(() => {
            fetchLeads(updated);
          }, DEBOUNCE_MS);
        } else {
          fetchLeads(updated);
        }

        return updated;
      });
    },
    [fetchLeads]
  );

  const refetch = useCallback(() => {
    fetchLeads(filters);
  }, [fetchLeads, filters]);

  const deleteLead = useCallback(
    async (id: string) => {
      try {
        await leadsApi.deleteLead(id);
        toast.success('Lead deleted');
        refetch();
      } catch {
        toast.error('Failed to delete lead');
      }
    },
    [refetch]
  );

  // Initial fetch
  useEffect(() => {
    fetchLeads(filters);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { leads, pagination, isLoading, error, filters, setFilters, refetch, deleteLead };
};
