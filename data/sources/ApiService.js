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
   * Dashboard Recent Attendance Logs (/api/dashboard/recent or /api/attendance/recent)
   */
  async getDashboardRecent() {
    const res = await this.get('/api/attendance/recent');
    if (!res.success && res.status !== 200 && res.error) {
      return this.get('/api/dashboard/recent');
    }
    return res;
  }

  async getAttendanceRecent() {
    return this.getDashboardRecent();
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
   * System Settings API Endpoints (/api/systemsettings)
   */
  async getSystemSettings() {
    return this.get('/api/systemsettings');
  }

  async updateSystemSettings(settingsData) {
    return this.put('/api/systemsettings', settingsData);
  }

  /**
   * GET /api/dashboard/personnel-stats or /api/personnel-stats - Role counts breakdown (manager, user, admin)
   */
  async getPersonnelStats() {
    let res = await this.get('/api/dashboard/personnel-stats');
    if (!res || (res.success === false && !res.manager && !res.data)) {
      const fallback = await this.get('/api/personnel-stats');
      if (fallback && (fallback.manager !== undefined || fallback.data || fallback.success)) {
        res = fallback;
      }
    }
    return res;
  }

  /**
   * GET /api/Location/active - Returns active institution locations directly from backend
   */
  async getActiveLocations() {
    let res = await this.get('/api/Location/active');
    if (!res || (res.success === false && !Array.isArray(res) && !res.data)) {
      const fallback = await this.get('/api/locations/active');
      if (fallback && (fallback.success !== false || Array.isArray(fallback) || fallback.data)) {
        res = fallback;
      }
    }
    return res;
  }

  /**
   * PUT /api/Location/update-coordinates/{locationId} - Updates GPS coordinates for location
   * @param {string|number} locationId
   * @param {number} latitude
   * @param {number} longitude
   */
  async updateLocationCoordinates(locationId, latitude, longitude) {
    let res = await this.put(`/api/Location/update-coordinates/${locationId}`, {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    });
    if (!res || res.success === false) {
      const fallback = await this.put(`/api/location/update-coordinates/${locationId}`, {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      });
      if (fallback && fallback.success !== false) {
        res = fallback;
      }
    }
    return res;
  }

  /**
   * POST /api/QrAttendance/generate/{locationId} - Generates dynamic QR data token for location
   * @param {string|number} locationId
   */
  async generateQrCode(locationId) {
    let res = await this.post(`/api/QrAttendance/generate/${locationId}`, {});
    if (!res || (res.success === false && !res.qrData && !res.token && !res.code && typeof res !== 'string')) {
      const getRes = await this.get(`/api/QrAttendance/generate/${locationId}`);
      if (getRes && (getRes.success !== false || typeof getRes === 'string' || getRes.qrData || getRes.token || getRes.code)) {
        res = getRes;
      } else {
        const fallback = await this.post(`/api/qr/generate/${locationId}`, {});
        if (fallback && (fallback.success || fallback.qrData || fallback.token || fallback.code || typeof fallback === 'string')) {
          res = fallback;
        }
      }
    }
    return res;
  }

  /**
   * POST /api/QrAttendance/regenerate/{locationId} - Force regenerates and invalidates old QR tokens
   * @param {string|number} locationId
   */
  async regenerateQrCode(locationId) {
    let res = await this.post(`/api/QrAttendance/regenerate/${locationId}`, {});
    if (!res || (res.success === false && !res.qrData && !res.token && !res.code && typeof res !== 'string')) {
      const fallback = await this.post(`/api/qr/regenerate/${locationId}`, {});
      if (fallback && (fallback.success || fallback.qrData || fallback.token || fallback.code || typeof fallback === 'string')) {
        res = fallback;
      }
    }
    return res;
  }

  /**
   * GET /api/dashboard/currently-present - Active shift employees count
   */
  async getCurrentlyPresent() {
    const res = await this.get('/api/dashboard/currently-present');
    if (!res.success && res.status !== 200 && res.error) {
      return this.get('/api/dashboard/stats');
    }
    return res;
  }

  /**
   * GET /api/leaves/current - List of personnel currently on leave
   */
  async getCurrentLeaves() {
    const res = await this.get('/api/leaves/current');
    if (!res.success && res.status !== 200 && res.error) {
      return this.get('/api/dashboard/on-leave-today');
    }
    return res;
  }

  /**
   * GET /api/leaves/pending-count - Count of pending leave requests
   */
  async getPendingLeaveCount() {
    const res = await this.get('/api/leaves/pending-count');
    if (!res.success && res.status !== 200 && res.error) {
      return this.get('/api/dashboard/stats');
    }
    return res;
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

  /**
   * GET /api/attendance/panel - Attendance panel data with X-User-Id and X-User-Role headers
   */
  async getAttendancePanel() {
    return this.get('/api/attendance/panel');
  }

  /**
   * Holiday API Endpoints (/api/Holiday)
   */
  async getHolidays() {
    const res = await this.get('/api/Holiday');
    if (!res.success) {
      return this.get('/api/holiday');
    }
    return res;
  }

  async createHoliday(data) {
    const res = await this.post('/api/Holiday', data);
    if (!res.success) {
      return this.post('/api/holiday', data);
    }
    return res;
  }

  async deleteHoliday(id) {
    const res = await this.delete(`/api/Holiday/${id}`);
    if (!res.success) {
      return this.delete(`/api/holiday/${id}`);
    }
    return res;
  }

  /**
   * Support Tickets Admin API Endpoints (/api/SupportTickets)
   */
  async getSupportTicketsAdmin() {
    let userId = '1';
    let userRole = 'admin';
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user.id || user.userId || user.Id || user.UserId || '1';
        userRole = user.role || user.Role || 'admin';
      }
    } catch (e) {}

    // Primary requested endpoint: GET /api/SupportTickets/list/{userId}?role={userRole}
    let res = await this.get(`/api/SupportTickets/list/${userId}?role=${encodeURIComponent(userRole)}`);
    
    if (!res.success) {
      // Fallback 1: lowercase /api/supporttickets/list/{userId}?role={userRole}
      res = await this.get(`/api/supporttickets/list/${userId}?role=${encodeURIComponent(userRole)}`);
    }

    if (!res.success) {
      // Fallback 2: GET /api/SupportTickets/admin/all
      res = await this.get('/api/SupportTickets/admin/all');
    }

    if (!res.success) {
      // Fallback 3: lowercase /api/supporttickets/admin/all
      res = await this.get('/api/supporttickets/admin/all');
    }

    console.log("Backendden Gelen Biletler:", res.data !== undefined ? res.data : res);
    return res;
  }

  async updateSupportTicketStatus(id, status) {
    const res = await this.put(`/api/SupportTickets/${id}/status`, { status });
    if (!res.success) {
      const fallback = await this.put(`/api/supporttickets/${id}/status`, { status });
      if (!fallback.success) {
        return this.put(`/api/SupportTickets/${id}/status`, typeof status === 'string' ? JSON.stringify(status) : status);
      }
      return fallback;
    }
    return res;
  }
}
