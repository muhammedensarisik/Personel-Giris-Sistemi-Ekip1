/**
 * AttendanceFilterWidget manages the quick status tabs (Hepsi, İçeridekiler, Dışarıdakiler) and date filters.
 */
export class AttendanceFilterWidget {
  /**
   * @param {Function} onTabChange - callback when status tab switches (all, inside, outside)
   * @param {Function} onDateChange - callback when date picker changes
   */
  constructor(onTabChange, onDateChange) {
    this.onTabChange = onTabChange;
    this.onDateChange = onDateChange;
    this.activeTab = 'all'; // 'all', 'inside', 'outside'
  }

  render() {
    return `
      <!-- Filter Bar -->
      <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <!-- Status Tabs -->
        <div class="flex border-b border-slate-100 dark:border-slate-800 md:border-b-0 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
          <button id="tab-all" class="px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer bg-white dark:bg-dark-card text-indigo-600 dark:text-indigo-400 shadow-sm">
            Hepsi
          </button>
          <button id="tab-inside" class="px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            Aktif Mesai
          </button>
          <button id="tab-outside" class="px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            Mesaisi Bitenler
          </button>
        </div>

        <!-- Date Filter & Actions -->
        <div class="flex items-center gap-3">
          <div class="relative w-full sm:w-auto">
            <input type="date" id="filter-date" class="w-full sm:w-auto px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-800 outline-hidden focus:border-indigo-500 text-slate-700 dark:text-slate-200 cursor-pointer">
          </div>
          <button id="btn-export-attendance" class="px-3.5 py-2 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/10 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> Excel İndir
          </button>
        </div>

      </div>
    `;
  }

  init() {
    // Set current date by default
    const dateInput = document.getElementById('filter-date');
    if (dateInput) {
      dateInput.valueAsDate = new Date();
      dateInput.onchange = (e) => {
        if (this.onDateChange) this.onDateChange(e.target.value);
      };
    }

    // Set up tab click listeners
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
    
    // Toggle active style helper
    Object.keys(tabs).forEach(id => {
      const btn = tabs[id];
      if (!btn) return;
      if (id === tabId) {
        btn.className = "px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer bg-white dark:bg-dark-card text-indigo-600 dark:text-indigo-400 shadow-sm";
      } else {
        btn.className = "px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-300";
      }
    });

    if (this.onTabChange) {
      this.onTabChange(tabId);
    }
  }
}
