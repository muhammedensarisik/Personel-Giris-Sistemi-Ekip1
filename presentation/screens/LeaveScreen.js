import { LeaveTableWidget } from '../widgets/leave/LeaveTableWidget.js';

/**
 * LeaveScreen displays leave requests and manages approval/rejection updates.
 */
export class LeaveScreen {
  constructor(personnelRepository) {
    this.repo = personnelRepository;
    
    this.leaveRequests = [];
    this.employees = [];

    // Instantiate modular child widgets with PUT callbacks
    this.tableWidget = new LeaveTableWidget(
      (id) => this.handleApprove(id),
      (id) => this.handleReject(id)
    );
  }

  async render(container) {
    container.innerHTML = `
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">İzin Talepleri</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Personellerin izin talepleri onay ve yönetim paneli.</p>
      </div>

      <!-- Table widget placement -->
      <div id="leave-table-placement">
        ${this.tableWidget.render()}
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Load and update
    await this.loadData();
  }

  async loadData() {
    this.leaveRequests = await this.repo.getLeaveRequests();
    this.employees = await this.repo.getAll();
    this.tableWidget.update(this.leaveRequests, this.employees);
  }

  /**
   * Approves a leave request via PUT
   * @param {string|number} id 
   */
  async handleApprove(id) {
    const success = await this.repo.updateLeaveStatus(id, 'Approved');
    if (success) {
      // Auto-reload without a full page refresh
      await this.loadData();
    }
  }

  /**
   * Rejects a leave request via PUT
   * @param {string|number} id 
   */
  async handleReject(id) {
    const success = await this.repo.updateLeaveStatus(id, 'Rejected');
    if (success) {
      // Auto-reload without a full page refresh
      await this.loadData();
    }
  }
}
