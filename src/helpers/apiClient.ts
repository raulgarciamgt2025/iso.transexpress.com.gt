import { API_URL } from '@/configs/apiConfig';
import { getCookie } from 'cookies-next';
import { isTokenExpired } from '@/utils/tokenUtils';

// Custom error class for API errors
export class ApiError extends Error {
  public status: number;
  public response?: any;

  constructor(status: number, message: string, response?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

// Session expired error class
export class SessionExpiredError extends ApiError {
  constructor(message = 'Session expired') {
    super(401, message);
    this.name = 'SessionExpiredError';
  }
}

// Standard API response interface
export interface ApiResponse<T> {
  estado: boolean;
  mensaje: string;
  data: T;
  errores?: Record<string, string>;
}

// HTTP client configuration
interface RequestConfig extends RequestInit {
  headers?: Record<string, string>;
  skipAuthCheck?: boolean; // Skip automatic auth validation for this request
}

// Logout callback type
type LogoutCallback = () => void;

class HttpClient {
  private baseURL: string;
  private logoutCallback: LogoutCallback | null = null;
  private readonly authSessionKey = '_FLACTO_AUTH_KEY_';

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Set callback function to be called when session expires
   */
  public setLogoutCallback(callback: LogoutCallback): void {
    this.logoutCallback = callback;
  }

  private getAuthToken(): string | null {
    try {
      // Get token from authentication context (cookies)
      const sessionData = getCookie(this.authSessionKey)?.toString();
      if (!sessionData) return null;

      const parsedData = JSON.parse(sessionData);
      return parsedData.token || null;
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      return null;
    }
  }

  private validateTokenBeforeRequest(): void {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new SessionExpiredError('No authentication token found');
    }

    if (isTokenExpired(token)) {
      this.handleSessionExpired();
      throw new SessionExpiredError('Authentication token has expired');
    }
  }

  private handleSessionExpired(): void {
    console.warn('Session expired, triggering logout...');
    
    if (this.logoutCallback) {
      // Use setTimeout to avoid blocking the current execution
      setTimeout(() => {
        this.logoutCallback?.();
      }, 100);
    }
  }

  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle unauthorized responses (session expired)
    if (response.status === 401) {
      this.handleSessionExpired();
      throw new SessionExpiredError(
        data.mensaje || data.message || 'Session expired, please login again'
      );
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.mensaje || data.message || `HTTP Error: ${response.status}`,
        data
      );
    }

    return data;
  }

  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    // Validate token before making request (unless explicitly skipped)
    if (!config.skipAuthCheck) {
      this.validateTokenBeforeRequest();
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...this.getDefaultHeaders(),
      ...config.headers,
    };

    try {
      const response = await fetch(url, {
        ...config,
        headers,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError || error instanceof SessionExpiredError) {
        throw error;
      }
      
      throw new ApiError(
        0,
        error instanceof Error ? error.message : 'Network error',
        error
      );
    }
  }

  // HTTP method helpers
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    body?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Create singleton instance
export const apiClient = new HttpClient(API_URL);

// Export for use in service providers
export default apiClient;
