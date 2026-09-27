import { apiRequest } from './api';
import { UserRole } from '../types';

export interface BackendUserResponse {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  departmentName?: string;
  active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: BackendUserResponse;
}

export const authService = {
  /**
   * POST /api/auth/login
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * GET /api/auth/me
   */
  getCurrentUser: async (): Promise<BackendUserResponse> => {
    return apiRequest<BackendUserResponse>('/api/auth/me', {
      method: 'GET',
    });
  },
};
