/**
 * AttendanceTableWidget renders the list of attendances inside a structured Data Table grid.
 * Displays: Personel, Tarih (GG.AA.YYYY), Giriş Saati (HH:mm), Çıkış Saati (HH:mm or --:--),
 * Durum (Mesai Devam Ediyor / Mesai Bitti / Mesai Saati Dışı), Süre (Dk / Devam Ediyor), Aksiyon (Detay).
 */
export class AttendanceTableWidget {
  /**
   * @param {Function} onDetailClick - callback when "Detay" button is clicked
   */
  constructor(onDetailClick) {
    this.onDetailClick = onDetailClick;
    this.attendances = [];
  }

  render() {
    return `
      <!-- Data Table Shell -->
      <div class="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-xs">
            <thead>
              <tr class="border-b border-slate-100 dark:border-dark-border bg-slate-50/60 dark:bg-slate-900/30 text-slate-400 font-bold tracking-wider uppercase">
                <th class="px-6 py-4">PERSONEL</th>
                <th class="px-6 py-4">TARİH</th>
                <th class="px-6 py-4">GİRİŞ SAATİ</th>
                <th class="px-6 py-4">ÇIKIŞ SAATİ</th>
                <th class="px-6 py-4">DURUM</th>
                <th class="px-6 py-4">SÜRE (DK)</th>
                <th class="px-6 py-4 text-right">AKSİYON</th>
              </tr>
            </thead>
            <tbody id="attendance-table-body" class="divide-y divide-slate-100 dark:divide-dark-border">
              <tr>
                <td colspan="7" class="px-6 py-12 text-center text-slate-400 font-semibold">
                  <div class="flex items-center justify-center gap-3">
                    <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Giriş/Çıkış kayıtları yükleniyor...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Shows loading spinner state
   */
  showLoading() {
    const tbody = document.getElementById('attendance-table-body');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-12 text-center text-slate-400 font-semibold">
            <div class="flex items-center justify-center gap-3">
              <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Giriş/Çıkış kayıtları yükleniyor (/api/attendance/panel)...</span>
            </div>
          </td>
        </tr>
      `;
    }
  }

  /**
   * Formats ISO date string or Date object into GG.AA.YYYY (Day/Month/Year)
   */
  formatDate(rawDate) {
    if (!rawDate || rawDate === 'null' || rawDate === 'undefined') return '—';
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return '—';
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (e) {
      return '—';
    }
  }

  /**
   * Formats ISO date string or Date object into HH:mm (Hour/Minute)
   * Returns '--:--' if checkOut/checkIn is null or empty.
   */
  formatTime(rawTime) {
    if (!rawTime || rawTime === 'null' || rawTime === 'undefined' || rawTime === '' || rawTime === '—') {
      return '--:--';
    }
    try {
      const d = new Date(rawTime);
      if (isNaN(d.getTime())) return '--:--';
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (e) {
      return '--:--';
    }
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
   * Real-time work status badge logic based on checkOutTime
   */
  getWorkStatusBadge(checkInRaw, checkOutRaw) {
    const isInside = this.isNullOrEmptyCheckOut(checkOutRaw);
    
    if (isInside) {
      return `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Mesai Devam Ediyor
        </span>
      `;
    }

    // Optional check: weekend or outside 07:00 - 19:00
    if (checkInRaw) {
      try {
        const d = new Date(checkInRaw);
        if (!isNaN(d.getTime())) {
          const day = d.getDay();
          const hour = d.getHours();
          if (day === 0 || day === 6 || hour < 7 || hour >= 19) {
            return `
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Mesai Saati Dışı
              </span>
            `;
          }
        }
      } catch (e) {}
    }

    // Checked out normally
    return `
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
        <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Mesai Bitti
      </span>
    `;
  }

  /**
   * Calculates duration in minutes
   */
  calculateDurationMinutes(item, checkInRaw, checkOutRaw) {
    const isInside = this.isNullOrEmptyCheckOut(checkOutRaw);
    if (isInside) {
      return 'Devam Ediyor';
    }

    if (item.duration !== undefined && item.duration !== null && item.duration !== '') {
      if (typeof item.duration === 'number') return `${item.duration} Dk`;
      if (item.duration.toString().includes('Dk') || item.duration.toString().includes('saat')) return item.duration;
      return `${item.duration} Dk`;
    }

    if (checkInRaw && checkOutRaw) {
      try {
        const d1 = new Date(checkInRaw);
        const d2 = new Date(checkOutRaw);
        if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
          const diffMs = Math.max(0, d2 - d1);
          const diffMins = Math.floor(diffMs / (1000 * 60));
          return `${diffMins} Dk`;
        }
      } catch (e) {
        return '—';
      }
    }

    return '—';
  }

  /**
   * Update table content with strict date/time formatting, work status badges, and action buttons
   * @param {Array<Object>} list - mapped attendance objects 
   * @param {Array<Object>} employees - resolved personnel list
   */
  update(list, employees = []) {
    this.attendances = list;
    const tbody = document.getElementById('attendance-table-body');
    if (!tbody) return;

    // Empty State Handling
    if (!list || list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">
            <div class="flex flex-col items-center justify-center gap-2">
              <i data-lucide="folder-search" class="w-8 h-8 text-slate-300 dark:text-slate-600"></i>
              <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Kayıt Bulunamadı</span>
              <p class="text-xs text-slate-400">Seçilen tarihte veya filtrede gösterilecek giriş/çıkış kaydı bulunmuyor.</p>
            </div>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tbody.innerHTML = list.map(item => {
      // Find employee details with safety checks
      const emp = employees?.find(e => e?.id === item?.employeeId || e?.id === item?.userId) || { 
        fullName: item?.personnelName || item?.fullName || item?.userName || 'Personel', 
        role: item?.role || item?.department || 'Personel', 
        department: item?.department || 'Genel', 
        avatar: 'P' 
      };

      const fullName = item?.personnelName || emp.fullName || 'Personel';
      const deptOrRole = item?.role || item?.department || emp.department || 'Genel Kadro';
      const initials = (fullName.split(' ')[0][0] + (fullName.split(' ')[1]?.[0] || '')).toUpperCase();
      
      const checkInRaw = item?.checkInTime || item?.entryTime || item?.checkIn || item?.time || '';
      const checkOutRaw = item?.checkOutTime || item?.exitTime || item?.checkOut || null;

      // Formatting: Tarih (GG.AA.YYYY), Giriş Saati (HH:mm), Çıkış Saati (HH:mm or --:--)
      const dateText = this.formatDate(checkInRaw);
      const checkInTimeText = this.formatTime(checkInRaw);
      const checkOutTimeText = this.formatTime(checkOutRaw);
      
      // Real-time Work Status Badge (Mesai Devam Ediyor vs Mesai Bitti)
      const badgeHtml = this.getWorkStatusBadge(checkInRaw, checkOutRaw);

      // Duration in minutes or Devam Ediyor
      const durationText = this.calculateDurationMinutes(item, checkInRaw, checkOutRaw);

      return `
        <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
          <!-- Personel -->
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                ${initials}
              </div>
              <div>
                <div class="font-bold text-slate-900 dark:text-white text-sm">${fullName}</div>
                <div class="text-[10px] text-slate-400 font-medium">${deptOrRole}</div>
              </div>
            </div>
          </td>

          <!-- Tarih (GG.AA.YYYY) -->
          <td class="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
            ${dateText}
          </td>

          <!-- Giriş Saati (HH:mm) -->
          <td class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
            ${checkInTimeText}
          </td>

          <!-- Çıkış Saati (HH:mm or --:--) -->
          <td class="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">
            ${checkOutTimeText}
          </td>

          <!-- Durum (Mesai Devam Ediyor / Mesai Bitti) -->
          <td class="px-6 py-4">
            ${badgeHtml}
          </td>

          <!-- Süre (Dk / Devam Ediyor) -->
          <td class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
            ${durationText}
          </td>

          <!-- Aksiyon -->
          <td class="px-6 py-4 text-right">
            <button class="btn-attendance-detail inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 dark:text-indigo-400 rounded-xl text-xs font-bold transition-colors cursor-pointer" data-id="${item?.id}">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              Detay
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach listeners
    const detailBtns = tbody.querySelectorAll('.btn-attendance-detail');
    detailBtns.forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const match = this.attendances?.find(a => a?.id?.toString() === id?.toString());
        if (match && this.onDetailClick) {
          this.onDetailClick(match, employees);
        }
      };
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}
