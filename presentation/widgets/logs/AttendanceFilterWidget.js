/**
 * AttendanceFilterWidget manages search input, status tabs, date picker, and "Tümü" date reset button.
 */
export class AttendanceFilterWidget {
  /**
   * @param {Function} onTabChange - callback when status tab switches (all, inside, outside)
   * @param {Function} onDateChange - callback when date picker changes (YYYY-MM-DD or null)
   * @param {Function} onSearchInput - callback when search input changes
   */
  constructor(onTabChange, onDateChange, onSearchInput) {
    this.onTabChange = onTabChange;
    this.onDateChange = onDateChange;
    this.onSearchInput = onSearchInput;
    this.activeTab = 'all';
    this.selectedDate = null;
  }

  render() {
    return `
      <!-- Filter Bar -->
      <div class="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        
        <!-- Search Input & Status Tabs Container -->
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <!-- Search Input -->
          <div class="relative w-full sm:w-64">
            <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
            <input type="text" id="search-attendance-input" placeholder="Personel adıyla ara..." class="w-full pl-9 pr-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 font-semibold" />
          </div>

          <!-- Status Tabs -->
          <div class="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-full sm:w-auto">
            <button id="tab-all" class="px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer bg-white dark:bg-dark-card text-indigo-600 dark:text-indigo-400 shadow-xs">
              Tümü
            </button>
            <button id="tab-inside" class="px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white">
              Aktif Mesai
            </button>
            <button id="tab-outside" class="px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white">
              Mesaisi Bitenler
            </button>
          </div>
        </div>

        <!-- Date Filter Bar (Tümü + Date Picker) -->
        <div class="flex items-center gap-2">
          <!-- Tümü Button (Clears Date Filter) -->
          <button id="btn-filter-all-dates" class="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0" title="Tüm Geçmiş Kayıtları Göster">
            <i data-lucide="calendar-range" class="w-3.5 h-3.5"></i>
            Tümü
          </button>

          <!-- Date Picker Input -->
          <div class="relative flex items-center">
            <input type="date" id="filter-date" class="px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 cursor-pointer font-semibold" />
          </div>

          <!-- Export Excel Button -->
          <button id="btn-export-attendance" class="px-3.5 py-2 border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> Excel İndir
          </button>
        </div>

      </div>
    `;
  }

  init() {
    const searchInput = document.getElementById('search-attendance-input');
    const dateInput = document.getElementById('filter-date');
    const allDatesBtn = document.getElementById('btn-filter-all-dates');

    if (searchInput && this.onSearchInput) {
      searchInput.oninput = (e) => this.onSearchInput(e.target.value);
    }

    if (dateInput) {
      dateInput.onchange = (e) => {
        this.selectedDate = e.target.value || null;
        if (this.onDateChange) this.onDateChange(this.selectedDate);
      };
    }

    if (allDatesBtn) {
      allDatesBtn.onclick = () => {
        if (dateInput) dateInput.value = '';
        this.selectedDate = null;
        if (this.onDateChange) this.onDateChange(null);
      };
    }

    // Tab click listeners
    const tabs = {
      all: document.getElementById('tab-all'),
      inside: document.getElementById('tab-inside'),
      outside: document.getElementById('tab-outside')
    };

    Object.keys(tabs).forEach(tabId => {
      const btn = tabs[tabId];
      if (!btn) return;
      btn.onclick = () => this.switchTab(tabId, tabs);
    });

    const exportBtn = document.getElementById('btn-export-attendance');
    if (exportBtn) {
      exportBtn.onclick = () => {
        if (typeof window.showToast === 'function') {
          window.showToast('Giriş/Çıkış listesi Excel formatına dönüştürülüyor...', 'success');
        }
      };
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  switchTab(tabId, tabs) {
    this.activeTab = tabId;
    
    Object.keys(tabs).forEach(id => {
      const btn = tabs[id];
      if (!btn) return;
      if (id === tabId) {
        btn.className = "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer bg-white dark:bg-dark-card text-indigo-600 dark:text-indigo-400 shadow-xs";
      } else {
        btn.className = "px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white";
      }
    });

    if (this.onTabChange) {
      this.onTabChange(tabId);
    }
  }
}
