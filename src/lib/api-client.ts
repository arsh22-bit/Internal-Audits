// API Client utility for making requests to the backend

class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = '/api';
    this.token = null;
    
    // Try to get token from localStorage if running in browser
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ data: T; success: boolean; error?: string }> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async register(email: string, password: string, name: string, department: string) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, department }),
    });
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me', {
      method: 'GET',
    });
  }

  logout() {
    this.setToken(null);
  }

  // Audit methods
  async getAudits(params?: {
    page?: number;
    limit?: number;
    status?: string;
    department?: string;
    auditType?: string;
    riskLevel?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/audits${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async getAudit(id: string) {
    return this.request(`/audits/${id}`, {
      method: 'GET',
    });
  }

  async createAudit(auditData: any) {
    return this.request('/audits', {
      method: 'POST',
      body: JSON.stringify(auditData),
    });
  }

  async updateAudit(id: string, auditData: any) {
    return this.request(`/audits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(auditData),
    });
  }

  async deleteAudit(id: string) {
    return this.request(`/audits/${id}`, {
      method: 'DELETE',
    });
  }
}

// Create a singleton instance
const apiClient = new ApiClient();

export default apiClient;
