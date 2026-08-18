/**
 * AttendanceDetailModal controls the overlay popup rendering when viewing employee daily logs.
 * Displays database arrival status (OnTime / Late -> Zamanında Geldi / Geç Kaldı), check-in, check-out, duration, and IP details.
 */
export class AttendanceDetailModal {
  render(item, employee) {
    // Strictly format checking time outputs
    const formatTime = (rawTime) => {
      if (!rawTime || rawTime === 'null' || rawTime === 'undefined' || rawTime === '' || rawTime === '—') {
        return '--:--';
      }
      try {
        if (typeof rawTime === 'string' && /^\d{2}:\d{2}$/.test(rawTime)) {
          return rawTime;
        }
        const date = new Date(rawTime);
        if (isNaN(date.getTime())) return '--:--';
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return '--:--';
      }
    };

    const getDuration = (entry, exit) => {
      if (!exit || exit === 'null' || exit === 'undefined' || exit === '' || exit === '—') return 'Devam Ediyor (İçeride)';
      try {
        const entryDate = new Date(entry);
        const exitDate = new Date(exit);
        const diffMs = exitDate - entryDate;
        if (isNaN(diffMs) || diffMs < 0) return '—';
        
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        return `${diffHrs} saat ${diffMins} dakika`;
      } catch (e) {
        return '—';
      }
    };

    const formatDate = (isoString) => {
      try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
      } catch (e) {
        return 'Bugün';
      }
    };

    const durationText = getDuration(item?.checkInTime || item?.entryTime || item?.time, item?.checkOutTime || item?.exitTime);
    const displayDate = formatDate(item?.checkInTime || item?.entryTime || item?.time);
    const entryTime = formatTime(item?.checkInTime || item?.entryTime || item?.time);
    const exitTime = formatTime(item?.checkOutTime || item?.exitTime);

    // DB Arrival Status (OnTime / Late)
    const rawStatus = (item?.status || item?.durum || '').toString().toLowerCase();
    let dbStatusBadge = '';
    if (rawStatus.includes('late') || rawStatus.includes('geç') || rawStatus.includes('gecik')) {
      dbStatusBadge = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300/40">🔴 Geç Kaldı</span>`;
    } else {
      dbStatusBadge = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40">🟢 Zamanında Geldi</span>`;
    }

    // Extra metadata fields
    const device = item?.device || 'RFID Kart Okuyucu (RFID-A4)';
    const location = item?.location || 'Merkez Ofis - Ana Giriş';
    const ipAddress = item?.ipAddress || '192.168.1.102';

    const empName = employee?.fullName || item?.personnelName || 'Bilinmeyen Personel';
    const empRole = employee?.role || item?.role || 'Personel';
    const empDept = employee?.department || item?.department || 'Genel Kadro';
    const initials = (empName.split(' ')[0][0] + (empName.split(' ')[1]?.[0] || '')).toUpperCase();

    return `
      <!-- Modal Overlay -->
      <div id="attendance-modal-overlay" class="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in">
        <!-- Backdrop -->
        <div id="btn-close-modal-backdrop" class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"></div>
        
        <!-- Modal Card Container -->
        <div class="relative w-full max-w-md bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl p-6 transform transition-all">
          
          <!-- Header -->
          <div class="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i data-lucide="info" class="w-4 h-4 text-indigo-500"></i>
              Giriş/Çıkış Detayı
            </h3>
            <button id="btn-close-modal-x" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Employee Card -->
          <div class="flex items-center gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100/80 dark:border-slate-800/40 mb-5">
            <div class="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
              ${initials}
            </div>
            <div class="min-w-0">
              <h4 class="font-bold text-sm text-slate-900 dark:text-white truncate">${empName}</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">${empRole} • <span class="font-semibold text-indigo-600 dark:text-indigo-400">${empDept}</span></p>
            </div>
          </div>

          <!-- Database Status Row (OnTime vs Late) -->
          <div class="p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/40 rounded-xl flex items-center justify-between mb-4">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Devamlılık / Varış Durumu:</span>
            ${dbStatusBadge}
          </div>

          <!-- Detail Metrics grid -->
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/20 rounded-xl">
              <span class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Giriş Saati</span>
              <span class="text-sm font-bold text-slate-800 dark:text-slate-200">${entryTime}</span>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/20 rounded-xl">
              <span class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Çıkış Saati</span>
              <span class="text-sm font-bold text-slate-800 dark:text-slate-200">${exitTime}</span>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/20 rounded-xl col-span-2">
              <span class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Çalışma Süresi</span>
              <span class="text-sm font-bold text-indigo-600 dark:text-indigo-400">${durationText}</span>
            </div>
          </div>

          <!-- Location & Tech Info -->
          <div class="space-y-3 border-t border-slate-100 dark:border-slate-800/60 pt-4 text-xs">
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span class="text-slate-400 font-medium">Tarih:</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200">${displayDate}</span>
            </div>
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span class="text-slate-400 font-medium">Giriş Kapısı / Cihaz:</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200">${device}</span>
            </div>
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span class="text-slate-400 font-medium">Konum:</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200">${location}</span>
            </div>
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span class="text-slate-400 font-medium">IP Adresi:</span>
              <span class="font-mono text-slate-500">${ipAddress}</span>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  /**
   * Bind close event handlers
   */
  init() {
    const closeBtn = document.getElementById('btn-close-modal-x');
    const backdrop = document.getElementById('btn-close-modal-backdrop');
    
    const closeModal = () => {
      const modal = document.getElementById('attendance-modal-overlay');
      if (modal) modal.remove();
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (backdrop) backdrop.onclick = closeModal;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}
