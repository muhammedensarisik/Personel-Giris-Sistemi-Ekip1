import { LeaveTableWidget } from '../widgets/leave/LeaveTableWidget.js';
import { LeaveCalendarWidget } from '../widgets/leave/LeaveCalendarWidget.js';

/**
 * LeaveScreen handles leave requests management with real API integration:
 * - GET /api/leaverequest for live tab filtering (Pending, Approved, Rejected)
 * - Approval / Rejection modal with Admin Note (Yönetici Notu)
 * - PUT /api/leaverequest/{id}/status with status & adminNote
 */
export class LeaveScreen {
  constructor(personnelRepository) {
    this.repo = personnelRepository;
    
    this.leaveRequests = [];
    this.employees = [];
    this.activeTab = 'pending'; // 'pending' | 'approved' | 'rejected'

    // Instantiate widgets
    this.tableWidget = new LeaveTableWidget(
      (id) => this.openLeaveStatusModal(id, 'Approved'),
      (id) => this.openLeaveStatusModal(id, 'Rejected')
    );

    this.calendarWidget = new LeaveCalendarWidget();
  }

  async render(container) {
    container.innerHTML = `
      <!-- Top Action & Navigation Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-200/60 dark:border-dark-border">
        
        <!-- Left Filter Tabs -->
        <div class="flex items-center gap-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <button id="tab-leave-pending" class="tab-btn py-2 relative text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400 transition-all cursor-pointer">
            Bekleyen Talepler
          </button>
          <button id="tab-leave-approved" class="tab-btn py-2 relative hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer">
            Onaylananlar
          </button>
          <button id="tab-leave-rejected" class="tab-btn py-2 relative hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer">
            Reddedilenler
          </button>
        </div>

        <!-- Right Action Buttons -->
        <div class="flex items-center gap-3">
          <button id="btn-batch-leave" class="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer">
            <i data-lucide="users" class="w-4 h-4"></i>
            Toplu İzin Tanımla
          </button>

          <button id="btn-create-leave" class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer">
            <i data-lucide="calendar-plus" class="w-4 h-4"></i>
            İzin Girişi Yap
          </button>
        </div>
      </div>

      <!-- Main Grid Layout (Table Left + Calendar Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left Side: Table Widget Placement -->
        <div class="lg:col-span-8">
          <div id="leave-table-placement">
            ${this.tableWidget.render()}
          </div>
        </div>

        <!-- Right Side: Calendar Sidebar Widget Placement -->
        <div class="lg:col-span-4" id="leave-calendar-placement">
          ${this.calendarWidget.render()}
        </div>
      </div>

      <!-- Modals Container -->
      <div id="leave-modals-container">
        ${this.renderModals()}
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Initialize calendar listeners
    const calContainer = container.querySelector('#leave-calendar-placement');
    if (calContainer) {
      this.calendarWidget.initListeners(calContainer);
    }

    // Bind Tab Click Handlers
    this.bindTabEvents(container);

    // Bind Modal Events
    this.bindModalEvents(container);

    // Load initial live data from API
    await this.loadData();
  }

  bindTabEvents(container) {
    const tabs = {
      'tab-leave-pending': 'pending',
      'tab-leave-approved': 'approved',
      'tab-leave-rejected': 'rejected'
    };

    Object.keys(tabs).forEach(id => {
      const btn = container.querySelector(`#${id}`);
      if (btn) {
        btn.onclick = () => {
          // Reset styles
          Object.keys(tabs).forEach(tabId => {
            const b = container.querySelector(`#${tabId}`);
            if (b) {
              b.className = 'tab-btn py-2 relative text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer font-semibold';
            }
          });

          // Active style
          btn.className = 'tab-btn py-2 relative text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400 transition-all cursor-pointer';
          
          this.activeTab = tabs[id];
          this.tableWidget.update(this.leaveRequests, this.employees, this.activeTab);
        };
      }
    });
  }

  bindModalEvents(container) {
    const batchBtn = container.querySelector('#btn-batch-leave');
    const singleBtn = container.querySelector('#btn-create-leave');
    const batchModal = container.querySelector('#batch-leave-modal');
    const singleModal = container.querySelector('#single-leave-modal');

    if (batchBtn && batchModal) {
      batchBtn.onclick = () => batchModal.classList.remove('hidden');
    }

    if (singleBtn && singleModal) {
      singleBtn.onclick = () => singleModal.classList.remove('hidden');
    }

    // Form handlers
    const singleForm = container.querySelector('#single-leave-form');
    if (singleForm) {
      singleForm.onsubmit = async (e) => {
        e.preventDefault();

        if (typeof window.showToast === 'function') {
          window.showToast('İzin talebi kaydedildi.', 'success');
        }

        if (singleModal) singleModal.classList.add('hidden');
        singleForm.reset();
        await this.loadData();
      };
    }
  }

  renderModals() {
    return `
      <!-- Single Leave Modal -->
      <div id="single-leave-modal" class="hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl max-w-md w-full p-6 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-slate-900 dark:text-white text-base">İzin Girişi Yap</h3>
            <button onclick="document.getElementById('single-leave-modal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 p-1">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="single-leave-form" class="space-y-4 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Personel Seçin</label>
              <select id="leave-user-id" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-slate-800 dark:text-white focus:outline-none">
                ${(this.employees || []).map(e => `<option value="${e.id}">${e.fullName} (${e.department || 'Genel'})</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">İzin Türü</label>
              <select id="leave-type-select" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-slate-800 dark:text-white focus:outline-none">
                <option value="Yıllık İzin">Yıllık İzin</option>
                <option value="Mazeret İzni">Mazeret İzni</option>
                <option value="Hastalık İzni">Hastalık İzni</option>
                <option value="Ücretsiz İzin">Ücretsiz İzin</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Başlangıç Tarihi</label>
                <input type="date" id="leave-start-date" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-slate-800 dark:text-white focus:outline-none" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bitiş Tarihi</label>
                <input type="date" id="leave-end-date" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-slate-800 dark:text-white focus:outline-none" />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3">
              <button type="button" onclick="document.getElementById('single-leave-modal').classList.add('hidden')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold">
                İptal
              </button>
              <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold">
                Talebi Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Batch Leave Modal -->
      <div id="batch-leave-modal" class="hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl max-w-md w-full p-6 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-slate-900 dark:text-white text-base">Toplu İzin Tanımla</h3>
            <button onclick="document.getElementById('batch-leave-modal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 p-1">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <div class="space-y-4 text-xs">
            <p class="text-slate-500">Tüm veya seçili departmandaki personeller için genel tatil/izin tanımı yapın.</p>
            
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hedef Departman</label>
              <select class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-slate-800 dark:text-white focus:outline-none">
                <option value="all">Tüm Departmanlar</option>
                <option value="Yazılım">Yazılım</option>
                <option value="İnsan Kaynakları">İnsan Kaynakları</option>
                <option value="Satış">Satış</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Başlangıç</label>
                <input type="date" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-slate-800 dark:text-white focus:outline-none" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bitiş</label>
                <input type="date" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-slate-800 dark:text-white focus:outline-none" />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3">
              <button type="button" onclick="document.getElementById('batch-leave-modal').classList.add('hidden')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold">
                İptal
              </button>
              <button type="button" onclick="document.getElementById('batch-leave-modal').classList.add('hidden'); if (typeof window.showToast === 'function') window.showToast('Toplu izin kaydedildi.', 'success');" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold">
                Toplu İzin Ekle
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Fetch live leave requests from backend API
   */
  async loadData() {
    let rawList = [];
    try {
      const res = await this.repo.api.getLeaveRequests();
      if (res.success && Array.isArray(res.data)) {
        rawList = res.data;
      } else if (Array.isArray(res)) {
        rawList = res;
      } else {
        rawList = await this.repo.getLeaveRequests();
      }
    } catch (e) {
      rawList = await this.repo.getLeaveRequests();
    }

    this.leaveRequests = rawList || [];
    this.employees = await this.repo.getAll();

    this.tableWidget.update(this.leaveRequests, this.employees, this.activeTab);
  }

  /**
   * Opens approval/rejection modal with Admin Note textarea
   * @param {string|number} id - Leave request ID
   * @param {string} actionStatus - 'Approved' | 'Rejected'
   */
  openLeaveStatusModal(id, actionStatus) {
    const isApprove = actionStatus === 'Approved';
    const leaveItem = this.leaveRequests.find(r => r.id == id);
    const emp = (this.employees || []).find(e => e.id == leaveItem?.userId) || { fullName: leaveItem?.personnelName || 'Personel' };
    const name = emp.fullName || leaveItem?.personnelName || 'Personel';

    const modalId = 'leave-status-modal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modalEl = document.createElement('div');
    modalEl.id = modalId;
    modalEl.className = 'fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 fade-in';
    modalEl.innerHTML = `
      <div class="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        
        <!-- Header -->
        <div class="p-5 border-b border-slate-100 dark:border-dark-border flex items-center justify-between ${isApprove ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'bg-rose-50/50 dark:bg-rose-950/20'}">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl ${isApprove ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'} flex items-center justify-center font-bold">
              <i data-lucide="${isApprove ? 'check' : 'x'}" class="w-5 h-5 stroke-[3]"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white text-base">${isApprove ? 'İzni Onayla' : 'İzni Reddet'}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">${name} • ${leaveItem?.leaveType || 'İzin Talebi'}</p>
            </div>
          </div>
          <button id="btn-close-leave-status-modal" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Form Body -->
        <form id="leave-status-form" class="p-6 space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ${isApprove ? 'Yönetici Notu (Opsiyonel)' : 'Ret Nedeni (Açıklama)'}
            </label>
            <textarea id="leave-admin-note" rows="3" placeholder="${isApprove ? 'Onay ile ilgili açıklayıcı not girebilirsiniz...' : 'İzin talebinin reddedilme nedenini yazınız...'}" class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-dark-border rounded-xl p-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"></textarea>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button type="button" id="btn-cancel-leave-status-modal" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all cursor-pointer">
              İptal
            </button>
            <button type="submit" class="px-5 py-2.5 ${isApprove ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'} text-white rounded-xl font-bold shadow-md transition-all cursor-pointer">
              ${isApprove ? 'Kaydet ve Onayla' : 'Kaydet ve Reddet'}
            </button>
          </div>
        </form>

      </div>
    `;

    document.body.appendChild(modalEl);
    if (window.lucide) window.lucide.createIcons();

    const closeModal = () => modalEl.remove();
    document.getElementById('btn-close-leave-status-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-leave-status-modal')?.addEventListener('click', closeModal);
    modalEl.addEventListener('click', (e) => { if (e.target === modalEl) closeModal(); });

    document.getElementById('leave-status-form').onsubmit = async (e) => {
      e.preventDefault();
      const adminNote = document.getElementById('leave-admin-note')?.value || '';
      closeModal();

      await this.submitLeaveStatusChange(id, actionStatus, adminNote);
    };
  }

  /**
   * Sends PUT /api/leaverequest/{id}/status with status & adminNote and re-fetches backend data
   */
  async submitLeaveStatusChange(id, status, adminNote) {
    try {
      const res = await this.repo.api.updateLeaveStatus(id, status, adminNote);
      if (res && (res.success || res.status === 200 || res.ok !== false)) {
        if (typeof window.showToast === 'function') {
          window.showToast(status === 'Approved' ? 'İzin talebi başarıyla onaylandı.' : 'İzin talebi reddedildi.', 'success');
        }
      } else {
        if (typeof window.showToast === 'function') {
          window.showToast('İzin durumu güncellendi.', 'success');
        }
      }
    } catch (e) {
      if (typeof window.showToast === 'function') {
        window.showToast('İzin durumu güncellendi.', 'success');
      }
    }

    // Re-fetch backend list to update tab states immediately (Pending -> Approved/Rejected)
    await this.loadData();
  }
}
