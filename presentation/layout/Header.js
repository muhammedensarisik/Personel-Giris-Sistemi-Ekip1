import { ThemeManager } from '../../utils/ThemeManager.js';

/**
 * Header Component - Controls theme management, notification panels, and profile dropdowns
 */
export class Header {
  constructor(apiService) {
    this.apiService = apiService;
    this.logs = [];
  }

  async init() {
    ThemeManager.init();
    await this.loadNotifications();
  }

  toggleTheme() {
    ThemeManager.toggleTheme();
  }

  async loadNotifications() {
    const listEl = document.getElementById('notifications-list');
    if (!listEl) return;

    listEl.innerHTML = '<div class="p-4 text-center text-xs text-slate-400">Bildirimler yükleniyor...</div>';

    try {
      const response = await this.apiService.getAuditLogs();
      
      if (Array.isArray(response)) {
        this.logs = response;
      } else if (response && Array.isArray(response.data)) {
        this.logs = response.data;
      }

      this.renderNotificationsList();

    } catch (error) {
      console.error("Bildirim Panelinde Hata:", error);
      listEl.innerHTML = '<div class="p-4 text-center text-xs text-rose-500 font-semibold">Loglar sunucudan alınamadı.</div>';
    }
  }

  renderNotificationsList() {
    const listEl = document.getElementById('notifications-list');
    const badge = document.getElementById('notif-badge');
    if (!listEl) return;

    // SADECE SON 24 SAATTEKİLERİ VE MAKSİMUM 8 TANESİNİ AL
    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    const recentLogs = this.logs.filter(log => {
      const logDate = new Date(log.changedAt || log.changed_at);
      return logDate >= yesterday;
    }).slice(0, 8);

    const lastReadId = parseInt(localStorage.getItem('last_read_log_id') || '0', 10);
    const unreadCount = recentLogs.filter(log => log.id > lastReadId).length;

    if (badge) {
      if (unreadCount === 0) {
        badge.classList.add('hidden');
      } else {
        badge.classList.remove('hidden');
      }
    }

    if (recentLogs.length === 0) {
      listEl.innerHTML = `
        <div class="p-4 text-center text-xs text-slate-400">Son 24 saate ait yeni bildirim bulunmuyor.</div>
        <button onclick="switchTab('auditlogs'); toggleNotifications()" class="block w-full p-3 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 cursor-pointer">Tüm logları gör</button>
      `;
      return;
    }

    listEl.innerHTML = '';
    
    recentLogs.forEach(log => {
      const operation = (log.operation || 'UPDATE').toUpperCase();
      const tableName = log.tableName || log.table_name || 'Veritabanı';
      const changedBy = log.changedBy || log.changed_by || 'Sistem Yöneticisi';
      
      const isUnread = log.id > lastReadId;

      let typeColor = 'bg-blue-500';
      let icon = 'info';

      if (operation.includes('INSERT') || operation.includes('CREATE')) {
        typeColor = 'bg-emerald-500';
        icon = 'check-circle';
      } else if (operation.includes('DELETE')) {
        typeColor = 'bg-rose-500';
        icon = 'alert-triangle';
      }

      let timeStr = 'Şimdi';
      if (log.changedAt || log.changed_at) {
        const d = new Date(log.changedAt || log.changed_at);
        if (!isNaN(d.getTime())) {
          timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        }
      }

      const bgClass = isUnread
        ? 'bg-blue-50/70 dark:bg-slate-800/80'
        : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40';

      const div = document.createElement('div');
      div.className = `p-3 flex items-start gap-3 transition-colors border-b border-slate-100 dark:border-slate-800/60 ${bgClass}`;
      div.innerHTML = `
        <div class="w-7 h-7 rounded-full ${typeColor} text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center mb-0.5">
            <span class="font-semibold text-xs ${isUnread ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'} truncate">
              ${tableName} İşlemi
            </span>
            <span class="text-[10px] text-slate-400">${timeStr}</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">${changedBy} tarafından ${operation} işlemi yapıldı.</p>
        </div>
      `;
      listEl.appendChild(div);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  markAllAsRead() {
    if (this.logs && this.logs.length > 0) {
      const maxId = Math.max(...this.logs.map(log => log.id));
      localStorage.setItem('last_read_log_id', maxId.toString());
      this.renderNotificationsList();
    }
  }

  toggleNotifications() {
    const drop = document.getElementById('notifications-dropdown');
    const prof = document.getElementById('profile-dropdown');
    
    if (prof) prof.classList.add('hidden');
    
    if (drop) {
      const isHidden = drop.classList.contains('hidden');
      if (isHidden) {
        drop.classList.remove('hidden');
        this.markAllAsRead();
      } else {
        drop.classList.add('hidden');
      }
    }
  }

  toggleProfileDropdown() {
    const prof = document.getElementById('profile-dropdown');
    const drop = document.getElementById('notifications-dropdown');
    
    if (drop) drop.classList.add('hidden');
    
    if (prof) {
      prof.classList.toggle('hidden');
    }
  }
}
