import { AttendanceFilterWidget } from '../widgets/logs/AttendanceFilterWidget.js';
import { AttendanceTableWidget } from '../widgets/logs/AttendanceTableWidget.js';
import { AttendanceDetailModal } from '../widgets/logs/AttendanceDetailModal.js';

/**
 * LogsScreen (Attendance Screen) - Handles GET /api/attendance/panel
 * Pure Presentation (Dumb Component): Renders raw attendance logs sent directly by C# Backend API.
 * UI Filters: Search input by employee name, status tabs (Tümü, Aktif Mesai, Mesaisi Bitenler), Date picker.
 */
export class LogsScreen {
  constructor(personnelRepository) {
    this.repo = personnelRepository;
    
    this.allLogs = [];
    this.employees = [];
    this.filteredLogs = [];
    
    this.searchQuery = '';
    this.activeTab = 'all'; // 'all', 'inside', 'outside'
    this.selectedDate = null; // null means 'Tümü' (show all past records)

    // Instantiate modular child widgets
    this.filterWidget = new AttendanceFilterWidget(
      (tab) => this.handleTabChange(tab),
      (date) => this.handleDateChange(date),
      (query) => this.handleSearch(query)
    );

    this.tableWidget = new AttendanceTableWidget(
      (item, employees) => this.handleDetailClick(item, employees)
    );
  }

  async render(container) {
    // Reset state on screen mount
    this.searchQuery = '';
    this.activeTab = 'all';
    this.selectedDate = null;

    container.innerHTML = `
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Giriş / Çıkış Kayıtları</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">İşletmenizdeki tüm personel kart okuma, giriş-çıkış ve devamlılık kayıtları.</p>
      </div>

      <!-- Filters Widget placement -->
      <div id="attendance-filter-placement">
        ${this.filterWidget.render()}
      </div>

      <!-- Data Table Widget placement -->
      <div id="attendance-table-placement">
        ${this.tableWidget.render()}
      </div>
    `;

    // Bind event listeners
    this.filterWidget.init();

    const searchInput = document.getElementById('search-attendance-input');
    if (searchInput) searchInput.value = '';

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Load data directly from API
    await this.loadData();
  }

  async loadData() {
    this.tableWidget.showLoading();

    try {
      // Fetch raw data from GET /api/attendance/panel
      let panelData = [];
      if (typeof this.repo.getAttendancePanel === 'function') {
        panelData = await this.repo.getAttendancePanel();
      } else {
        panelData = await this.repo.getLogs();
      }

      this.allLogs = Array.isArray(panelData) ? panelData : [];
      this.employees = await this.repo.getAll();

    } catch (e) {
      console.warn("Attendance panel endpoint load error:", e);
      this.allLogs = [];
    }

    this.applyFilters();
  }

  handleSearch(query) {
    this.searchQuery = query || '';
    this.applyFilters();
  }

  handleTabChange(tab) {
    this.activeTab = tab;
    this.applyFilters();
  }

  handleDateChange(date) {
    this.selectedDate = date; // null or YYYY-MM-DD string
    this.applyFilters();
  }

  /**
   * Pure presentation UI filtering (search by name, date filter, inside/outside tabs)
   */
  applyFilters() {
    let filtered = [...this.allLogs];

    // 1. Employee Name Search Query Filter
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(log => {
        const name = log.personnelName || log.fullName || log.employeeName || '';
        return name.toLowerCase().includes(q);
      });
    }

    // 2. Date Filter (If selectedDate is null, show all history)
    if (this.selectedDate) {
      filtered = filtered.filter(log => {
        try {
          const rawTime = log.checkInTime || log.entryTime || log.checkIn || log.time;
          if (!rawTime) return false;
          const logDate = new Date(rawTime).toISOString().split('T')[0];
          return logDate === this.selectedDate;
        } catch (e) {
          return true;
        }
      });
    }

    // 3. Tab-based status filters (Inside vs Outside)
    if (this.activeTab === 'inside') {
      filtered = filtered.filter(log => {
        const checkOut = log.checkOutTime || log.exitTime || log.checkOut;
        return !checkOut || checkOut === 'null' || checkOut === '--:--' || String(checkOut).includes('0001-01-01');
      });
    } else if (this.activeTab === 'outside') {
      filtered = filtered.filter(log => {
        const checkOut = log.checkOutTime || log.exitTime || log.checkOut;
        return checkOut && checkOut !== 'null' && checkOut !== '--:--' && !String(checkOut).includes('0001-01-01');
      });
    }

    this.filteredLogs = filtered;
    this.tableWidget.update(filtered, this.employees);
  }

  /**
   * Spawns the details popup modal dynamically
   */
  handleDetailClick(item, employees) {
    const employee = employees.find(e => String(e.id || e.employeeId) === String(item.employeeId || item.userId)) || { fullName: item.personnelName || 'Bilinmeyen Personel', avatar: 'BP', role: 'Bilinmeyen', department: 'Bilinmeyen' };
    
    // Remove previous modal if exists
    const oldModal = document.getElementById('attendance-modal-overlay');
    if (oldModal) oldModal.remove();

    const detailModal = new AttendanceDetailModal();
    const modalWrapper = document.createElement('div');
    modalWrapper.innerHTML = detailModal.render(item, employee);
    
    document.body.appendChild(modalWrapper.firstElementChild);
    detailModal.init();
  }
}
