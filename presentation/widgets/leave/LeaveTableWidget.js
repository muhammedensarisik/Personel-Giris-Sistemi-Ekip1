/**
 * LeaveTableWidget renders the leave requests list with business day calculations,
 * clean DD.MM.YYYY Turkish date formatting, tab-specific dynamic headers,
 * approvedBy/adminNote columns, and action buttons.
 */
export class LeaveTableWidget {
  /**
   * @param {Function} onApproveClick - callback when Approve is clicked
   * @param {Function} onRejectClick - callback when Reject is clicked
   */
  constructor(onApproveClick, onRejectClick) {
    this.onApproveClick = onApproveClick;
    this.onRejectClick = onRejectClick;
    this.leaveRequests = [];
    this.employees = [];
    this.activeTab = 'pending'; // 'pending' | 'approved' | 'rejected'
  }

  render() {
    return `
      <!-- Table Container Card -->
      <div class="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead id="leave-table-head">
              <!-- Dynamically populated per active tab -->
            </thead>
            <tbody id="leave-table-body" class="divide-y divide-slate-100 dark:divide-dark-border">
              <!-- Dynamically rendered rows -->
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Format ISO date string into DD.MM.YYYY
   * @param {string} dateStr 
   * @returns {string}
   */
  formatDate(dateStr) {
    if (!dateStr || dateStr === '—') return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * Calculates business days (excluding weekends) between two dates
   * @param {string} start 
   * @param {string} end 
   * @returns {number}
   */
  calculateWorkDays(start, end) {
    if (!start) return 1;
    const d1 = new Date(start);
    const d2 = end ? new Date(end) : new Date(start);

    if (isNaN(d1.getTime())) return 1;
    if (isNaN(d2.getTime()) || d2 < d1) return 1;

    let count = 0;
    const cur = new Date(d1);
    while (cur <= d2) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count === 0 ? 1 : count;
  }

  /**
   * Update table content based on state and active filter tab
   */
  update(leaveRequests, employees, activeTab = 'pending') {
    this.leaveRequests = leaveRequests || [];
    this.employees = employees || [];
    this.activeTab = activeTab;

    const thead = document.getElementById('leave-table-head');
    const tbody = document.getElementById('leave-table-body');
    if (!tbody) return;

    // Render Dynamic Header according to active tab
    if (thead) {
      if (this.activeTab === 'pending') {
        thead.innerHTML = `
          <tr class="border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 font-bold tracking-wider uppercase">
            <th class="px-6 py-4">PERSONEL</th>
            <th class="px-6 py-4">İZİN TÜRÜ</th>
            <th class="px-6 py-4">TARİH ARALIĞI</th>
            <th class="px-6 py-4">DURUM</th>
            <th class="px-6 py-4 text-center">İŞLEMLER</th>
          </tr>
        `;
      } else {
        const processorLabel = this.activeTab === 'approved' ? 'ONAYLAYAN' : 'REDDEDEN';
        thead.innerHTML = `
          <tr class="border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 font-bold tracking-wider uppercase">
            <th class="px-6 py-4">PERSONEL</th>
            <th class="px-6 py-4">İZİN TÜRÜ</th>
            <th class="px-6 py-4">TARİH ARALIĞI</th>
            <th class="px-6 py-4">DURUM</th>
            <th class="px-6 py-4">${processorLabel}</th>
            <th class="px-6 py-4">YÖNETİCİ NOTU</th>
          </tr>
        `;
      }
    }

    // Filter requests according to tab
    const filtered = this.leaveRequests.filter(item => {
      const st = (item?.status || 'beklemede').toLowerCase();
      if (this.activeTab === 'pending') {
        return st.includes('bekle') || st.includes('pend') || st === 'pending';
      } else if (this.activeTab === 'approved') {
        return st.includes('onay') || st.includes('approve') || st === 'aktif';
      } else if (this.activeTab === 'rejected') {
        return st.includes('red') || st.includes('reject') || st === 'iptal';
      }
      return true;
    });

    const colSpanCount = this.activeTab === 'pending' ? 5 : 6;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${colSpanCount}" class="px-6 py-12 text-center text-slate-400 font-semibold">
            Bu kategoride gösterilecek izin talebi bulunmuyor.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(item => {
      // Find employee details or use API properties directly
      const emp = this.employees.find(e => e?.id === item?.userId || e?.id === item?.employeeId) || {
        fullName: item?.personnelName || item?.fullName || item?.userName || 'Personel',
        role: item?.department || 'Personel',
        department: item?.department || 'Genel',
        avatar: 'P'
      };

      const fullName = item?.personnelName || emp.fullName || 'Personel';
      const initials = (fullName.split(' ')[0][0] + (fullName.split(' ')[1]?.[0] || '')).toUpperCase();

      // Clean DD.MM.YYYY Date Formatting
      const startDateText = this.formatDate(item?.startDate);
      const endDateText = item?.endDate ? this.formatDate(item?.endDate) : null;

      let dateRangeDisplay = startDateText;
      if (endDateText && endDateText !== startDateText && endDateText !== '—') {
        dateRangeDisplay = `${startDateText} - ${endDateText}`;
      }

      // Calculate work days
      const workDays = this.calculateWorkDays(item?.startDate, item?.endDate);

      // Status pill style
      const st = (item?.status || 'beklemede').toLowerCase();
      let statusBadge = '';
      if (st.includes('onay') || st.includes('approve')) {
        statusBadge = `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">Onaylandı</span>`;
      } else if (st.includes('red') || st.includes('reject')) {
        statusBadge = `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100/80 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">Reddedildi</span>`;
      } else {
        statusBadge = `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/80 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">Beklemede</span>`;
      }

      // Render columns based on active tab
      if (this.activeTab === 'pending') {
        const actionsHtml = `
          <div class="flex items-center justify-center gap-2">
            <button class="btn-approve-leave w-8 h-8 flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 rounded-lg transition-colors cursor-pointer" data-id="${item?.id}" title="Onayla">
              <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
            </button>
            <button class="btn-reject-leave w-8 h-8 flex items-center justify-center bg-rose-100 hover:bg-rose-200 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 rounded-lg transition-colors cursor-pointer" data-id="${item?.id}" title="Reddet">
              <i data-lucide="x" class="w-4 h-4 stroke-[3]"></i>
            </button>
          </div>
        `;

        return `
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
            <!-- Personel Column -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                  ${initials}
                </div>
                <div class="font-bold text-slate-900 dark:text-white text-sm">
                  ${fullName}
                </div>
              </div>
            </td>

            <!-- İzin Türü -->
            <td class="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
              ${item?.leaveType || 'Yıllık İzin'}
            </td>

            <!-- Tarih Aralığı -->
            <td class="px-6 py-4">
              <div class="font-bold text-slate-800 dark:text-slate-200">${dateRangeDisplay}</div>
              <div class="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">(${workDays} İş Günü)</div>
            </td>

            <!-- Durum -->
            <td class="px-6 py-4">
              ${statusBadge}
            </td>

            <!-- İşlemler -->
            <td class="px-6 py-4">
              ${actionsHtml}
            </td>
          </tr>
        `;
      } else {
        // Approved / Rejected Tab: Show ONAYLAYAN and YÖNETİCİ NOTU
        const approvedBy = item?.approvedBy || item?.adminName || item?.processedBy || 'Sistem Yöneticisi';
        const adminNote = item?.adminNote || item?.note || item?.rejectionReason || '—';

        return `
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
            <!-- Personel Column -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                  ${initials}
                </div>
                <div class="font-bold text-slate-900 dark:text-white text-sm">
                  ${fullName}
                </div>
              </div>
            </td>

            <!-- İzin Türü -->
            <td class="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
              ${item?.leaveType || 'Yıllık İzin'}
            </td>

            <!-- Tarih Aralığı -->
            <td class="px-6 py-4">
              <div class="font-bold text-slate-800 dark:text-slate-200">${dateRangeDisplay}</div>
              <div class="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">(${workDays} İş Günü)</div>
            </td>

            <!-- Durum -->
            <td class="px-6 py-4">
              ${statusBadge}
            </td>

            <!-- ONAYLAYAN / REDDEDEN -->
            <td class="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
              ${approvedBy}
            </td>

            <!-- YÖNETİCİ NOTU -->
            <td class="px-6 py-4 relative group">
              <div class="max-w-xs truncate font-medium text-slate-600 dark:text-slate-400 cursor-help" title="${adminNote}">
                ${adminNote}
              </div>
              ${adminNote && adminNote !== '—' ? `
                <div class="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 text-xs rounded-xl shadow-2xl border border-slate-700 pointer-events-none transition-all duration-200">
                  <div class="font-bold text-[10px] text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <i data-lucide="message-square" class="w-3 h-3"></i> Yönetici Notu
                  </div>
                  <p class="leading-relaxed whitespace-pre-wrap font-medium">${adminNote}</p>
                  <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                </div>
              ` : ''}
            </td>
          </tr>
        `;
      }
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Event handlers for actions
    tbody.querySelectorAll('.btn-approve-leave').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (this.onApproveClick) this.onApproveClick(id);
      };
    });

    tbody.querySelectorAll('.btn-reject-leave').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (this.onRejectClick) this.onRejectClick(id);
      };
    });
  }

  getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
