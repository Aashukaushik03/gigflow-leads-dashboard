import apiClient from './client';
import { ApiResponse, Lead, LeadFilters, LeadFormData, PaginatedLeads, LeadStats } from '../types';

export const leadsApi = {
  getLeads: (filters: LeadFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.page) params.set('page', String(filters.page));
    return apiClient.get<ApiResponse<PaginatedLeads>>(`/leads?${params}`);
  },

  getLead: (id: string) =>
    apiClient.get<ApiResponse<{ lead: Lead }>>(`/leads/${id}`),

  createLead: (data: LeadFormData) =>
    apiClient.post<ApiResponse<{ lead: Lead }>>('/leads', data),

  updateLead: (id: string, data: Partial<LeadFormData>) =>
    apiClient.put<ApiResponse<{ lead: Lead }>>(`/leads/${id}`, data),

  deleteLead: (id: string) =>
    apiClient.delete<ApiResponse>(`/leads/${id}`),

  exportCSV: (filters: LeadFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);
    return apiClient.get(`/leads/export/csv?${params}`, { responseType: 'blob' });
  },

  getStats: () =>
    apiClient.get<ApiResponse<LeadStats>>('/leads/stats'),
};
