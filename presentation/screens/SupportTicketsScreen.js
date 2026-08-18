import { SupportFilterBarWidget } from '../widgets/support/SupportFilterBarWidget.js';
import { SupportTableWidget } from '../widgets/support/SupportTableWidget.js';
import { SupportDetailModal } from '../widgets/support/SupportDetailModal.js';

/**
 * SupportTicketsScreen orchestrates live Support Ticket management for Admins.
 * Strictly connected to real PostgreSQL backend API:
 * - GET /api/SupportTickets/list/{userId}?role=admin
 * - PUT /api/SupportTickets/{id}/status
 * Fully modular design with clean separation of concerns.
 */
export class SupportTicketsScreen {
  constructor(personnelRepository) {
    this.repo = personnelRepository;
    this.tickets = [];
    this.filteredTickets = [];
    this.activeFilter = 'all';
    this.isLoading = false;

    // Instantiate modular child widgets
    this.filterWidget = new SupportFilterBarWidget(
      (filterKey) => this.handleFilterChange(filterKey),
      () => this.loadData()
    );

    this.tableWidget = new SupportTableWidget(
      (ticket) => this.openDetailModal(ticket)
    );
  }

  async render(container) {
    container.innerHTML = `
      <!-- Top Action & Navigation Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Destek Talepleri</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Personel destek, sorun ve bildirim biletlerinin canlı yönetimi</p>
        </div>
      </div>

      <!-- Quick Status Filter Bar Widget placement -->
      <div id="support-filter-placement">
        ${this.filterWidget.render()}
      </div>

      <!-- Data Table Widget placement -->
      <div id="support-table-placement">
        ${this.tableWidget.render()}
      </div>
    `;

    // Initialize filter bar widget listeners
    this.filterWidget.init();

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Fetch live backend data from PostgreSQL
    await this.loadData();
  }

  /**
   * Fetches real live data from backend API
   */
  async loadData() {
    this.isLoading = true;
    this.tableWidget.showLoading();

    try {
      const data = await this.repo.getSupportTickets();
      this.tickets = Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn("[SupportTicketsScreen] Live backend API fetch failed:", e);
      this.tickets = [];
      if (typeof window.showToast === 'function') {
        window.showToast("Destek biletleri yüklenirken sunucu hatası oluştu.", "error");
      }
    } finally {
      this.isLoading = false;
    }

    this.applyFilter();
  }

  handleFilterChange(filterKey) {
    this.activeFilter = filterKey;
    this.applyFilter();
  }

  /**
   * Normalizes status string handling Turkish characters and mixed casing
   */
  normalizeStatus(str) {
    if (!str) return '';
    return str.toString()
      .trim()
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .replace(/Ğ/g, 'g')
      .replace(/ü/g, 'u').replace(/Ü/g, 'u')
      .replace(/ş/g, 's').replace(/Ş/g, 's')
      .replace(/ö/g, 'o').replace(/Ö/g, 'o')
      .replace(/ç/g, 'c').replace(/Ç/g, 'c')
      .replace(/ı/g, 'i')
      .toLowerCase();
  }

  applyFilter() {
    if (this.activeFilter === 'all') {
      this.filteredTickets = [...this.tickets];
    } else {
      const target = this.normalizeStatus(this.activeFilter);
      this.filteredTickets = this.tickets.filter(t => {
        const st = this.normalizeStatus(t.Status || t.status || '');
        if (target.includes('beklemede') || target.includes('pending')) {
          return st.includes('beklemede') || st.includes('pending') || (!st.includes('cozul') && !st.includes('incel') && !st.includes('red'));
        }
        if (target.includes('incel')) {
          return st.includes('incel') || st.includes('inreview') || st.includes('islem');
        }
        if (target.includes('cozul')) {
          return st.includes('cozul') || st.includes('solv') || st.includes('tamam');
        }
        if (target.includes('red')) {
          return st.includes('red') || st.includes('reject') || st.includes('iptal');
        }
        return st.includes(target);
      });
    }

    this.filterWidget.updateCount(this.filteredTickets.length);
    this.tableWidget.update(this.filteredTickets);
  }

  /**
   * Spawns the dedicated detail modal and handles status updates
   */
  openDetailModal(ticket) {
    // Remove previous overlay if exists
    const oldModal = document.getElementById('support-modal-overlay');
    if (oldModal) oldModal.remove();

    const modalWidget = new SupportDetailModal(async (id, newStatus) => {
      await this.handleStatusUpdate(id, newStatus);
    });

    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalWidget.render(ticket);
    document.body.appendChild(wrapper.firstElementChild);
    modalWidget.init();
  }

  /**
   * Instant local state update & real-time PUT request execution
   */
  async handleStatusUpdate(id, newStatus) {
    try {
      // 1. Instantly update local state in memory
      const match = this.tickets.find(t => (t.Id || t.id || t.ID) == id);
      if (match) {
        match.Status = newStatus;
        match.status = newStatus;
      }

      // 2. Instantly re-render local table & count UI DOM without full page reload
      this.applyFilter();

      // 3. Send real PUT request to /api/SupportTickets/{id}/status
      const success = await this.repo.updateSupportTicketStatus(id, newStatus);
      
      // 4. Re-fetch live backend list in background to stay 100% in sync with PostgreSQL DB
      if (success) {
        await this.loadData();
      }
    } catch (err) {
      if (typeof window.showToast === 'function') {
        window.showToast(err.message || 'Bilet durumu güncellenemedi.', 'error');
      }
      throw err;
    }
  }
}
