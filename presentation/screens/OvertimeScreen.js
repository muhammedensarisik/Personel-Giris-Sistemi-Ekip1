import { OvertimeTableWidget } from '../widgets/overtime/OvertimeTableWidget.js';

/**
 * OvertimeScreen coordinates fetching and displaying extra hours worked by employees
 */
export class OvertimeScreen {
  constructor(personnelRepository) {
    this.repo = personnelRepository;
    
    this.overtimes = [];
    this.employees = [];

    // Instantiate modular child widgets
    this.tableWidget = new OvertimeTableWidget(
      (id) => this.handleEdit(id),
      (id) => this.handleDelete(id)
    );
  }

  /**
   * Main render page shell
   * @param {HTMLElement} container 
   */
  async render(container) {
    container.innerHTML = `
      <!-- Header -->
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Fazla Mesailer</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Personellerin aylık ve haftalık fazla mesai çalışma listeleri.</p>
        </div>
        <button id="btn-add-overtime" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i> Fazla Mesai Tanımla
        </button>
      </div>

      <!-- Table widget placement -->
      <div id="overtime-table-placement">
        ${this.tableWidget.render()}
      </div>
    `;

    // Bind add button
    const addBtn = document.getElementById('btn-add-overtime');
    if (addBtn) {
      addBtn.onclick = () => {
        if (typeof window.showToast === 'function') {
          window.showToast('Fazla mesai tanımlama işlevi yakında eklenecek!', 'warning');
        }
      };
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Load and update
    await this.loadData();
  }

  async loadData() {
    this.overtimes = await this.repo.getOvertimes();
    this.employees = await this.repo.getAll();
    this.tableWidget.update(this.overtimes, this.employees);
  }

  handleEdit(id) {
    if (typeof window.showToast === 'function') {
      window.showToast(`Düzenleme Modu (ID: ${id}) yakında eklenecek!`, 'info');
    }
  }

  async handleDelete(id) {
    if (confirm('Bu fazla mesai kaydını silmek istediğinizden emin misiniz?')) {
      const success = await this.repo.deleteOvertime(id);
      if (success) {
        await this.loadData();
      }
    }
  }
}
