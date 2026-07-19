import { AttendanceFilterWidget } from '../widgets/logs/AttendanceFilterWidget.js';
import { AttendanceTableWidget } from '../widgets/logs/AttendanceTableWidget.js';
import { AttendanceDetailModal } from '../widgets/logs/AttendanceDetailModal.js';

/**
 * LogsScreen (Attendance Screen) - Integrates search tabs, Data Tables, and Detail Popups.
 */
export class LogsScreen {
  constructor(personnelRepository) {
    this.repo = personnelRepository;
    
    this.allLogs = [];
    this.employees = [];
    this.filteredLogs = [];
    
    this.activeTab = 'all'; // 'all', 'inside', 'outside'
    this.selectedDate = new Date().toISOString().split('T')[0]; // Current YYYY-MM-DD

    // Instantiate modular child widgets
    this.filterWidget = new AttendanceFilterWidget(
      (tab) => this.handleTabChange(tab),
      (date) => this.handleDateChange(date)
    );

    this.tableWidget = new AttendanceTableWidget(
      (item, employees) => this.handleDetailClick(item, employees)
    );
  }

  async render(container) {
    container.innerHTML = `
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Giriş / Çıkış Kayıtları</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Bugün yapılan tüm kart okuma, gecikme ve izin kayıtları listesi.</p>
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

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Load data and render rows
    await this.loadData();
  }

  async loadData() {
    this.allLogs = await this.repo.getLogs();
    this.employees = await this.repo.getAll();
    this.applyFilters();
  }

  handleTabChange(tab) {
    this.activeTab = tab;
    this.applyFilters();
  }

  handleDateChange(date) {
    this.selectedDate = date;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allLogs];

    // 1. Date Filter (compares YYYY-MM-DD part of ISO string)
    if (this.selectedDate) {
      filtered = filtered.filter(log => {
        try {
          const logDate = new Date(log.entryTime || log.time).toISOString().split('T')[0];
          return logDate === this.selectedDate;
        } catch (e) {
          // If date conversion fails, fallback or bypass date check
          return true;
        }
      });
    }

    // 2. Tab-based status filters (Inside vs Outside)
    if (this.activeTab === 'inside') {
      filtered = filtered.filter(log => !log.exitTime);
    } else if (this.activeTab === 'outside') {
      filtered = filtered.filter(log => !!log.exitTime);
    }

    this.filteredLogs = filtered;
    this.tableWidget.update(filtered, this.employees);
  }

  /**
   * Spawns the details popup modal dynamically
   */
  handleDetailClick(item, employees) {
    const employee = employees.find(e => e.id === item.employeeId) || { fullName: 'Bilinmeyen Personel', avatar: 'BP', role: 'Bilinmeyen', department: 'Bilinmeyen' };
    
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
