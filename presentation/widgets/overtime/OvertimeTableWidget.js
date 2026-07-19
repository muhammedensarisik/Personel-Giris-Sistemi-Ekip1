/**
 * OvertimeTableWidget renders the list of overtimes inside a structured Data Table grid.
 */
export class OvertimeTableWidget {
  /**
   * @param {Function} onEditClick - callback when "Düzenle" is clicked
   * @param {Function} onDeleteClick - callback when "Sil" is clicked
   */
  constructor(onEditClick, onDeleteClick) {
    this.onEditClick = onEditClick;
    this.onDeleteClick = onDeleteClick;
    this.overtimes = [];
  }

  render() {
    return `
      <!-- Overtime Data Table -->
      <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-xs">
            <thead>
              <tr class="border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/20 text-slate-500 font-semibold">
                <th class="px-6 py-4">Personel İsmi</th>
                <th class="px-6 py-4">Tarih</th>
                <th class="px-6 py-4">Çalışılan Saat</th>
                <th class="px-6 py-4">Açıklama</th>
                <th class="px-6 py-4 text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody id="overtime-table-body" class="divide-y divide-slate-100 dark:divide-dark-border">
              <!-- Dynamically populated rows -->
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Populate and update table content
   * @param {Array<Overtime>} overtimes 
   * @param {Array<Personnel>} employees 
   */
  update(overtimes, employees) {
    this.overtimes = overtimes;
    const tbody = document.getElementById('overtime-table-body');
    if (!tbody) return;

    if (!overtimes || overtimes?.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-8 text-center text-slate-400">Fazla mesai kaydı bulunamadı.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = overtimes.map(item => {
      // Find employee details
      const emp = employees?.find(e => e?.id === item?.userId) || { 
        fullName: 'Bilinmeyen Personel', 
        role: 'Bilinmeyen', 
        department: 'Bilinmeyen', 
        avatar: 'BP' 
      };

      const displayDate = typeof item?.getFormattedDate === 'function' ? item.getFormattedDate() : item?.date;

      return `
        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                ${emp?.avatar || '??'}
              </div>
              <div>
                <div class="font-semibold text-slate-900 dark:text-white">${emp?.fullName || 'Bilinmeyen'}</div>
                <div class="text-[10px] text-slate-400 font-medium">${emp?.role || 'Bilinmeyen'}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 text-slate-500 dark:text-slate-400">${displayDate}</td>
          <td class="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">${item?.hours || 0} saat</td>
          <td class="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">${item?.description || '—'}</td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button class="btn-edit-overtime p-1 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer" data-id="${item?.id}" title="Düzenle">
                <i data-lucide="edit" class="w-3.5 h-3.5"></i>
              </button>
              <button class="btn-delete-overtime p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer" data-id="${item?.id}" title="Sil">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach click events
    const editBtns = tbody.querySelectorAll('.btn-edit-overtime');
    editBtns.forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (this.onEditClick) this.onEditClick(id);
      };
    });

    const deleteBtns = tbody.querySelectorAll('.btn-delete-overtime');
    deleteBtns.forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (this.onDeleteClick) this.onDeleteClick(id);
      };
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}
