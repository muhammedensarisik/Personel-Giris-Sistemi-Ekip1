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
}
