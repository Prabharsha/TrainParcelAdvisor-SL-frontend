import { apiClient, handleApiError } from './client';
import type { LoginRequest, LoginResponse, RegisterRequest, ApiResponse, User } from '../types';

export const authApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        '/api/user/login',
        credentials
      );
      
      if (response.data.statusCode === 200 && response.data.data) {
        // Store auth data in localStorage
        const authData = response.data.data;
        if (typeof window !== 'undefined') {
          // Normalize role: strip "ROLE_" prefix if present (backend may return "ROLE_ADMIN" or "ADMIN")
          const normalizedRole = (authData.role as string)?.replace(/^ROLE_/, '') ?? authData.role;
          localStorage.setItem('authToken', authData.token);
          localStorage.setItem('refreshToken', authData.refreshToken);
          localStorage.setItem('userRole', normalizedRole as string);
          localStorage.setItem('userName', authData.userName);
          localStorage.setItem('userStation', authData.station);
          localStorage.setItem('userEmail', authData.email);
        }
        
        return authData;
      }
      
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Register new user (Admin only)
  register: async (userData: RegisterRequest): Promise<User> => {
    try {
      const response = await apiClient.post<ApiResponse<User>>(
        '/api/admin/register',
        userData
      );
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Logout
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }
  },

  // Get auth token
  getAuthToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('authToken');
  },

  // Get user role
  getUserRole: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userRole');
  },

  // Get user name
  getUserName: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userName');
  },

  // Get user station
  getUserStation: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userStation');
  },

  // Get user email
  getUserEmail: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userEmail');
  },

  // Check if user has specific role
  hasRole: (role: string): boolean => {
    return localStorage.getItem('userRole') === role;
  },

  // Check if user is admin
  isAdmin: (): boolean => {
    return localStorage.getItem('userRole') === 'ADMIN';
  },

  // Check if user is station master
  isStationMaster: (): boolean => {
    return localStorage.getItem('userRole') === 'STATION_MASTER';
  },
};
