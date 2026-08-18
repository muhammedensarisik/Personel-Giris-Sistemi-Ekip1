/**
 * SupportFilterBarWidget manages the quick status tabs (Tümü, Beklemede, İnceleniyor, Çözüldü, Reddedildi),
 * total count label, and manual refresh button.
 */
export class SupportFilterBarWidget {
  /**
   * @param {Function} onFilterChange - callback when status filter switches
   * @param {Function} onRefreshClick - callback when refresh button is clicked
   */
  constructor(onFilterChange, onRefreshClick) {
    this.onFilterChange = onFilterChange;
    this.onRefreshClick = onRefreshClick;
    this.activeFilter = 'all';
  }

  render() {
    return `
      <!-- Quick Status Filter Bar -->
      <div class="bg-white dark:bg-dark-card border border-slate-200/60 dark:border-dark-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <!-- Scrollable Tab Container on Mobile -->
        <div class="overflow-x-auto pb-1 sm:pb-0">
          <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl text-xs font-semibold shrink-0">
            <button id="filter-ticket-all" class="px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer bg-white dark:bg-dark-card text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold shrink-0">
              Tümü
            </button>
            <button id="filter-ticket-pending" class="px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white shrink-0">
              Beklemede
            </button>
            <button id="filter-ticket-inreview" class="px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white shrink-0">
              İnceleniyor
            </button>
            <button id="filter-ticket-solved" class="px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white shrink-0">
              Çözüldü
            </button>
            <button id="filter-ticket-rejected" class="px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white shrink-0">
              Reddedildi
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span class="text-xs text-slate-400 font-semibold">
            Toplam Bilet: <strong id="tickets-count-label" class="text-slate-800 dark:text-slate-200 font-bold">0</strong>
          </span>

          <button id="btn-refresh-tickets" class="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs" title="Listeyi Yenile">
            <i id="btn-refresh-tickets-icon" data-lucide="refresh-cw" class="w-4 h-4"></i>
            <span>Yenile</span>
          </button>
        </div>
      </div>
    `;
  }

  init() {
    const filterBtns = {
      'all': document.getElementById('filter-ticket-all'),
      'Beklemede': document.getElementById('filter-ticket-pending'),
      'İnceleniyor': document.getElementById('filter-ticket-inreview'),
      'Çözüldü': document.getElementById('filter-ticket-solved'),
      'Reddedildi': document.getElementById('filter-ticket-rejected')
    };

    Object.keys(filterBtns).forEach(key => {
      const btn = filterBtns[key];
      if (!btn) return;
      btn.onclick = () => {
        Object.keys(filterBtns).forEach(k => {
          const b = filterBtns[k];
          if (b) {
            b.className = "px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold shrink-0";
          }
        });
        btn.className = "px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer bg-white dark:bg-dark-card text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold shrink-0";
        
        this.activeFilter = key;
        if (this.onFilterChange) this.onFilterChange(key);
      };
    });

    const refreshBtn = document.getElementById('btn-refresh-tickets');
    if (refreshBtn && this.onRefreshClick) {
      refreshBtn.onclick = () => {
        const icon = document.getElementById('btn-refresh-tickets-icon');
        if (icon) icon.classList.add('animate-spin');
        Promise.resolve(this.onRefreshClick()).finally(() => {
          setTimeout(() => { if (icon) icon.classList.remove('animate-spin'); }, 400);
        });
      };
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  updateCount(count) {
    const countEl = document.getElementById('tickets-count-label');
    if (countEl) countEl.textContent = count;
  }
}
