import { StatsWidget } from '../widgets/dashboard/StatsWidget.js';
import { ChartWidget } from '../widgets/dashboard/ChartWidget.js';
import { RecentLogsTableWidget } from '../widgets/dashboard/RecentLogsTableWidget.js';

/**
 * DashboardScreen aggregates Stats, Line Charts, and Recent Log tables
 */
export class DashboardScreen {
  constructor(personnelRepository) {
    this.repo = personnelRepository;
    
    // Instantiate child widgets
    this.statsWidget = new StatsWidget();
    this.chartWidget = new ChartWidget();
    
    this.recentLogsWidget = new RecentLogsTableWidget(() => this.refreshData());
  }

  /**
   * Main render page shell
   * @param {HTMLElement} container - The DOM target
   */
  async render(container) {
    // Show Loading skeleton screen first
    container.innerHTML = this.getSkeletonHtml();
    if (window.lucide) window.lucide.createIcons();

    // Pull Stats and Trends
    const stats = await this.repo.getStats();
    const trend = await this.repo.getWeeklyTrend();
    const logs = await this.repo.getLogs();
    const employees = await this.repo.getAll();

    // Main layout
    container.innerHTML = `
      <!-- Welcome banner -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Hoş geldiniz, Elif 👋</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">İşte kurumunuzun bugünkü genel performans ve katılım durum özeti.</p>
        </div>
        <div class="flex items-center gap-3">
          <button id="btn-watch-entries" class="px-4 py-2 border border-slate-200 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-slate-700 dark:text-slate-300">
            Girişleri İzle
          </button>
          <button id="btn-add-emp-dashboard" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Yeni Personel Ekle
          </button>
        </div>
      </div>

      <!-- Stats row -->
      <div id="dashboard-stats-container">
        ${this.statsWidget.render(stats)}
      </div>

      <!-- Charts & table row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div id="dashboard-chart-container" class="lg:col-span-2">
          ${this.chartWidget.render()}
        </div>
        <div id="dashboard-recent-table-container">
          ${this.recentLogsWidget.render()}
        </div>
      </div>
    `;

    // Instantiate and load Chart.js and update tables
    this.chartWidget.init(trend);
    this.recentLogsWidget.update(logs, employees);

    // Setup action buttons
    const watchEntriesBtn = document.getElementById('btn-watch-entries');
    if (watchEntriesBtn) {
      watchEntriesBtn.onclick = () => window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'logs' } }));
    }

    const addEmpBtn = document.getElementById('btn-add-emp-dashboard');
    if (addEmpBtn) {
      addEmpBtn.onclick = () => {
        if (typeof window.toggleAddEmployeeModal === 'function') {
          window.toggleAddEmployeeModal();
        }
      };
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  async refreshData() {
    const container = document.getElementById('main-content');
    if (container) {
      this.render(container);
    }
  }

  getSkeletonHtml() {
    return `
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
        <div>
          <div class="h-8 w-56 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div class="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded mt-2"></div>
        </div>
        <div class="flex items-center gap-3">
          <div class="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div class="h-9 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        ${[1, 2, 3, 4].map(() => `
          <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 shadow-xs animate-pulse">
            <div class="flex justify-between items-start mb-4">
              <div class="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div class="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
            </div>
            <div class="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded mt-2"></div>
          </div>
        `).join('')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 shadow-xs lg:col-span-2 animate-pulse">
          <div class="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
          <div class="h-64 bg-slate-100 dark:bg-slate-800/40 rounded-xl"></div>
        </div>
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 shadow-xs animate-pulse">
          <div class="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
          <div class="space-y-4 mt-4">
            ${[1, 2, 3, 4].map(() => `
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div class="h-2.5 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
                <div class="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}
