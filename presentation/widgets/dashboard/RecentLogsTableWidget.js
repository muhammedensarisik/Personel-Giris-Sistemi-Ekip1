/**
 * RecentLogsTableWidget renders the "Son Giriş/Çıkış Kayıtları" table in the main left column.
 * Connected to GET /api/dashboard/recent.
 * Fields: personnelName, department, checkIn, checkOut, duration, status.
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
      <!-- Son Giriş/Çıkış Kayıtları Main Table Card -->
      <div id="widget-recent-logs" class="dashboard-draggable-widget bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all">
        <div>
          <!-- Header Row -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white text-base">Son Giriş / Çıkış Kayıtları</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">İşletmenizdeki güncel personel giriş-çıkış hareketleri</p>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <!-- Refresh Icon Button -->
              <button id="btn-refresh-dashboard" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500 cursor-pointer" title="Verileri Yenile">
                <i id="btn-refresh-icon" data-lucide="refresh-cw" class="w-4 h-4"></i>
              </button>
              
              <!-- Tüm Kayıtlar Button -->
              <button id="btn-view-all-logs" class="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all cursor-pointer">
                Tüm Kayıtlar
              </button>

              <span class="widget-drag-handle p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing" title="Sürükle">
                <i data-lucide="grip-vertical" class="w-4 h-4"></i>
              </span>
            </div>
          </div>

          <!-- Table Container -->
          <div class="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th class="py-3.5 px-4">PERSONEL</th>
                  <th class="py-3.5 px-4">GİRİŞ SAATİ</th>
                  <th class="py-3.5 px-4">ÇIKIŞ SAATİ</th>
                  <th class="py-3.5 px-4">SÜRE</th>
                  <th class="py-3.5 px-4 text-right">DURUM</th>
                </tr>
              </thead>
              <tbody id="recentLogsTableBody" class="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
                <tr>
                  <td colspan="5" class="py-8 text-center text-slate-400 font-semibold">
                    <div class="flex items-center justify-center gap-2">
                      <div class="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Kayıtlar yükleniyor (/api/dashboard/recent)...</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer Row -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6 text-xs text-slate-400 flex items-center justify-between">
          <span>Son güncelleme: <span id="last-update-time" class="font-semibold text-slate-600 dark:text-slate-300">-</span></span>
          <span class="text-[11px] text-slate-400">Toplam kayıt: <strong class="text-slate-700 dark:text-slate-200" id="log-total-count">0</strong></span>
        </div>
      </div>
    `;
  }

  /**
   * Populate the table rows with actual data from GET /api/dashboard/recent or repository
   * @param {Array<Object>} logsList - list of recent logs
   * @param {Array<Object>} employees - resolved personnel list fallback
   */
  update(logsList = [], employees = []) {
    const tbody = document.getElementById('recentLogsTableBody');
    const updateTime = document.getElementById('last-update-time');
    const countEl = document.getElementById('log-total-count');

    if (updateTime) {
      updateTime.textContent = new Date().toLocaleTimeString('tr-TR');
    }

    if (countEl) {
      countEl.textContent = logsList.length;
    }

    if (!tbody) return;

    if (!logsList || logsList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="py-8 text-center text-slate-400 font-semibold">Bugün henüz giriş yapan bulunmuyor.</td>
        </tr>
      `;
      return;
    }

    // Take recent 8-10 logs
    const logs = logsList.slice(0, 10);

    tbody.innerHTML = logs.map(item => {
      // Defensive parsing for API properties (personnelName, role, department, checkIn, checkOut, duration, status)
      const name = item.personnelName || item.fullName || item.employeeName || (employees.find(e => e.id === item.employeeId)?.fullName) || 'Personel';
      const roleOrDept = item.role || item.department || item.departman || (employees.find(e => e.id === item.employeeId)?.role) || 'Genel Kadro';
      
      const checkInRaw = item.checkIn || item.checkInTime || item.entryTime || item.time || '';
      const checkOutRaw = item.checkOut || item.checkOutTime || item.exitTime || '';
      
      // Dynamic duration parsing - NO HARDCODED strings!
      let durationStr = '—';
      if (item.duration && item.duration !== '—') {
        durationStr = item.duration;
      } else if (checkInRaw && checkOutRaw && checkOutRaw !== '—') {
        try {
          const d1 = new Date(checkInRaw);
          const d2 = new Date(checkOutRaw);
          if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
            const diffMs = Math.max(0, d2 - d1);
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            durationStr = `${hours} saat ${mins} dk`;
          }
        } catch (e) {
          durationStr = '—';
        }
      } else if (checkInRaw && (!checkOutRaw || checkOutRaw === '—')) {
        durationStr = 'Devam Ediyor';
      }

      const rawStatus = (item.status || item.durum || '').toString().toLowerCase();

      // Format checkIn time
      let checkInStr = '—';
      if (checkInRaw) {
        try {
          const d = new Date(checkInRaw);
          checkInStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : checkInRaw;
        } catch (e) {
          checkInStr = checkInRaw;
        }
      }

      // Format checkOut time
      let checkOutStr = '— (İçeride)';
      if (checkOutRaw && checkOutRaw !== '—') {
        try {
          const d = new Date(checkOutRaw);
          checkOutStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : checkOutRaw;
        } catch (e) {
          checkOutStr = checkOutRaw;
        }
      }

      // Format initials
      const initials = (name.split(' ')[0][0] + (name.split(' ')[1]?.[0] || '')).toUpperCase();

      // Status Badge Logic: Late -> Geç, OnTime/Normal -> Normal
      let statusBadgeHtml = '';
      if (rawStatus.includes('late') || rawStatus.includes('geç') || rawStatus.includes('gecik')) {
        statusBadgeHtml = `<span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">Geç</span>`;
      } else if (checkOutRaw && checkOutRaw !== '—') {
        statusBadgeHtml = `<span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Mesai Bitti</span>`;
      } else {
        statusBadgeHtml = `<span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">Normal</span>`;
      }

      return `
        <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
          <!-- Personel -->
          <td class="py-3.5 px-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
                ${initials}
              </div>
              <div class="min-w-0">
                <p class="font-bold text-slate-900 dark:text-white truncate">${name}</p>
                <p class="text-[10px] text-slate-400 truncate">${roleOrDept}</p>
              </div>
            </div>
          </td>

          <!-- Giriş Saati -->
          <td class="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
            ${checkInStr}
          </td>

          <!-- Çıkış Saati -->
          <td class="py-3.5 px-4 font-semibold text-slate-500 dark:text-slate-400">
            ${checkOutStr}
          </td>

          <!-- Süre -->
          <td class="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
            ${durationStr}
          </td>

          <!-- Durum -->
          <td class="py-3.5 px-4 text-right">
            ${statusBadgeHtml}
          </td>
        </tr>
      `;
    }).join('');

    // Event Listeners for Buttons
    const viewAllBtn = document.getElementById('btn-view-all-logs');
    if (viewAllBtn) {
      viewAllBtn.onclick = () => {
        window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'logs' } }));
      };
    }

    const refreshBtn = document.getElementById('btn-refresh-dashboard');
    if (refreshBtn && this.onRefreshClick) {
      refreshBtn.onclick = () => {
        const icon = document.getElementById('btn-refresh-icon');
        if (icon) icon.classList.add('animate-spin');
        
        Promise.resolve(this.onRefreshClick()).finally(() => {
          setTimeout(() => {
            if (icon) icon.classList.remove('animate-spin');
          }, 400);
        });
      };
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}
