export type UserRole = 'admin' | 'sales';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type LeadSource = 'Website' | 'Instagram' | 'Referral';
export type SortOrder = 'latest' | 'oldest';
export type Theme = 'light' | 'dark';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  notes?: string;
  assignedTo?: User;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedLeads {
  items: Lead[];
  pagination: Pagination;
}

export interface LeadFilters {
  status?: LeadStatus | '';
  source?: LeadSource | '';
  search?: string;
  sort?: SortOrder;
  page?: number;
}

export interface LeadFormData {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  notes?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface LeadStats {
  statusStats: Array<{ _id: LeadStatus; count: number }>;
  sourceStats: Array<{ _id: LeadSource; count: number }>;
  totalLeads: number;
}

export const LEAD_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
export const LEAD_SOURCES: LeadSource[] = ['Website', 'Instagram', 'Referral'];

export const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; darkBg: string }> = {
  New: { label: 'New', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100', darkBg: 'dark:bg-blue-900/30' },
  Contacted: { label: 'Contacted', color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100', darkBg: 'dark:bg-yellow-900/30' },
  Qualified: { label: 'Qualified', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100', darkBg: 'dark:bg-emerald-900/30' },
  Lost: { label: 'Lost', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100', darkBg: 'dark:bg-red-900/30' },
};

export const SOURCE_CONFIG: Record<LeadSource, { icon: string; color: string }> = {
  Website: { icon: '🌐', color: 'text-indigo-600 dark:text-indigo-400' },
  Instagram: { icon: '📸', color: 'text-pink-600 dark:text-pink-400' },
  Referral: { icon: '🤝', color: 'text-amber-600 dark:text-amber-400' },
};
