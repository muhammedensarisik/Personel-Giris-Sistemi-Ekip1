/**
 * RecentLogsTableWidget renders the "Son Giriş Yapanlar" table next to the chart.
 */
export class RecentLogsTableWidget {
  constructor(onRefreshClick) {
    this.onRefreshClick = onRefreshClick;
  }

  /**
   * Render the table container
   */
  render() {
    return `
      <!-- Son Giriş Yapanlar Table -->
      <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div class="flex-1">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-sm">Son Giriş Yapanlar</h3>
            <button id="btn-view-all-logs" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Tümü</button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 pb-2">
                  <th class="pb-3 pr-2">Personel</th>
                  <th class="pb-3 px-2">Saat</th>
                  <th class="pb-3 text-right">Durum</th>
                </tr>
              </thead>
              <tbody id="recentLogsTableBody" class="divide-y divide-slate-50 dark:divide-slate-800/40">
                <!-- populated dynamically -->
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="pt-4 border-t border-slate-50 dark:border-slate-800 mt-4 text-[10px] text-slate-400 flex justify-between items-center">
          <span>Son güncelleme: <span id="last-update-time">-</span></span>
          <button id="btn-refresh-dashboard" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all text-slate-500" title="Verileri Yenile">
            <i data-lucide="refresh-cw" class="w-3 h-3"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Populate the table rows with actual data
   * @param {Array<Object>} entryLogs - mapped attendance logs
   * @param {Array<Object>} employees - resolved personnel list
   */
  update(entryLogs, employees) {
    const tbody = document.getElementById('recentLogsTableBody');
    const updateTime = document.getElementById('last-update-time');
    
    if (updateTime) {
      updateTime.textContent = new Date().toLocaleTimeString('tr-TR');
    }

    if (!tbody) return;

    // Filters entries by checking if they contain an entryTime or time parameter
    const recentEntries = entryLogs.filter(l => l.entryTime || l.time).slice(0, 5);
    
    if (recentEntries.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="py-4 text-center text-slate-400">Bugün giriş yapan bulunmamaktadır.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = recentEntries.map(log => {
      // Find employee details
      const emp = employees.find(e => e.id === log.employeeId) || { fullName: 'Bilinmeyen', avatar: 'B', role: 'Bilinmeyen' };
      
      let statusColor = 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20';
      if (log.status === 'Gecikmeli') {
        statusColor = 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20';
      }

      // Format time safely
      const rawTime = log.entryTime || log.time || '';
      let displayTime = '';

      if (typeof log.getFormattedTime === 'function') {
        displayTime = log.getFormattedTime();
      } else {
        try {
          const date = new Date(rawTime);
          if (!isNaN(date.getTime())) {
            displayTime = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
          } else {
            displayTime = rawTime.split(' ')[1] || rawTime;
          }
        } catch (e) {
          displayTime = rawTime;
        }
      }

      return `
        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
          <td class="py-3 pr-2">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                ${emp.avatar || '??'}
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-slate-800 dark:text-slate-200 truncate">${emp.fullName}</p>
                <p class="text-[9px] text-slate-400 truncate">${emp.role}</p>
              </div>
            </div>
          </td>
          <td class="py-3 px-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">
            ${displayTime}
          </td>
          <td class="py-3 text-right">
            <span class="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${statusColor}">
              ${log.status}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    // Setup event listeners
    const viewAllBtn = document.getElementById('btn-view-all-logs');
    if (viewAllBtn) {
      viewAllBtn.onclick = () => window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'logs' } }));
    }

    const refreshBtn = document.getElementById('btn-refresh-dashboard');
    if (refreshBtn && this.onRefreshClick) {
      refreshBtn.onclick = this.onRefreshClick;
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}
