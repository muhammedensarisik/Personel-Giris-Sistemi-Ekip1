import { FilterBarWidget } from '../widgets/personnel/FilterBarWidget.js';
import { PersonnelTableWidget } from '../widgets/personnel/PersonnelTableWidget.js';
import { GetAllPersonnelUseCase } from '../../domain/usecases/GetAllPersonnelUseCase.js';
import { DeletePersonnelUseCase } from '../../domain/usecases/DeletePersonnelUseCase.js';

/**
 * PersonnelScreen manages employees UI filters and table listings.
 */
export class PersonnelScreen {
  constructor(personnelRepository) {
    this.repo = personnelRepository;
    this.getAllUseCase = new GetAllPersonnelUseCase(this.repo);
    this.deleteUseCase = new DeletePersonnelUseCase(this.repo);

    this.allEmployees = [];
    this.searchQuery = '';
    this.selectedDept = 'all';

    // Instantiate widgets
    this.filterWidget = new FilterBarWidget(
      (query) => this.handleSearch(query),
      (dept) => this.handleDeptChange(dept)
    );

    this.tableWidget = new PersonnelTableWidget(
      (id) => this.handleDelete(id)
    );
  }

  /**
   * Main render page shell
   * @param {HTMLElement} container 
   */
  async render(container) {
    container.innerHTML = `
      <!-- Breadcrumb / Header -->
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Personel Listesi</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Şirketteki tüm aktif ve izinli personellerin yönetimi.</p>
        </div>
        <button id="btn-add-emp-screen" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i> Yeni Personel Ekle
        </button>
      </div>

      <!-- Filter bar widget placement -->
      <div id="personnel-filter-container">
        ${this.filterWidget.render()}
      </div>

      <!-- Table widget placement -->
      <div id="personnel-table-container">
        ${this.tableWidget.render()}
      </div>
    `;

    // Bind event listeners
    this.filterWidget.init();
    
    // Add employee trigger
    const addBtn = document.getElementById('btn-add-emp-screen');
    if (addBtn) {
      addBtn.onclick = () => {
        if (typeof window.toggleAddEmployeeModal === 'function') {
          window.toggleAddEmployeeModal();
        }
      };
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Load data
    await this.loadEmployees();
  }

  async loadEmployees() {
    this.allEmployees = await this.getAllUseCase.execute();
    this.applyFilters();
  }

  handleSearch(query) {
    this.searchQuery = query;
    this.applyFilters();
  }

  handleDeptChange(dept) {
    this.selectedDept = dept;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allEmployees];

    // Search query filter (matches fullName or department)
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.fullName.toLowerCase().includes(q) || 
        e.department.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q)
      );
    }

    // Dropdown department filter
    if (this.selectedDept !== 'all') {
      filtered = filtered.filter(e => e.department === this.selectedDept);
    }

    // Update UI table rows
    this.tableWidget.update(filtered);
  }

  async handleDelete(id) {
    const success = await this.deleteUseCase.execute(id);
    if (success) {
      // Reload and re-filter
      await this.loadEmployees();
    }
  }
}
