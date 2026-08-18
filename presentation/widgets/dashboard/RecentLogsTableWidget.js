/**
 * RecentLogsTableWidget renders the "Son Giriş/Çıkış Kayıtları" table in the main left column.
 * Connected to GET /api/attendance/recent (or /api/dashboard/recent).
 * Work Status Badge Logic: checkOut == null / "0001-01-01" -> Mesai Devam Ediyor (Green), checkOut != null -> Mesai Bitti (Slate/Blue).
 */
export class RecentLogsTableWidget {
  constructor(onRefreshClick) {
    this.onRefreshClick = onRefreshClick;
  }

  /**
   * Helper to detect if checkout value represents an active checked-in state (inside)
   */
  isNullOrEmptyCheckOut(val) {
    if (val === null || val === undefined) return true;
    const str = val.toString().trim().toLowerCase();
    if (
      str === '' ||
      str === 'null' ||
      str === 'undefined' ||
      str === '—' ||
      str === '-' ||
      str === '00:00' ||
      str === '00:00:00' ||
      str.includes('0001-01-01') ||
      str.includes('i̇çeride') ||
      str.includes('iceride')
    ) {
      return true;
    }
    return false;
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
              
              <!-- Tüm Kayıtlar Button with Router Navigation -->
              <button id="btn-view-all-logs" onclick="if (typeof window.switchTab === 'function') { window.switchTab('logs'); } else { window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'logs' } })); }" class="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs">
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
                      <span>Kayıtlar yükleniyor (/api/attendance/recent)...</span>
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
   * Populate the table rows with actual data from GET /api/attendance/recent
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
      countEl.textContent = Array.isArray(logsList) ? logsList.length : 0;
    }

    if (!tbody) return;

    if (!logsList || !Array.isArray(logsList) || logsList.length === 0) {
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
      // Robust property parsing for API models
      const empId = item.employeeId || item.userId || item.personnelId || item.id;
      const matchedEmp = Array.isArray(employees) ? employees.find(e => e.id === empId || e.employeeId === empId) : null;

      const name = item.personnelName || item.fullName || item.employeeName || item.userFullName || item.userName || item.personName || item.name || (matchedEmp ? matchedEmp.fullName : 'Personel');
      const roleOrDept = item.role || item.department || item.departman || item.unit || (matchedEmp ? (matchedEmp.department || matchedEmp.role) : 'Genel Kadro');
      
      const checkInRaw = item.checkIn || item.checkInTime || item.entryTime || item.time || item.timestamp || item.date || '';
      const checkOutRaw = item.checkOut !== undefined ? item.checkOut : (item.checkOutTime !== undefined ? item.checkOutTime : item.exitTime);
      
      const actionType = item.type !== undefined ? item.type : (item.action !== undefined ? item.action : item.movementType);
      
      let isInside = false;
      let checkInStr = '—';
      let checkOutStr = '—';
      let durationStr = '—';
      let statusBadgeHtml = '';

      // Check if it's a single movement action log (e.g. action = 'Giriş' / 'Çıkış' or isEntry)
      if (actionType !== undefined && actionType !== null && (checkOutRaw === undefined || checkOutRaw === null)) {
        const isEntryBool = (typeof actionType === 'boolean') 
          ? actionType 
          : (actionType.toString().toLowerCase().includes('giriş') || actionType.toString().toLowerCase().includes('in') || actionType.toString().toLowerCase().includes('entry'));
        
        let timeStr = '—';
        if (checkInRaw) {
          try {
            const d = new Date(checkInRaw);
            timeStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : checkInRaw;
          } catch (e) {
            timeStr = checkInRaw;
          }
        }

        if (isEntryBool) {
          checkInStr = timeStr;
          checkOutStr = '— (İçeride)';
          durationStr = 'Devam Ediyor';
          statusBadgeHtml = `<span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">Giriş Yapıldı</span>`;
        } else {
          checkInStr = '—';
          checkOutStr = timeStr;
          durationStr = 'Tamamlandı';
          statusBadgeHtml = `<span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Çıkış Yapıldı</span>`;
        }
      } else {
        // Paired log logic (checkIn & checkOut)
        isInside = this.isNullOrEmptyCheckOut(checkOutRaw);

        if (checkInRaw) {
          try {
            const d = new Date(checkInRaw);
            checkInStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : checkInRaw;
          } catch (e) {
            checkInStr = checkInRaw;
          }
        }

        if (isInside) {
          checkOutStr = '— (İçeride)';
          durationStr = 'Devam Ediyor';
          statusBadgeHtml = `<span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">Mesai Devam Ediyor</span>`;
        } else {
          if (checkOutRaw) {
            try {
              const d = new Date(checkOutRaw);
              checkOutStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : checkOutRaw;
            } catch (e) {
              checkOutStr = checkOutRaw;
            }
          }

          if (item.duration && item.duration !== '—') {
            durationStr = item.duration;
          } else if (checkInRaw && checkOutRaw) {
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
          }

          statusBadgeHtml = `<span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Mesai Bitti</span>`;
        }
      }

      // Format initials
      const initials = (name.split(' ')[0][0] + (name.split(' ')[1]?.[0] || '')).toUpperCase();

      return `
        <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
          <!-- Personel -->
          <td class="py-3.5 px-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
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

    // Router Event Listener for "Tüm Kayıtlar" Button
    const viewAllBtn = document.getElementById('btn-view-all-logs');
    if (viewAllBtn) {
      viewAllBtn.onclick = (e) => {
        e.preventDefault();
        if (typeof window.switchTab === 'function') {
          window.switchTab('logs');
        } else {
          window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'logs' } }));
        }
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
