/**
 * Sidebar Component - Controls rendering, tab events, and collapsible sidebar state
 */
export class Sidebar {
  constructor(onTabChange) {
    this.onTabChange = onTabChange;
    this.isCollapsed = false;
  }

  init() {
    // Restore saved collapse state from localStorage
    const savedState = localStorage.getItem('antigravity_sidebar_collapsed');
    if (savedState === 'true') {
      this.setCollapsed(true);
    }
  }

  /**
   * Toggles collapsible sidebar between expanded (w-64) and collapsed (w-16)
   */
  toggleCollapse() {
    this.setCollapsed(!this.isCollapsed);
  }

  /**
   * Sets collapsed state explicitly
   * @param {boolean} collapsed 
   */
  setCollapsed(collapsed) {
    this.isCollapsed = collapsed;
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = document.getElementById('sidebar-toggle-icon');

    if (!sidebar) return;

    if (collapsed) {
      sidebar.classList.add('sidebar-collapsed', 'w-16');
      sidebar.classList.remove('w-64');
      if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'chevron-right');
    } else {
      sidebar.classList.remove('sidebar-collapsed', 'w-16');
      sidebar.classList.add('w-64');
      if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'chevron-left');
    }

    localStorage.setItem('antigravity_sidebar_collapsed', collapsed ? 'true' : 'false');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Activates a nav item in the sidebar visually
   * @param {string} tabId 
   */
  setActiveTab(tabId) {
    ['dashboard', 'personeller', 'logs', 'overtime', 'leave', 'duyurular', 'auditlogs', 'raporlar'].forEach(id => {
      const btn = document.getElementById(`btn-${id}`);
      const mobBtn = document.getElementById(`mob-btn-${id}`);
      
      if (!btn || !mobBtn) return;

      if (id === tabId) {
        btn.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group bg-indigo-600 text-white shadow-md shadow-indigo-600/10";
        mobBtn.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all bg-indigo-600 text-white";
      } else {
        btn.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all group";
        mobBtn.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all";
      }
    });
  }

  /**
   * Closes or opens the mobile responsive drawer
   */
  toggleMobileSidebar() {
    const ms = document.getElementById('mobile-sidebar');
    if (!ms) return;
    if (ms.classList.contains('hidden')) {
      ms.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      ms.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
}
