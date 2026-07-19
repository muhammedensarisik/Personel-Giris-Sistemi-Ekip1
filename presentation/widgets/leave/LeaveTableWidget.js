/**
 * LeaveTableWidget renders the list of leave requests in a structured Data Table grid.
 */
export class LeaveTableWidget {
  /**
   * @param {Function} onApproveClick - callback when "Onayla" is clicked
   * @param {Function} onRejectClick - callback when "Reddet" is clicked
   */
  constructor(onApproveClick, onRejectClick) {
    this.onApproveClick = onApproveClick;
    this.onRejectClick = onRejectClick;
    this.leaveRequests = [];
  }

  render() {
    return `
      <!-- Leave Requests Data Table -->
      <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-xs">
            <thead>
              <tr class="border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/20 text-slate-500 font-semibold">
                <th class="px-6 py-4">Personel</th>
                <th class="px-6 py-4">İzin Türü</th>
                <th class="px-6 py-4">Başlangıç Tarihi</th>
                <th class="px-6 py-4">Bitiş Tarihi</th>
                <th class="px-6 py-4">Durum</th>
                <th class="px-6 py-4 text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody id="leave-table-body" class="divide-y divide-slate-100 dark:divide-dark-border">
              <!-- Dynamically populated rows -->
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Populate and update table content
   * @param {Array<LeaveRequest>} leaveRequests 
   * @param {Array<Personnel>} employees 
   */
  update(leaveRequests, employees) {
    this.leaveRequests = leaveRequests;
    const tbody = document.getElementById('leave-table-body');
    if (!tbody) return;

    if (!leaveRequests || leaveRequests?.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-8 text-center text-slate-400">İzin talebi kaydı bulunamadı.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = leaveRequests.map(item => {
      // Find employee details with safety checks
      const emp = employees?.find(e => e?.id === item?.userId) || { 
        fullName: 'Bilinmeyen Personel', 
        role: 'Bilinmeyen', 
        department: 'Bilinmeyen', 
        avatar: 'BP' 
      };

      const startDateText = typeof item?.getFormattedStartDate === 'function' ? item.getFormattedStartDate() : item?.startDate;
      const endDateText = typeof item?.getFormattedEndDate === 'function' ? item.getFormattedEndDate() : item?.endDate;

      // Color coding for status (Simple Mode)
      let badgeStyle = 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20'; // default Pending (Beklemede)
      const rawStatus = item?.status?.toLowerCase() || 'pending';
      let displayStatus = item?.status || 'Beklemede';
      let showActions = true;

      if (rawStatus.includes('onay') || rawStatus.includes('approve') || rawStatus === 'aktif') {
        badgeStyle = 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20';
        displayStatus = 'Onaylandı';
        showActions = false;
      } else if (rawStatus.includes('red') || rawStatus.includes('reject') || rawStatus === 'iptal') {
        badgeStyle = 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20';
        displayStatus = 'Reddedildi';
        showActions = false;
      }

      // Action buttons html
      let actionsHtml = '';
      if (showActions) {
        actionsHtml = `
          <div class="flex items-center justify-end gap-2">
            <button class="btn-approve-leave px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 dark:text-emerald-400 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer" data-id="${item?.id}">
              Onayla
            </button>
            <button class="btn-reject-leave px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 dark:text-rose-400 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer" data-id="${item?.id}">
              Reddet
            </button>
          </div>
        `;
      } else {
        actionsHtml = `<span class="text-slate-400 font-medium pr-4">—</span>`;
      }

      return `
        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                ${emp?.avatar || '??'}
              </div>
              <div>
                <div class="font-semibold text-slate-900 dark:text-white">${emp?.fullName || 'Bilinmeyen'}</div>
                <div class="text-[10px] text-slate-400 font-medium">${emp?.department || 'Bilinmeyen'}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
            ${item?.leaveType || 'Yıllık İzin'}
          </td>
          <td class="px-6 py-4 text-slate-600 dark:text-slate-400">${startDateText}</td>
          <td class="px-6 py-4 text-slate-600 dark:text-slate-400">${endDateText}</td>
          <td class="px-6 py-4">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeStyle}">
              ${displayStatus}
            </span>
          </td>
          <td class="px-6 py-4 text-right">
            ${actionsHtml}
          </td>
        </tr>
      `;
    }).join('');

    // Bind event listeners for actions
    const approveBtns = tbody.querySelectorAll('.btn-approve-leave');
    approveBtns.forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (this.onApproveClick) this.onApproveClick(id);
      };
    });

    const rejectBtns = tbody.querySelectorAll('.btn-reject-leave');
    rejectBtns.forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (this.onRejectClick) this.onRejectClick(id);
      };
    });
  }
}
