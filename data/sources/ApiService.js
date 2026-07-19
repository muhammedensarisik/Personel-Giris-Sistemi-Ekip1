/**
 * ApiService - Centralized class for managing backend HTTP communications
 * Base URL: http://localhost:5168
 */
export class ApiService {
  constructor(baseUrl = 'http://localhost:5168') {
    this.baseUrl = baseUrl;
  }

  /**
   * Centralized HTTP Request Handler with internal try-catch error boundary
   * @param {string} endpoint - API target path
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Structured { success, data, error, status }
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data?.message || data?.error || `HTTP Hata! Kod: ${response.status}`);
      }

      return {
        success: true,
        data: data,
        status: response.status
      };

    } catch (error) {
      console.warn(`[ApiService Info] Endpoint: ${endpoint} | Mesaj: ${error.message}`);
      
      return {
        success: false,
        error: error.message || 'Bilinmeyen bir hata oluştu.',
        data: null
      };
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}
