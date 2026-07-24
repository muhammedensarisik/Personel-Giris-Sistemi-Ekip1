/**
 * QuickActionsAndLeaveWidget renders Quick Action buttons and Pending Leave Requests connected to GET /api/dashboard/pending-leaves.
 * Fields: personnelName, leaveType, dateRange.
 */
export class QuickActionsAndLeaveWidget {
  constructor(onApproveLeave, onRejectLeave) {
    this.onApproveLeave = onApproveLeave;
    this.onRejectLeave = onRejectLeave;
    this.leaveRequests = [];
    this.employees = [];
  }

  renderQuickActions() {
    return `
      <!-- Hızlı İşlemler Panel Card -->
      <div id="widget-quick-actions" class="dashboard-draggable-widget bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl p-6 shadow-xs transition-all">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <i data-lucide="zap" class="w-4 h-4 text-amber-500"></i>
            Hızlı İşlemler
          </h3>
          <span class="widget-drag-handle p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing" title="Sürükle">
            <i data-lucide="grip-vertical" class="w-4 h-4"></i>
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <button id="btn-quick-add-emp" class="flex flex-col items-center justify-center p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 font-semibold transition-all cursor-pointer group">
            <i data-lucide="user-plus" class="w-5 h-5 mb-1.5 transition-transform group-hover:scale-110"></i>
            Personel Ekle
          </button>

          <button id="btn-quick-report" class="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:text-blue-300 font-semibold transition-all cursor-pointer group">
            <i data-lucide="file-text" class="w-5 h-5 mb-1.5 transition-transform group-hover:scale-110"></i>
            Rapor Oluştur
          </button>

          <button id="btn-quick-qr" class="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 font-semibold transition-all cursor-pointer group">
            <i data-lucide="qr-code" class="w-5 h-5 mb-1.5 transition-transform group-hover:scale-110"></i>
            QR Kod Oluştur
          </button>

          <button id="btn-quick-announcement" class="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 dark:text-purple-300 font-semibold transition-all cursor-pointer group">
            <i data-lucide="megaphone" class="w-5 h-5 mb-1.5 transition-transform group-hover:scale-110"></i>
            Duyuru Gönder
          </button>
        </div>
      </div>
    `;
  }

  renderLeaveRequests() {
    return `
      <!-- Bekleyen İzin Talepleri Panel Card -->
      <div id="widget-leave-requests" class="dashboard-draggable-widget bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl p-6 shadow-xs transition-all">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <i data-lucide="calendar" class="w-4 h-4 text-blue-500"></i>
            İzin Talepleri
          </h3>
          <div class="flex items-center gap-2">
            <button id="btn-view-all-leaves" class="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer">
              Tümünü Gör
            </button>
            <span class="widget-drag-handle p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing" title="Sürükle">
              <i data-lucide="grip-vertical" class="w-4 h-4"></i>
            </span>
          </div>
        </div>

        <div id="pending-leaves-container" class="space-y-3">
          <div class="text-center py-6 text-slate-400 text-xs font-semibold">
            <div class="flex items-center justify-center gap-2">
              <div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>İzin talepleri yükleniyor (/api/dashboard/pending-leaves)...</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return `
      <div class="space-y-6">
        ${this.renderQuickActions()}
        ${this.renderLeaveRequests()}
      </div>
    `;
  }

  /**
   * Render dynamic pending leaves list from GET /api/dashboard/pending-leaves
   * @param {Array<Object>} pendingLeaves - List containing personnelName, leaveType, dateRange
   * @param {Array<Object>} employees - Fallback personnel array
   */
  update(pendingLeaves = [], employees = []) {
    const container = document.getElementById('pending-leaves-container');
    if (!container) return;

    if (!pendingLeaves || pendingLeaves.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-slate-400 text-xs font-semibold">
          Bekleyen izin talebi bulunmuyor.
        </div>
      `;
      return;
    }

    container.innerHTML = pendingLeaves.slice(0, 5).map((item, index) => {
      const name = item.personnelName || item.fullName || item.userName || (employees.find(e => e.id === item.userId)?.fullName) || 'Personel';
      const leaveType = item.leaveType || item.type || 'Yıllık İzin';

      const startDate = typeof item?.getFormattedStartDate === 'function' ? item.getFormattedStartDate() : (item?.startDate || '');
      const endDate = typeof item?.getFormattedEndDate === 'function' ? item.getFormattedEndDate() : (item?.endDate || '');
      
      const dateRange = item.dateRange || ((startDate && endDate) ? `${startDate} - ${endDate}` : (startDate || 'Gelecek Hafta'));
      const initials = (name.split(' ')[0][0] + (name.split(' ')[1]?.[0] || '')).toUpperCase();

      const itemId = item.id || `leave-${index}`;

      return `
        <div class="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-dark-border rounded-xl flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
              ${initials}
            </div>
            <div class="min-w-0">
              <div class="font-bold text-slate-900 dark:text-white truncate">${name}</div>
              <div class="text-[10px] text-slate-400 truncate">${leaveType} • ${dateRange}</div>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button class="btn-dash-approve-leave w-7 h-7 flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 rounded-lg transition-colors cursor-pointer" data-id="${itemId}" title="Onayla">
              <i data-lucide="check" class="w-3.5 h-3.5 stroke-[3]"></i>
            </button>
            <button class="btn-dash-reject-leave w-7 h-7 flex items-center justify-center bg-rose-100 hover:bg-rose-200 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 rounded-lg transition-colors cursor-pointer" data-id="${itemId}" title="Reddet">
              <i data-lucide="x" class="w-3.5 h-3.5 stroke-[3]"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Event handlers for actions
    container.querySelectorAll('.btn-dash-approve-leave').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (this.onApproveLeave) this.onApproveLeave(id);
      };
    });

    container.querySelectorAll('.btn-dash-reject-leave').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (this.onRejectLeave) this.onRejectLeave(id);
      };
    });
  }

  initListeners() {
    const addEmpBtn = document.getElementById('btn-quick-add-emp');
    if (addEmpBtn) {
      addEmpBtn.onclick = () => {
        if (typeof window.toggleAddEmployeeModal === 'function') {
          window.toggleAddEmployeeModal();
        }
      };
    }

    const reportBtn = document.getElementById('btn-quick-report');
    if (reportBtn) {
      reportBtn.onclick = () => window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'raporlar' } }));
    }

    const qrBtn = document.getElementById('btn-quick-qr');
    if (qrBtn) {
      qrBtn.onclick = () => {
        if (typeof window.showToast === 'function') {
          window.showToast('Mobil turnike geçiş QR Kodu oluşturuldu.', 'success');
        }
      };
    }

    const annBtn = document.getElementById('btn-quick-announcement');
    if (annBtn) {
      annBtn.onclick = () => window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'duyurular' } }));
    }

    const viewAllBtn = document.getElementById('btn-view-all-leaves');
    if (viewAllBtn) {
      viewAllBtn.onclick = () => window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'leave' } }));
    }
  }
}
