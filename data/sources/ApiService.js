/**
 * ApiService - Centralized class for managing backend HTTP communications
 * Base URL: http://localhost:5168
 */
export class ApiService {
  constructor(baseUrl = 'http://localhost:5168') {
    this.baseUrl = baseUrl;
  }

  /**
   * Centralized HTTP Request Handler with strict method configuration
   * @param {string} endpoint - API target path (e.g., '/api/personnel')
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Structured { success, data, error, status }
   */
  async request(endpoint, options = {}) {
    // 1. Kullanıcı bilgilerini localStorage'daki 'currentUser' objesinden güvenli bir şekilde çekelim
    let currentUser = {};
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      }
    } catch (e) {
      console.warn("Kullanıcı verisi okunamadı:", e);
    }

    const userId = currentUser.id || '';
    const userRole = currentUser.role || 'User'; // Bulamazsa şimdilik 'User' saysın
    const managerId = currentUser.managerId || currentUser.manager_id || '';

    // Loglayıp görelim doğru okuyor mu?
    console.log("Gönderilen Headerlar:", {
      "X-User-Id": userId,
      "X-User-Role": userRole,
      "X-User-Manager-Id": managerId
    });

    // 2. URL temizliği
    let cleanEndpoint = (endpoint || '').toString().trim();
    if (!cleanEndpoint.startsWith('/')) {
      cleanEndpoint = '/' + cleanEndpoint;
    }
    const url = `${this.baseUrl}${cleanEndpoint}`;
    
    // 3. Metod ayarı
    const method = (options.method || 'GET').toString().toUpperCase();

    // 4. İŞTE KİLİT NOKTA: Header'ları API isteğine ENJEKTE EDİYORUZ!
    const headers = {
      'Accept': 'application/json',
      'X-User-Id': userId,
      'X-User-Role': userRole,
      'X-User-Manager-Id': managerId,
      ...options.headers
    };

    const config = {
      method: method,
      headers: headers
    };

    // 5. POST/PUT ise Body ekle
    if (method !== 'GET' && method !== 'HEAD') {
      headers['Content-Type'] = 'application/json';
      if (options.body !== undefined && options.body !== null) {
        config.body = typeof options.body === 'object' ? JSON.stringify(options.body) : options.body;
      }
    }

    // 6. İsteği Fırlat
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
      console.warn(`[ApiService Info] Method: ${method} | Endpoint: ${cleanEndpoint} | Hata: ${error.message}`);
      
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

  /**
   * Announcements API Endpoints (/api/announcement)
   */
  async getAnnouncements() {
    return this.get('/api/announcement');
  }

  async createAnnouncement(data) {
    return this.post('/api/announcement', data);
  }

  async deleteAnnouncement(id) {
    return this.delete(`/api/announcement/${id}`);
  }

  /**
   * Personnel API Endpoints (/api/personnel) - Explicit pure GET request
   */
  async getPersonnel() {
    return this.get('/api/personnel');
  }

  /**
   * Managers API Endpoint (/api/personnel/managers)
   */
  async getManagers() {
    return this.get('/api/personnel/managers');
  }

  /**
   * Audit Logs API Endpoint (/api/auditlogs)
   */
  async getAuditLogs() {
    return this.get('/api/auditlogs');
  }

  /**
   * Bulk Reports API Endpoint (/api/reports/bulk)
   */
  async getBulkReport() {
    return this.get('/api/reports/bulk');
  }

  /**
   * Dashboard Stats Endpoint (/api/dashboard/stats)
   */
  async getDashboardStats() {
    return this.get('/api/dashboard/stats');
  }

  /**
   * On Leave Today Endpoint (/api/dashboard/on-leave-today)
   */
  async getOnLeaveToday() {
    return this.get('/api/dashboard/on-leave-today');
  }

  /**
   * Dashboard Trend Endpoint (/api/dashboard/trend)
   */
  async getDashboardTrend() {
    return this.get('/api/dashboard/trend');
  }

  /**
   * Dashboard Recent Attendance Logs (/api/dashboard/recent)
   */
  async getDashboardRecent() {
    return this.get('/api/dashboard/recent');
  }

  /**
   * Dashboard Pending Leaves (/api/dashboard/pending-leaves)
   */
  async getDashboardPendingLeaves() {
    return this.get('/api/dashboard/pending-leaves');
  }

  /**
   * Update Leave Request Status Endpoint (/api/dashboard/leave/{id}/status)
   * @param {string|number} id
   * @param {string} status - 'Approved' | 'Rejected'
   */
  async updateDashboardLeaveStatus(id, status) {
    return this.put(`/api/dashboard/leave/${id}/status`, { status });
  }

  /**
   * Leave Requests API Endpoints (/api/leaverequest)
   */
  async getLeaveRequests() {
    const res = await this.get('/api/leaverequest');
    if (!res.success) {
      return this.get('/api/leaverequests');
    }
    return res;
  }

  /**
   * Update Leave Status with Admin Note (/api/leaverequest/{id}/status)
   */
  async updateLeaveStatus(id, status, adminNote = '') {
    const res = await this.put(`/api/leaverequest/${id}/status`, { status, adminNote });
    if (!res.success) {
      return this.put(`/api/leaverequests/${id}/status`, { status, adminNote });
    }
    return res;
  }
}
