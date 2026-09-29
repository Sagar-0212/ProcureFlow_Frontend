import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, BackendRole } from '../types/backend';
import { authService } from '../services/apiServices';
import { getAuthToken, setAuthToken } from '../services/apiClient';

interface AuthContextType {
  user: AuthUser | null;
  role: BackendRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('procureflow_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
    localStorage.removeItem('procureflow_active_user');
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getAuthToken();
      if (storedToken) {
        try {
          const remoteUser = await authService.getCurrentUser();
          setUser(remoteUser);
          localStorage.setItem('procureflow_active_user', JSON.stringify(remoteUser));
        } catch (err: any) {
          if (err?.status === 401) {
            logout();
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('procureflow:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('procureflow:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      setAuthToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      localStorage.setItem('procureflow_active_user', JSON.stringify(res.user));
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'EMPLOYEE',
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
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
