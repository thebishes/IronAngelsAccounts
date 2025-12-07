// Check if we're in development and backend might not be running
const isDev = process.env.NODE_ENV === 'development';

// Compute API base URL with flexibility:
// 1) Use REACT_APP_API_BASE_URL if set
// 2) If running in browser, prefer same-origin /api
// 3) Fallback to localhost:3001
const resolveApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}/api`;
  }

  return 'http://localhost:3001/api';
};

const API_BASE_URL = resolveApiBaseUrl();

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    console.log(`🔍 API Request: ${config.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, config);
      console.log(`📡 Response: ${response.status} ${response.statusText}`);

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        let message = `HTTP error! status: ${response.status}`;
        try {
          if (contentType.includes('application/json')) {
            const errorData = await response.json();
            if (errorData && (errorData.error || errorData.message)) {
              message = errorData.error || errorData.message;
            }
          } else {
            const text = await response.text();
            if (text) message = `${message}. Body: ${text.substring(0, 200)}`;
          }
        } catch (_) {}
        const err = new Error(message);
        err.status = response.status;
        throw err;
      }

      if (response.status === 204) return null;

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        const snippet = text ? text.substring(0, 200) : '';
        throw new Error(`Unexpected response content-type: ${contentType || 'unknown'} from ${url}. Body starts with: ${snippet}`);
      }

      const data = await response.json();
      console.log(`✅ Success:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error:`, error.message);

      if (error.name === 'TypeError' || /Failed to fetch|NetworkError/i.test(error.message)) {
        throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure it is running.`);
      }

      throw error;
    }
  }

  // Authentication
  async login(username, password) {
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  logout() {
    this.setToken(null);
    sessionStorage.removeItem('ironCleanAuth');
  }

  // Jobs
  async getJobs() {
    return await this.request('/jobs');
  }

  async createJob(jobData) {
    return await this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(jobId, jobData) {
    return await this.request(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJobByInvoice(invoiceNumber) {
    return await this.request(`/jobs/invoice/${encodeURIComponent(invoiceNumber)}`, {
      method: 'DELETE',
    });
  }

  async deleteJob(jobIdOrInvoice) {
    // Backwards compatible: if not numeric and not UUID, try invoice endpoint
    const looksUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(jobIdOrInvoice));
    const looksNumeric = /^\d+$/.test(String(jobIdOrInvoice));
    if (!looksUuid && !looksNumeric) {
      return await this.deleteJobByInvoice(String(jobIdOrInvoice));
    }
    return await this.request(`/jobs/${jobIdOrInvoice}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    try {
      // First check if the backend port is responding at all
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Backend server responded with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error.name === 'TypeError' && /Failed to fetch|NetworkError|fetch/i.test(error.message)) {
        throw new Error(`Backend server is not reachable at ${API_BASE_URL}. If using CRA proxy, ensure the backend is running and restart the frontend dev server. Otherwise, set REACT_APP_API_BASE_URL or start the backend (cd server && npm start).`);
      }
      throw error;
    }
  }
}

export default new ApiService();