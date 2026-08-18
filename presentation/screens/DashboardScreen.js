import { StatsWidget } from '../widgets/dashboard/StatsWidget.js';
import { ChartWidget } from '../widgets/dashboard/ChartWidget.js';
import { RecentLogsTableWidget } from '../widgets/dashboard/RecentLogsTableWidget.js';
import { DelayStatusWidget } from '../widgets/dashboard/DelayStatusWidget.js';
import { QuickActionsAndLeaveWidget } from '../widgets/dashboard/QuickActionsAndLeaveWidget.js';

/**
 * DashboardScreen - Core Dashboard View Controller
 * Features:
 * - Drag and Drop (Sürükle ve Bırak) reorderable layout for all widgets.
 * - Layout state persistence in localStorage ('antigravity_dashboard_layout').
 * - Reset Layout ('Düzeni Sıfırla') action button.
 */
export class DashboardScreen {
  constructor(personnelRepository) {
    this.repo = personnelRepository;
    
    // Instantiate modular child widgets
    this.statsWidget = new StatsWidget();
    this.chartWidget = new ChartWidget();
    this.recentLogsWidget = new RecentLogsTableWidget(() => this.refreshRecentLogs());
    this.delayStatusWidget = new DelayStatusWidget();
    this.quickActionsLeaveWidget = new QuickActionsAndLeaveWidget(
      (id) => this.handleApproveLeave(id),
      (id) => this.handleRejectLeave(id)
    );
  }

  /**
   * Main render page shell
   * @param {HTMLElement} container - The DOM target
   */
  async render(container) {
    // Show Loading skeleton screen first
    container.innerHTML = this.getSkeletonHtml();
    if (window.lucide) window.lucide.createIcons();

    // 1. Fetch live stats from GET /api/dashboard/stats
    let stats = { totalPersonnel: 0, activePersonnel: 0, onLeavePersonnel: 0, absentPersonnel: 0, latePersonnel: 0, pendingLeaves: 0 };
    try {
      const statsRes = await this.repo.api.getDashboardStats();
      if (statsRes.success && statsRes.data) {
        stats = statsRes.data;
      } else if (statsRes && (statsRes.totalPersonnel !== undefined || statsRes.totalEmployees !== undefined)) {
        stats = statsRes;
      } else {
        stats = await this.repo.getStats();
      }
    } catch (e) {
      stats = await this.repo.getStats();
    }

    // 2. Fetch live recent attendance logs from GET /api/attendance/recent
    let recentLogs = [];
    try {
      const recentRes = await this.repo.api.getAttendanceRecent();
      if (recentRes && Array.isArray(recentRes.data)) {
        recentLogs = recentRes.data;
      } else if (recentRes && recentRes.success && Array.isArray(recentRes.data)) {
        recentLogs = recentRes.data;
      } else if (Array.isArray(recentRes)) {
        recentLogs = recentRes;
      } else {
        recentLogs = await this.repo.getLogs();
      }
    } catch (e) {
      recentLogs = await this.repo.getLogs();
    }

    // 3. Fetch live pending leave requests from GET /api/dashboard/pending-leaves
    let pendingLeavesList = [];
    try {
      const pendingRes = await this.repo.api.getDashboardPendingLeaves();
      if (pendingRes.success && Array.isArray(pendingRes.data)) {
        pendingLeavesList = pendingRes.data;
      } else if (Array.isArray(pendingRes)) {
        pendingLeavesList = pendingRes;
      } else if (typeof this.repo.getLeaveRequests === 'function') {
        pendingLeavesList = await this.repo.getLeaveRequests();
      }
    } catch (e) {
      pendingLeavesList = typeof this.repo.getLeaveRequests === 'function' ? await this.repo.getLeaveRequests() : [];
    }

    const employees = await this.repo.getAll();

    // Get logged in user name dynamically from localStorage
    const userName = this.getLoggedInUserName();

    // Calculate KPI stats directly from raw API data (dumb component architecture)
    const rawApiStats = this.calculateRawApiStats(stats, employees, recentLogs, pendingLeavesList);

    // Default HTML structure for 5 draggable widgets
    const defaultWidgets = {
      'widget-stats': this.statsWidget.render(rawApiStats),
      'widget-recent-logs': this.recentLogsWidget.render(),
      'widget-donut-charts': this.delayStatusWidget.render(),
      'widget-quick-actions': this.quickActionsLeaveWidget.renderQuickActions(),
      'widget-leave-requests': this.quickActionsLeaveWidget.renderLeaveRequests()
    };

    // Render Main Layout Shell with Reset Layout button
    container.innerHTML = `
      <!-- Welcome Banner & Reset Layout Header Section -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Hoş geldiniz, ${userName} 👋</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">İşletmenizin bugünkü genel performans ve katılım durum özeti.</p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Reset Layout Button -->
          <button id="btn-reset-dashboard-layout" class="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer" title="Sürüklenmiş düzeni orijinal haline döndür">
            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Düzeni Sıfırla
          </button>

          <button id="btn-watch-entries" class="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
            Girişleri İzle
          </button>
          <button id="btn-add-emp-dashboard" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer">
            <i data-lucide="plus" class="w-4 h-4"></i> Yeni Personel Ekle
          </button>
        </div>
      </div>

      <!-- Top Drop Zone (Stats KPI Row) -->
      <div id="top-widget-container" class="dashboard-drop-zone min-h-[50px] mb-8">
        ${defaultWidgets['widget-stats']}
      </div>

      <!-- Main Dashboard Grid Layout (Sol: col-span-8, Sağ: col-span-4) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Drop Zone Column (Ana Alan) -->
        <div id="left-widget-container" class="dashboard-drop-zone lg:col-span-8 space-y-6 min-h-[300px]">
          ${defaultWidgets['widget-recent-logs']}
        </div>

        <!-- Right Drop Zone Column (Analiz & İşlemler) -->
        <div id="right-widget-container" class="dashboard-drop-zone lg:col-span-4 space-y-6 min-h-[300px]">
          ${defaultWidgets['widget-donut-charts']}
          ${defaultWidgets['widget-quick-actions']}
          ${defaultWidgets['widget-leave-requests']}
        </div>

      </div>
    `;

    // Restore saved layout if present in localStorage
    this.restoreSavedLayout(defaultWidgets);

    // Initialize Donut Charts and Update Data Tables
    this.delayStatusWidget.init();
    this.recentLogsWidget.update(recentLogs, employees);
    this.quickActionsLeaveWidget.update(pendingLeavesList, employees);
    this.quickActionsLeaveWidget.initListeners();

    // Enable HTML5 Drag & Drop reordering
    this.initDraggableWidgets();

    // Reset Layout button handler
    const resetLayoutBtn = document.getElementById('btn-reset-dashboard-layout');
    if (resetLayoutBtn) {
      resetLayoutBtn.onclick = () => this.resetDashboardLayout(container);
    }

    // Event Listeners for Header Action Buttons
    const watchEntriesBtn = document.getElementById('btn-watch-entries');
    if (watchEntriesBtn) {
      watchEntriesBtn.onclick = () => window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'logs' } }));
    }

    const addEmpBtn = document.getElementById('btn-add-emp-dashboard');
    if (addEmpBtn) {
      addEmpBtn.onclick = () => {
        if (typeof window.toggleAddEmployeeModal === 'function') {
          window.toggleAddEmployeeModal();
        }
      };
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Restores widget position hierarchy from localStorage ('antigravity_dashboard_layout')
   */
  restoreSavedLayout(defaultWidgets) {
    try {
      const savedStr = localStorage.getItem('antigravity_dashboard_layout');
      if (!savedStr) return;

      const savedLayout = JSON.parse(savedStr);
      if (!savedLayout || typeof savedLayout !== 'object') return;

      const topZone = document.getElementById('top-widget-container');
      const leftZone = document.getElementById('left-widget-container');
      const rightZone = document.getElementById('right-widget-container');

      if (!topZone || !leftZone || !rightZone) return;

      // Clear default container contents
      topZone.innerHTML = '';
      leftZone.innerHTML = '';
      rightZone.innerHTML = '';

      const placedWidgetIds = new Set();

      const placeZoneWidgets = (zoneEl, widgetIds = []) => {
        widgetIds.forEach(id => {
          if (defaultWidgets[id] && !placedWidgetIds.has(id)) {
            const temp = document.createElement('div');
            temp.innerHTML = defaultWidgets[id];
            const firstChild = temp.firstElementChild;
            if (firstChild) {
              zoneEl.appendChild(firstChild);
              placedWidgetIds.add(id);
            }
          }
        });
      };

      if (Array.isArray(savedLayout.top)) placeZoneWidgets(topZone, savedLayout.top);
      if (Array.isArray(savedLayout.left)) placeZoneWidgets(leftZone, savedLayout.left);
      if (Array.isArray(savedLayout.right)) placeZoneWidgets(rightZone, savedLayout.right);

      // Append any unplaced widgets back to default fallback locations
      Object.keys(defaultWidgets).forEach(id => {
        if (!placedWidgetIds.has(id)) {
          const temp = document.createElement('div');
          temp.innerHTML = defaultWidgets[id];
          if (id === 'widget-stats') topZone.appendChild(temp.firstElementChild);
          else if (id === 'widget-recent-logs') leftZone.appendChild(temp.firstElementChild);
          else rightZone.appendChild(temp.firstElementChild);
        }
      });

    } catch (e) {
      // Ignore layout restoration error
    }
  }

  /**
   * Sets up native HTML5 Drag and Drop handlers for all .dashboard-draggable-widget elements
   */
  initDraggableWidgets() {
    let draggedElement = null;
    const widgetCards = document.querySelectorAll('.dashboard-draggable-widget');
    const dropZones = document.querySelectorAll('.dashboard-drop-zone');

    widgetCards.forEach(card => {
      // Make card draggable
      card.setAttribute('draggable', 'true');

      card.addEventListener('dragstart', (e) => {
        draggedElement = card;
        card.classList.add('opacity-40', 'scale-[0.98]', 'shadow-2xl');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.id);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('opacity-40', 'scale-[0.98]', 'shadow-2xl');
        dropZones.forEach(z => z.classList.remove('ring-2', 'ring-indigo-500/50', 'ring-dashed'));
        widgetCards.forEach(c => c.classList.remove('border-indigo-500', 'border-dashed', 'border-2'));
        draggedElement = null;
        this.saveDashboardLayout();
      });
    });

    dropZones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        zone.classList.add('ring-2', 'ring-indigo-500/50', 'ring-dashed');

        const afterElement = this.getDragAfterElement(zone, e.clientY);
        if (draggedElement) {
          if (afterElement == null) {
            zone.appendChild(draggedElement);
          } else {
            zone.insertBefore(draggedElement, afterElement);
          }
        }
      });

      zone.addEventListener('dragleave', (e) => {
        if (!zone.contains(e.relatedTarget)) {
          zone.classList.remove('ring-2', 'ring-indigo-500/50', 'ring-dashed');
        }
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('ring-2', 'ring-indigo-500/50', 'ring-dashed');
        this.saveDashboardLayout();
      });
    });
  }

  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.dashboard-draggable-widget:not(.opacity-40)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  /**
   * Saves current widget order per drop zone into localStorage ('antigravity_dashboard_layout')
   */
  saveDashboardLayout() {
    try {
      const topZone = document.getElementById('top-widget-container');
      const leftZone = document.getElementById('left-widget-container');
      const rightZone = document.getElementById('right-widget-container');

      if (!topZone || !leftZone || !rightZone) return;

      const getIds = (container) => [...container.children]
        .filter(el => el.classList.contains('dashboard-draggable-widget'))
        .map(el => el.id);

      const layoutState = {
        top: getIds(topZone),
        left: getIds(leftZone),
        right: getIds(rightZone)
      };

      localStorage.setItem('antigravity_dashboard_layout', JSON.stringify(layoutState));
    } catch (e) {
      // Ignore layout saving error
    }
  }

  /**
   * Computes KPI statistics directly from raw C# Backend API lists.
   * Pure presentation (dumb component architecture) without client-side RBAC filtering.
   */
  calculateRawApiStats(rawStats, employees = [], recentLogs = [], pendingLeavesList = []) {
    const totalCount = employees.length || rawStats.totalPersonnel || 0;

    const presentCount = recentLogs.filter(log => {
      const isInside = !log.checkOut || log.checkOut === '—' || String(log.checkOut).includes('0001-01-01');
      return isInside || log.status === 'Aktif' || log.status === 'Mevcut';
    }).length;

    const lateCount = recentLogs.filter(log => log.isLate || log.status === 'Geç Kalan').length;
    const onLeaveCount = employees.filter(emp => emp.status === 'İzinli' || emp.isOnLeave || emp.status === 'Leave').length;
    const absentCount = Math.max(0, totalCount - presentCount - onLeaveCount);
    const pendingLeaveCount = pendingLeavesList.length;

    return {
      totalPersonnel: totalCount,
      totalPersonnelSubtitle: 'Kayıtlı Kadro',
      cameToday: presentCount || rawStats.cameToday || 0,
      activePersonnel: presentCount || rawStats.activePersonnel || 0,
      lateToday: lateCount || rawStats.lateToday || 0,
      latePersonnel: lateCount || rawStats.latePersonnel || 0,
      absentToday: absentCount || rawStats.absentToday || 0,
      absentPersonnel: absentCount || rawStats.absentPersonnel || 0,
      onLeaveToday: onLeaveCount || rawStats.onLeaveToday || 0,
      onLeavePersonnel: onLeaveCount || rawStats.onLeavePersonnel || 0,
      pendingLeaves: pendingLeaveCount || rawStats.pendingLeaves || 0
    };
  }

  /**
   * Resets layout state and re-renders dashboard in default state
   */
  async resetDashboardLayout(container) {
    localStorage.removeItem('antigravity_dashboard_layout');
    await this.render(container);
  }

  /**
   * Re-fetches GET /api/dashboard/recent and updates recent logs table dynamically
   */
  async refreshRecentLogs() {
    try {
      const recentRes = await this.repo.api.getDashboardRecent();
      let recentLogs = [];
      if (recentRes.success && Array.isArray(recentRes.data)) {
        recentLogs = recentRes.data;
      } else if (Array.isArray(recentRes)) {
        recentLogs = recentRes;
      } else {
        recentLogs = await this.repo.getLogs();
      }
      const employees = await this.repo.getAll();
      this.recentLogsWidget.update(recentLogs, employees);
    } catch (e) {
      console.warn("Recent logs refresh failed:", e);
    }
  }

  /**
   * Opens centered Pop-up Modal for GET /api/dashboard/on-leave-today
   */
  async openOnLeaveTodayModal() {
    // Remove existing modal if present
    const existingModal = document.getElementById('on-leave-today-modal');
    if (existingModal) existingModal.remove();

    const modalWrapper = document.createElement('div');
    modalWrapper.id = 'on-leave-today-modal';
    modalWrapper.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs fade-in';
    modalWrapper.innerHTML = `
      <div class="w-full max-w-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        <!-- Modal Header -->
        <div class="p-5 border-b border-slate-100 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <i data-lucide="calendar-off" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white text-base">Şu An İzinli Olan Personeller</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Bugün izinli görünen tüm çalışanların listesi.</p>
            </div>
          </div>

          <!-- Close (X) Button -->
          <button id="btn-close-on-leave-modal" class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" title="Kapat">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Modal Body (Table Container) -->
        <div class="p-6 overflow-y-auto flex-1">
          <div class="overflow-x-auto rounded-xl border border-slate-100 dark:border-dark-border">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th class="py-3.5 px-4">PERSONEL ADI</th>
                  <th class="py-3.5 px-4">DEPARTMAN</th>
                  <th class="py-3.5 px-4">İZİN TÜRÜ</th>
                  <th class="py-3.5 px-4">BAŞLANGIÇ TARİHİ</th>
                  <th class="py-3.5 px-4 text-right">BİTİŞ TARİHİ</th>
                </tr>
              </thead>
              <tbody id="on-leave-today-tbody" class="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
                <tr>
                  <td colspan="5" class="py-12 text-center text-slate-400">
                    <div class="flex flex-col items-center justify-center">
                      <div class="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <span class="text-xs font-semibold text-slate-500">İzinli listesi çekiliyor (/api/dashboard/on-leave-today)...</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 border-t border-slate-100 dark:border-dark-border flex justify-end bg-slate-50/50 dark:bg-slate-800/30">
          <button id="btn-close-on-leave-modal-footer" class="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer">
            Kapat
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modalWrapper);
    if (window.lucide) window.lucide.createIcons();

    // Close logic handlers
    const closeModal = () => {
      modalWrapper.remove();
    };

    document.getElementById('btn-close-on-leave-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-close-on-leave-modal-footer')?.addEventListener('click', closeModal);

    modalWrapper.addEventListener('click', (e) => {
      if (e.target === modalWrapper) closeModal();
    });

    const escListener = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        window.removeEventListener('keydown', escListener);
      }
    };
    window.addEventListener('keydown', escListener);

    // Fetch data from GET /api/dashboard/on-leave-today
    await this.loadOnLeaveTodayTable();
  }

  async loadOnLeaveTodayTable() {
    const tbody = document.getElementById('on-leave-today-tbody');
    if (!tbody) return;

    try {
      let leaves = await this.repo.getCurrentLeaves();
      if (!leaves || leaves.length === 0) {
        const res = await this.repo.api.getOnLeaveToday();
        if (res.success && Array.isArray(res.data)) {
          leaves = res.data;
        } else if (Array.isArray(res)) {
          leaves = res;
        }
      }

      if (!leaves || leaves.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="py-12 text-center text-slate-400 font-semibold">
              Bugün izinli olan personel bulunmuyor.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = leaves.map(item => {
        const name = item.fullName || item.personelName || item.personName || item.name || 'Personel';
        const dept = item.department || item.departman || 'Genel';
        const type = item.leaveType || item.type || 'Yıllık İzin';

        const startStr = item.startDate ? new Date(item.startDate).toLocaleDateString('tr-TR') : '—';
        const endStr = item.endDate ? new Date(item.endDate).toLocaleDateString('tr-TR') : '—';
        const initials = (name.split(' ')[0][0] + (name.split(' ')[1]?.[0] || '')).toUpperCase();

        return `
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                  ${initials}
                </div>
                <span class="font-bold text-slate-900 dark:text-white">${name}</span>
              </div>
            </td>
            <td class="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-300">${dept}</td>
            <td class="py-3.5 px-4">
              <span class="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 text-[11px] font-bold">
                ${type}
              </span>
            </td>
            <td class="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">${startStr}</td>
            <td class="py-3.5 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">${endStr}</td>
          </tr>
        `;
      }).join('');

    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="py-12 text-center text-rose-500 font-semibold">
            İzinli personeller çekilirken sunucu hatası oluştu: ${err.message}
          </td>
        </tr>
      `;
    }
  }

  getLoggedInUserName() {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.fullName) {
          return user.fullName.split(' ')[0] || user.fullName;
        }
      }
    } catch (e) {
      // Ignore parse error
    }
    return 'Ramazan';
  }

  async handleApproveLeave(id) {
    try {
      const res = await this.repo.api.updateDashboardLeaveStatus(id, 'Approved');
      if (res && (res.success || res.status === 200 || res.ok !== false)) {
        if (typeof window.showToast === 'function') {
          window.showToast('İzin talebi onaylandı.', 'success');
        }
      }
      await this.refreshPendingLeaves();
    } catch (err) {
      await this.refreshPendingLeaves();
    }
  }

  async handleRejectLeave(id) {
    try {
      const res = await this.repo.api.updateDashboardLeaveStatus(id, 'Rejected');
      if (res && (res.success || res.status === 200 || res.ok !== false)) {
        if (typeof window.showToast === 'function') {
          window.showToast('İzin talebi reddedildi.', 'info');
        }
      }
      await this.refreshPendingLeaves();
    } catch (err) {
      await this.refreshPendingLeaves();
    }
  }

  async refreshPendingLeaves() {
    try {
      const pendingRes = await this.repo.api.getDashboardPendingLeaves();
      let pendingLeavesList = [];
      if (pendingRes.success && Array.isArray(pendingRes.data)) {
        pendingLeavesList = pendingRes.data;
      } else if (Array.isArray(pendingRes)) {
        pendingLeavesList = pendingRes;
      }
      const employees = await this.repo.getAll();
      this.quickActionsLeaveWidget.update(pendingLeavesList, employees);
    } catch (e) {
      console.warn("Pending leaves refresh failed:", e);
    }
  }

  async refreshData() {
    const container = document.getElementById('main-content');
    if (container) {
      await this.render(container);
    }
  }

  getSkeletonHtml() {
    return `
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
        <div>
          <div class="h-8 w-56 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div class="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded mt-2"></div>
        </div>
        <div class="flex items-center gap-3">
          <div class="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div class="h-9 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        ${[1, 2, 3, 4].map(() => `
          <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 shadow-xs animate-pulse">
            <div class="flex justify-between items-start mb-4">
              <div class="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div class="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
            </div>
            <div class="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded mt-2"></div>
          </div>
        `).join('')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-8 space-y-8 animate-pulse">
          <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 h-64"></div>
          <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 h-64"></div>
        </div>
        <div class="lg:col-span-4 space-y-8 animate-pulse">
          <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 h-64"></div>
          <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 h-64"></div>
        </div>
      </div>
    `;
  }
}
