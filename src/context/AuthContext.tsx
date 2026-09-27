import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { authService, BackendUserResponse, LoginRequest } from '../services/authService';
import { getStoredToken, setStoredToken, setOnUnauthorizedHandler } from '../services/api';

export function mapBackendUserToUser(bu: BackendUserResponse): User {
  return {
    id: String(bu.id),
    name: `${bu.firstName} ${bu.lastName}`.trim(),
    email: bu.email,
    role: bu.role,
    departmentId: bu.departmentName ? bu.departmentName.toLowerCase().replace(/\s+/g, '-') : 'dept-1',
    departmentName: bu.departmentName || 'General',
    employeeCode: bu.employeeCode,
  };
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
    setRole(null);
    setError(null);
  }, []);

  // Register 401 interceptor callback
  useEffect(() => {
    setOnUnauthorizedHandler(() => {
      logout();
    });
  }, [logout]);

  // Load current user profile on initial mount if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const backendUser = await authService.getCurrentUser();
        const mappedUser = mapBackendUserToUser(backendUser);
        setUser(mappedUser);
        setRole(mappedUser.role);
        setToken(storedToken);
      } catch (err: any) {
        console.error('Failed to fetch user profile:', err);
        setStoredToken(null);
        setToken(null);
        setUser(null);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      setStoredToken(response.accessToken);
      setToken(response.accessToken);

      const mappedUser = mapBackendUserToUser(response.user);
      setUser(mappedUser);
      setRole(mappedUser.role);
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please verify your email and password.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
