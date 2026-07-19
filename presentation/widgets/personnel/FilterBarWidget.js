/**
 * FilterBarWidget manages search inputs and select department filters for employees.
 */
export class FilterBarWidget {
  constructor(onSearchInput, onDeptChange) {
    this.onSearchInput = onSearchInput;
    this.onDeptChange = onDeptChange;
  }

  render() {
    return `
      <!-- Filter bar -->
      <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div class="relative w-full sm:flex-1">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
          <input type="text" id="search-employees-input" placeholder="İsim veya departmana göre ara..." class="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-transparent focus:bg-white focus:border-slate-200 outline-hidden transition-all text-slate-700 dark:text-slate-200">
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <select id="select-employees-dept" class="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-800 outline-hidden focus:border-indigo-500 w-full sm:w-auto text-slate-600 dark:text-slate-300">
            <option value="all">Tüm Departmanlar</option>
            <option value="IT">IT</option>
            <option value="IK">IK</option>
            <option value="Tasarım">Tasarım</option>
            <option value="Yönetim">Yönetim</option>
          </select>
        </div>
      </div>
    `;
  }

  init() {
    const searchInput = document.getElementById('search-employees-input');
    if (searchInput && this.onSearchInput) {
      searchInput.oninput = (e) => this.onSearchInput(e.target.value);
    }

    const deptSelect = document.getElementById('select-employees-dept');
    if (deptSelect && this.onDeptChange) {
      deptSelect.onchange = (e) => this.onDeptChange(e.target.value);
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}
