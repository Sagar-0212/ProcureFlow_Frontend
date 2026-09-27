const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const TOKEN_KEY = 'procureflow_token';

let onUnauthorizedHandler: (() => void) | null = null;

export const setOnUnauthorizedHandler = (handler: () => void) => {
  onUnauthorizedHandler = handler;
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  status?: number;
}

export class ApiError extends Error {
  status: number;
  errorType?: string;

  constructor(status: number, message: string, errorType?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorType = errorType;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError(0, err?.message || 'Network error: Failed to connect to server at ' + API_BASE_URL);
  }

  if (response.status === 401) {
    setStoredToken(null);
    if (onUnauthorizedHandler) {
      onUnauthorizedHandler();
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    let errorType: string | undefined;

    try {
      const errorData: ApiErrorResponse = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
      errorType = errorData.error;
    } catch {
      // Non-JSON error body fallback
    }

    throw new ApiError(response.status, errorMessage, errorType);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
