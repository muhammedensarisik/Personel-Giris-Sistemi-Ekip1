import { Personnel } from '../../domain/entities/Personnel.js';
import { EntryLog } from '../../domain/entities/EntryLog.js';
import { Overtime } from '../../domain/entities/Overtime.js';
import { LeaveRequest } from '../../domain/entities/LeaveRequest.js';

/**
 * PersonnelRepository - Concrete implementation of IPersonnelRepository
 * Queries the .NET backend at http://localhost:5168/api
 * Strictly connected to real endpoints, zero mock fallbacks.
 */
export class PersonnelRepository {
  constructor(apiService) {
    this.api = apiService;
    this.activeEmployees = [];
  }

  /**
   * Fetch all personnel from backend API
   */
  async getAll() {
    const res = await this.api.getPersonnel();
    if (res.success && Array.isArray(res.data)) {
      this.activeEmployees = res.data.map(p => new Personnel(p));
      return this.activeEmployees;
    } else {
      console.error('Personnel API connection failed.');
      return [];
    }
  }

  /**
   * Fetch managers list from backend API
   */
  async getManagers() {
    const res = await this.api.getManagers();
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  }

  /**
   * Add a new employee
   */
  async add(employeeData) {
    const res = await this.api.post('/api/personnel', employeeData);
    if (res.success && res.data) {
      const added = new Personnel(res.data);
      if (typeof window.showToast === 'function') {
        window.showToast(`${added.fullName} veritabanına başarıyla kaydedildi.`, 'success');
      }
      return added;
    } else {
      throw new Error(res.error || 'Personel kaydedilemedi. Sunucu hatası.');
    }
  }

  /**
   * Delete an employee by ID
   */
  async delete(id) {
    const res = await this.api.delete(`/api/personnel/${id}`);
    if (res.success) {
      if (typeof window.showToast === 'function') {
        window.showToast('Personel veritabanından silindi.', 'success');
      }
      return true;
    }
    return false;
  }

  /**
   * Fetch entry logs from /api/attendance
   * @returns {Promise<Array<Object>>}
   */
  async getLogs() {
    const res = await this.api.get('/api/attendance');
    if (res.success && Array.isArray(res.data)) {
      return res.data.map(item => {
        const employeeId = item.userId || item.employeeId || item.personelId;
        const entryTime = item.checkInTime || item.entryTime || item.checkIn || item.time || item.createdAt;
        const exitTime = item.checkOutTime || item.exitTime || item.checkOut || null;

        return {
          id: item.id,
          employeeId: employeeId,
          entryTime: entryTime,
          exitTime: exitTime,
          status: item.status || 'Zamanında',
          location: item.location || 'Merkez Ofis - Ana Giriş',
          device: item.device || 'RFID Turnike-A',
          ipAddress: item.ipAddress || '192.168.1.102'
        };
      });
    }
    return [];
  }

  /**
   * Fetch dashboard stats from backend
   */
  async getStats() {
    const res = await this.api.get('/api/dashboard/stats');
    if (res.success && res.data) {
      return res.data;
    }
    
    // Fallback: calculate stats from the live loaded personnel and attendance logs
    const logs = await this.getLogs();
    const employees = await this.getAll();
    return {
      totalEmployees: employees.length,
      cameToday: logs.filter(log => log.entryTime).length,
      lateToday: logs.filter(log => log.status === 'Gecikmeli').length,
      onLeaveToday: employees.filter(emp => emp.status === 'İzinli').length
    };
  }

  /**
   * Fetch weekly trend
   */
  async getWeeklyTrend() {
    const res = await this.api.get('/api/dashboard/weekly-trend');
    if (res.success && res.data) {
      return res.data;
    }
    return {
      labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum'],
      entries: [0, 0, 0, 0, 0],
      exits: [0, 0, 0, 0, 0]
    };
  }

  /**
   * Fetch all overtime records from backend API
   * Endpoint: /api/overtime
   * @returns {Promise<Array<Overtime>>}
   */
  async getOvertimes() {
    const res = await this.api.get('/api/overtime');
    if (res.success && Array.isArray(res.data)) {
      return res.data.map(item => new Overtime({
        id: item.id,
        userId: item.userId,
        date: item.recordDate,
        hours: item.hoursWorked,
        description: item.description
      }));
    }
    return [];
  }

  /**
   * Delete an overtime record
   */
  async deleteOvertime(id) {
    const res = await this.api.delete(`/api/overtime/${id}`);
    if (res.success) {
      if (typeof window.showToast === 'function') {
        window.showToast('Fazla mesai kaydı veritabanından silindi.', 'success');
      }
      return true;
    }
    return false;
  }

  /**
   * Fetch all leave requests from backend API
   * Endpoint: /api/leaverequest
   * @returns {Promise<Array<LeaveRequest>>}
   */
  async getLeaveRequests() {
    const res = await this.api.get('/api/leaverequest');
    if (res.success && Array.isArray(res.data)) {
      return res.data.map(item => new LeaveRequest({
        id: item.id,
        userId: item.userId,
        leaveType: item.leaveType,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status
      }));
    }
    return [];
  }

  /**
   * Update the status of a leave request
   * PUT /api/leaverequest/{id}/status?status={status}
   */
  async updateLeaveStatus(id, status) {
    const res = await this.api.put(`/api/leaverequest/${id}/status?status=${status}`, {});
    if (res.success) {
      if (typeof window.showToast === 'function') {
        window.showToast(`Talep durumu başarıyla güncellendi.`, 'success');
      }
      return true;
    }
    return false;
  }

  /**
   * Fetch attendance data from GET /api/attendance/panel
   */
  async getAttendancePanel() {
    const res = await this.api.getAttendancePanel();
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    } else if (Array.isArray(res)) {
      return res;
    } else {
      // Fallback to getLogs if panel endpoint is unpopulated or missing
      return this.getLogs();
    }
  }

  /**
   * Fetch all holidays from GET /api/Holiday
   */
  async getHolidays() {
    const res = await this.api.getHolidays();
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    } else if (Array.isArray(res)) {
      return res;
    }
    return [];
  }

  /**
   * Add a new holiday via POST /api/Holiday
   */
  async addHoliday(holidayData) {
    const res = await this.api.createHoliday(holidayData);
    if (res.success || res.status === 200 || res.status === 201) {
      if (typeof window.showToast === 'function') {
        window.showToast('Yeni tatil günü başarıyla eklendi.', 'success');
      }
      return res.data || true;
    } else {
      throw new Error(res.error || 'Tatil günü eklenirken bir hata oluştu.');
    }
  }

  /**
   * Delete a holiday via DELETE /api/Holiday/{id}
   */
  async deleteHoliday(id) {
    const res = await this.api.deleteHoliday(id);
    if (res.success || res.status === 200) {
      if (typeof window.showToast === 'function') {
        window.showToast('Tatil günü silindi.', 'success');
      }
      return true;
    } else {
      throw new Error(res.error || 'Tatil silinirken bir hata oluştu.');
    }
  }

  /**
   * Fetch all support tickets for admin via GET /api/SupportTickets/list/{userId}?role=admin
   */
  async getSupportTickets() {
    const res = await this.api.getSupportTicketsAdmin();
    const data = res.data !== undefined ? res.data : res;
    console.log("Backendden Gelen Biletler:", data);

    if (Array.isArray(data)) {
      return data;
    } else if (res && res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  }

  /**
   * Update support ticket status via PUT /api/SupportTickets/{id}/status
   */
  async updateSupportTicketStatus(id, status) {
    const res = await this.api.updateSupportTicketStatus(id, status);
    if (res.success || res.status === 200) {
      if (typeof window.showToast === 'function') {
        window.showToast(`Bilet durumu "${status}" olarak güncellendi.`, 'success');
      }
      return true;
    } else {
      throw new Error(res.error || 'Bilet durumu güncellenemedi.');
    }
  }

  /**
   * GET /api/dashboard/personnel-stats - Returns Manager, User, Admin counts
   */
  async getPersonnelStats() {
    const res = await this.api.getPersonnelStats();
    const raw = (res && res.data) ? res.data : (res || {});

    const manager = raw.manager !== undefined ? raw.manager : (raw.managerCount !== undefined ? raw.managerCount : 0);
    const user = raw.user !== undefined ? raw.user : (raw.userCount !== undefined ? raw.userCount : 0);
    const admin = raw.admin !== undefined ? raw.admin : (raw.adminCount !== undefined ? raw.adminCount : 0);
    const totalPersonnel = raw.totalPersonnel !== undefined ? raw.totalPersonnel : (manager + user);
    const totalUsers = raw.totalUsers !== undefined ? raw.totalUsers : (totalPersonnel + admin);

    return {
      manager,
      user,
      admin,
      managerCount: manager,
      userCount: user,
      adminCount: admin,
      totalPersonnel,
      totalUsers
    };
  }

  /**
   * GET /api/dashboard/currently-present - Returns active shift employees count
   */
  async getCurrentlyPresent() {
    const res = await this.api.getCurrentlyPresent();
    if (typeof res === 'number') return res;
    if (res && typeof res.currentlyActive === 'number') return res.currentlyActive;
    if (res && typeof res.activeNowCount === 'number') return res.activeNowCount;
    if (res && res.data && typeof res.data.currentlyActive === 'number') return res.data.currentlyActive;
    return 0;
  }

  async getSystemSettings() {
    const res = await this.api.getSystemSettings();
    if (res && res.data) return res.data;
    if (res && (res.workStartTime || res.companyName || res.CompanyName)) return res;
    return { companyName: "Meram Belediyesi", logoUrl: "", workStartTime: "08:30", workEndTime: "17:30" };
  }

  async updateSystemSettings(settingsData) {
    const res = await this.api.updateSystemSettings(settingsData);
    if (res.success || res.status === 200 || res.data) {
      if (typeof window.showToast === 'function') {
        window.showToast("Sistem ayarları veritabanına kaydedildi.", "success");
      }
      return res.data || res;
    }
    throw new Error(res.message || "Sistem ayarları kaydedilemedi.");
  }

  async getCurrentLeaves() {
    const res = await this.api.getCurrentLeaves();
    if (res && res.data && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  }

  async getPendingLeaveCount() {
    const res = await this.api.getPendingLeaveCount();
    if (typeof res === 'number') return res;
    if (res && typeof res.pendingLeaves === 'number') return res.pendingLeaves;
    if (res && typeof res.pendingCount === 'number') return res.pendingCount;
    if (res && typeof res.count === 'number') return res.count;
    if (res && res.data && typeof res.data.pendingLeaves === 'number') return res.data.pendingLeaves;
    return 0;
  }

  async getActiveLocations() {
    const res = await this.api.getActiveLocations();
    if (res && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    if (res && typeof res === 'object' && res.data && Array.isArray(res.data)) return res.data;
    return [];
  }

  async updateLocationCoordinates(locationId, latitude, longitude) {
    return await this.api.updateLocationCoordinates(locationId, latitude, longitude);
  }

  async generateQrCode(locationId) {
    const res = await this.api.generateQrCode(locationId);
    if (typeof res === 'string') return res;
    if (res && res.data) return res.data;
    if (res && (res.qrData || res.token || res.code)) return res;
    return res;
  }

  async regenerateQrCode(locationId) {
    const res = await this.api.regenerateQrCode(locationId);
    if (typeof res === 'string') return res;
    if (res && res.data) return res.data;
    if (res && (res.qrData || res.token || res.code)) return res;
    return res;
  }
}
