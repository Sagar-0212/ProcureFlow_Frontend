// Centralized API Client Layer for ProcureFlow

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'procureflow_jwt_token';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      if (data && typeof data === 'object') {
        if (data.message) {
          message = data.message;
        } else if (data.error) {
          message = data.error;
        } else if (Array.isArray(data.errors) && data.errors.length > 0) {
          message = data.errors.map((e: any) => e.defaultMessage || e.message || JSON.stringify(e)).join(', ');
        }
      } else if (typeof data === 'string' && data.trim()) {
        message = data;
      }

      if (response.status === 401) {
        setAuthToken(null);
        window.dispatchEvent(new CustomEvent('procureflow:unauthorized'));
      }

      throw new ApiError(response.status, message, data);
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or server unreachable error
    throw new ApiError(
      0,
      `Backend service unreachable at ${API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'server')}. Please check backend service.`
    );
  }
}

// REST helper methods
export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, any>) =>
    apiRequest<T>(endpoint, { method: 'GET', params }),
  post: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};
