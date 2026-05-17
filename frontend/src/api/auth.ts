import apiClient from './client';
import { ApiResponse, User } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'sales';
}

export interface AuthData {
  user: User;
  token: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthData>>('/auth/register', data),

  login: (data: LoginPayload) =>
    apiClient.post<ApiResponse<AuthData>>('/auth/login', data),

  getMe: () =>
    apiClient.get<ApiResponse<{ user: User }>>('/auth/me'),
};
