/**
 * PersonnelTableWidget renders the table grid containing employee cards
 */
export class PersonnelTableWidget {
  constructor(onDeleteClick) {
    this.onDeleteClick = onDeleteClick;
  }

  /**
   * Render table shell
   */
  render() {
    return `
      <!-- Table Container -->
      <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/20 text-slate-500 text-xs font-semibold">
                <th class="px-6 py-4">Ad Soyad / Rol</th>
                <th class="px-6 py-4">Departman</th>
                <th class="px-6 py-4">Katılma Tarihi</th>
                <th class="px-6 py-4">Durum</th>
                <th class="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody id="employees-table-body" class="divide-y divide-slate-100 dark:divide-dark-border text-xs">
              <!-- populated dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Update table rows with fresh data
   * @param {Array<Personnel>} employees 
   */
  update(employees) {
    const tbody = document.getElementById('employees-table-body');
    if (!tbody) return;

    if (employees.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-8 text-center text-slate-400">Eşleşen personel bulunamadı.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = employees.map(emp => {
      const isPermitted = emp.status === 'Aktif';
      
      // Use getFormattedDate helper on Personnel entity
      const displayDate = typeof emp.getFormattedDate === 'function' ? emp.getFormattedDate() : emp.createdAt;

      return `
        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                ${emp.avatar}
              </div>
              <div>
                <div class="font-semibold text-slate-900 dark:text-white">${emp.fullName}</div>
                <div class="text-[10px] text-slate-400 font-medium">${emp.role}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4">
            <span class="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">${emp.department}</span>
          </td>
          <td class="px-6 py-4 text-slate-500 dark:text-slate-400">${displayDate}</td>
          <td class="px-6 py-4">
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${isPermitted ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20' : 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20'}">
              <span class="w-1.5 h-1.5 rounded-full ${isPermitted ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
              ${emp.status}
            </span>
          </td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer" onclick="window.showToast('Düzenleme işlevi yakında eklenecek!', 'warning')" title="Düzenle">
                <i data-lucide="edit" class="w-3.5 h-3.5"></i>
              </button>
              <button class="btn-delete-employee p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer" data-id="${emp.id}" title="Sil">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Set up delete event listeners
    const deleteBtns = tbody.querySelectorAll('.btn-delete-employee');
    deleteBtns.forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.getAttribute('data-id'));
        if (this.onDeleteClick) {
          this.onDeleteClick(id);
        }
      };
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}
