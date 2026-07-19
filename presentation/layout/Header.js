/**
 * Header Component - Controls theme management, notification panels, and profile dropdowns
 */
export class Header {
  constructor(apiService) {
    this.api = apiService;
    this.currentTheme = 'light';
    this.notifications = [
      { id: 1, title: 'Mehmet Demir geç kaldı', desc: '15 dakika gecikmeli giriş kaydı tespit edildi.', type: 'warning', read: false, time: '15 dk önce' },
      { id: 2, title: 'Yeni personel eklendi', desc: 'Can Öztürk sisteme başarıyla tanımlandı.', type: 'info', read: false, time: '2 saat önce' },
      { id: 3, title: 'Rapor hazırlandı', desc: 'Haziran ayı genel performans raporu indirilebilir durumda.', type: 'success', read: true, time: 'Dün' }
    ];
  }

  init() {
    this.renderNotifications();
    this.setupTheme();
  }

  setupTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.setTheme('dark');
    }
  }

  setTheme(theme) {
    this.currentTheme = theme;
    const htmlEl = document.documentElement;
    const lightIcon = document.getElementById('theme-icon-light');
    const darkIcon = document.getElementById('theme-icon-dark');
    
    if (!lightIcon || !darkIcon) return;

    if (theme === 'dark') {
      htmlEl.classList.add('dark');
      htmlEl.classList.remove('light');
      lightIcon.classList.remove('hidden');
      darkIcon.classList.add('hidden');
    } else {
      htmlEl.classList.remove('dark');
      htmlEl.classList.add('light');
      lightIcon.classList.add('hidden');
      darkIcon.classList.remove('hidden');
    }

    // Trigger global event for components like charts that need to re-render on theme change
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  toggleTheme() {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  addNotification(notif) {
    this.notifications.unshift({
      id: this.notifications.length + 1,
      read: false,
      time: 'Şimdi',
      ...notif
    });
    this.renderNotifications();
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    const badge = document.getElementById('notif-badge');
    if (badge) badge.classList.add('hidden');
    this.renderNotifications();
  }

  renderNotifications() {
    const listEl = document.getElementById('notifications-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    
    const unreadCount = this.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notif-badge');
    if (badge) {
      if (unreadCount === 0) {
        badge.classList.add('hidden');
      } else {
        badge.classList.remove('hidden');
      }
    }

    this.notifications.forEach(n => {
      let typeColor = 'bg-blue-500';
      let icon = 'info';
      if (n.type === 'warning') {
        typeColor = 'bg-amber-500';
        icon = 'alert-triangle';
      } else if (n.type === 'success') {
        typeColor = 'bg-emerald-500';
        icon = 'check-circle';
      }

      const div = document.createElement('div');
      div.className = `p-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${!n.read ? 'bg-slate-50/70 dark:bg-slate-800/10' : ''}`;
      div.innerHTML = `
        <div class="w-7 h-7 rounded-full ${typeColor} text-white flex items-center justify-center shrink-0 mt-0.5">
          <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center mb-0.5">
            <span class="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">${n.title}</span>
            <span class="text-[10px] text-slate-400">${n.time}</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">${n.desc}</p>
        </div>
      `;
      listEl.appendChild(div);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  toggleNotifications() {
    const drop = document.getElementById('notifications-dropdown');
    const prof = document.getElementById('profile-dropdown');
    if (prof) prof.classList.add('hidden');
    if (drop) drop.classList.toggle('hidden');
  }

  toggleProfileDropdown() {
    const prof = document.getElementById('profile-dropdown');
    const drop = document.getElementById('notifications-dropdown');
    if (drop) drop.classList.add('hidden');
    if (prof) prof.classList.toggle('hidden');
  }
}
