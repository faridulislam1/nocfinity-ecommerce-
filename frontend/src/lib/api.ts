export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '');
  }
  return (
    process.env.BACKEND_INTERNAL_URL ||
    (process.env.NEXT_PUBLIC_API_URL?.startsWith('http')
      ? process.env.NEXT_PUBLIC_API_URL
      : 'http://127.0.0.1:8000/api/v1')
  ).replace(/\/$/, '');
}

export function getCartSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
}

export function getCustomerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('customer_token');
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more_pages: boolean;
  };
  errors?: Record<string, string[]>;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit & { authType?: 'customer' | 'admin' | 'none' } = {}
): Promise<ApiResponse<T>> {
  const { authType = 'none', headers = {}, ...restOptions } = options;

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Cart-Session': getCartSessionId(),
    ...(headers as Record<string, string>),
  };

  if (authType === 'customer') {
    const token = getCustomerToken();
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }
  } else if (authType === 'admin') {
    const token = getAdminToken();
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }
  } else {
    // If none specified, check if customer token exists and attach it optionally
    const token = getCustomerToken();
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: reqHeaders,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${response.status}`,
        errors: data.errors,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Network error occurred. Please make sure the Laravel backend server is running.',
    };
  }
}

