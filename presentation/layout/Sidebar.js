/**
 * Sidebar Component - Controls rendering and tab events for navigation
 */
export class Sidebar {
  constructor(onTabChange) {
    this.onTabChange = onTabChange;
  }

  /**
   * Activates a nav item in the sidebar visually
   * @param {string} tabId 
   */
  setActiveTab(tabId) {
    ['dashboard', 'personeller', 'logs', 'overtime', 'leave', 'raporlar'].forEach(id => {
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
