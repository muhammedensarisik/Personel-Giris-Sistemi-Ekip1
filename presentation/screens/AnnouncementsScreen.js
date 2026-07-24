/**
 * AnnouncementsScreen - Displays and manages company announcements
 * Connected to GET, POST, and DELETE /api/announcement endpoints
 */
export class AnnouncementsScreen {
  constructor(apiService) {
    this.apiService = apiService;
    this.announcements = [];
  }

  async render(container) {
    container.innerHTML = `
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sistem Duyuruları</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Şirket genelindeki duyurular ve önemli bilgilendirmeler.</p>
        </div>

        <div>
          <button id="btn-open-announcement-modal" class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer">
            <i data-lucide="plus" class="w-4 h-4"></i>
            Yeni Duyuru Yayınla
          </button>
        </div>
      </div>

      <!-- Announcements Cards List Container -->
      <div id="announcements-list-container" class="space-y-4">
        <div class="p-8 text-center text-slate-400">Duyurular yükleniyor...</div>
      </div>

      <!-- New Announcement Modal -->
      <div id="announcement-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 hidden" role="dialog" aria-modal="true">
        <div class="relative w-full max-w-lg bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl p-6 fade-in">
          
          <div class="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-dark-border">
            <div class="flex items-center gap-2">
              <i data-lucide="megaphone" class="w-5 h-5 text-blue-600 dark:text-blue-400"></i>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Yeni Duyuru Yayınla</h3>
            </div>
            <button id="btn-close-announcement-modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="announcement-form" class="space-y-4 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Duyuru Başlığı</label>
              <input type="text" id="announcement-title" required placeholder="Örn: Genel Kurul Toplantısı Hakkında" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:border-blue-500 outline-none transition-all" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Öncelik Derecesi</label>
              <select id="announcement-priority" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:border-blue-500 outline-none transition-all">
                <option value="Yüksek">Yüksek Öncelik</option>
                <option value="Orta" selected>Orta Öncelik</option>
                <option value="Düşük">Düşük Öncelik</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Duyuru İçeriği</label>
              <textarea id="announcement-content" rows="4" required placeholder="Duyuru detaylarını buraya yazınız..." class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:border-blue-500 outline-none transition-all resize-none"></textarea>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
              <button type="button" id="btn-cancel-announcement-modal" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors">
                İptal
              </button>
              <button type="submit" id="btn-submit-announcement" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2">
                <span>Yayınla</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    this.bindEvents(container);
    await this.loadAnnouncements();
  }

  bindEvents(container) {
    const modal = container.querySelector('#announcement-modal');
    const openBtn = container.querySelector('#btn-open-announcement-modal');
    const closeBtn = container.querySelector('#btn-close-announcement-modal');
    const cancelBtn = container.querySelector('#btn-cancel-announcement-modal');
    const form = container.querySelector('#announcement-form');

    const toggleModal = (show) => {
      if (show) {
        modal.classList.remove('hidden');
        container.querySelector('#announcement-title')?.focus();
      } else {
        modal.classList.add('hidden');
        form.reset();
      }
    };

    if (openBtn) openBtn.onclick = () => toggleModal(true);
    if (closeBtn) closeBtn.onclick = () => toggleModal(false);
    if (cancelBtn) cancelBtn.onclick = () => toggleModal(false);

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const title = container.querySelector('#announcement-title').value.trim();
        const content = container.querySelector('#announcement-content').value.trim();
        const priority = container.querySelector('#announcement-priority').value;

        const submitBtn = container.querySelector('#btn-submit-announcement');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Yayınlanıyor...</span>';
        }

        try {
          const res = await this.apiService.createAnnouncement({ title, content, priority });
          if (res.success || res.status === 200 || res.status === 201) {
            if (typeof window.showToast === 'function') {
              window.showToast('Duyuru başarıyla yayınlandı!', 'success');
            }
            toggleModal(false);
            await this.loadAnnouncements();
          } else {
            if (typeof window.showToast === 'function') {
              window.showToast(res.error || 'Duyuru kaydedilemedi.', 'error');
            }
          }
        } catch (err) {
          if (typeof window.showToast === 'function') {
            window.showToast('Duyuru yayınlanırken sunucu hatası oluştu.', 'error');
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Yayınla</span>';
          }
        }
      };
    }
  }

  async loadAnnouncements() {
    const listContainer = document.getElementById('announcements-list-container');
    if (!listContainer) return;

    // Zero modifications to fetch logic as requested
    const res = await this.apiService.getAnnouncements();
    if (res.success && Array.isArray(res.data)) {
      this.announcements = res.data;
    } else if (Array.isArray(res)) {
      this.announcements = res;
    } else {
      this.announcements = [];
    }

    this.renderAnnouncementsList(listContainer);
  }

  renderAnnouncementsList(container) {
    if (!this.announcements || this.announcements.length === 0) {
      container.innerHTML = `
        <div class="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl p-12 text-center shadow-xs">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
            <i data-lucide="megaphone" class="w-6 h-6"></i>
          </div>
          <h3 class="font-bold text-slate-800 dark:text-white text-base">Henüz Duyuru Bulunmuyor</h3>
          <p class="text-xs text-slate-400 max-w-sm mx-auto mt-1">Sisteme henüz bir duyuru eklenmedi. "Yeni Duyuru Yayınla" butonuna tıklayarak ilk duyuruyu yayınlayabilirsiniz.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = this.announcements.map(item => {
      const priority = item.priority || 'Orta';
      const normalizedPriority = priority.toLowerCase();
      
      const authorName = item.authorName || item.author_name || item.author || 'Yönetim';
      const authorRole = item.authorRole || item.author_role || item.role || 'Admin';
      const normalizedRole = (authorRole || '').toLowerCase();

      // Border and Accent Styling based on authorRole
      let borderLeftClass = 'border-l-indigo-600'; // Default Admin accent
      let roleBadgeClass = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300';

      if (normalizedRole.includes('admin')) {
        borderLeftClass = 'border-l-indigo-600 dark:border-l-indigo-500';
        roleBadgeClass = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300';
      } else if (normalizedRole.includes('manager') || normalizedRole.includes('müdür')) {
        borderLeftClass = 'border-l-blue-500 dark:border-l-teal-400';
        roleBadgeClass = 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300';
      } else {
        // Fallback to Priority border
        if (normalizedPriority.includes('yüksek') || normalizedPriority.includes('high')) {
          borderLeftClass = 'border-l-rose-500';
        } else if (normalizedPriority.includes('düşük') || normalizedPriority.includes('low')) {
          borderLeftClass = 'border-l-sky-500';
        } else {
          borderLeftClass = 'border-l-amber-500';
        }
      }

      // Priority Badge styling
      let priorityBadgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      if (normalizedPriority.includes('yüksek') || normalizedPriority.includes('high')) {
        priorityBadgeClass = 'bg-rose-100/80 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400';
      } else if (normalizedPriority.includes('düşük') || normalizedPriority.includes('low')) {
        priorityBadgeClass = 'bg-sky-100/80 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400';
      } else {
        priorityBadgeClass = 'bg-amber-100/80 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
      }

      const formattedDate = this.formatDate(item.createdAt || item.created_at || new Date());

      return `
        <div class="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border border-l-4 ${borderLeftClass} rounded-2xl p-6 shadow-xs hover:shadow-md transition-all relative group">
          
          <!-- Top Row: Role, Priority, Author, Date, Delete Button -->
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div class="flex flex-wrap items-center gap-2.5">
              
              <!-- Author Role Badge -->
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${roleBadgeClass}">
                <i data-lucide="shield-check" class="w-3 h-3"></i>
                ${authorRole}
              </span>

              <!-- Priority Badge -->
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${priorityBadgeClass}">
                ${priority} Öncelik
              </span>

              <!-- Publication Date -->
              <span class="text-xs text-slate-400 font-medium">
                ${formattedDate}
              </span>
            </div>

            <!-- Delete Trash Icon Button -->
            <button class="btn-delete-announcement p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer" data-id="${item.id}" title="Duyuruyu Sil">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>

          <!-- Title -->
          <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2">
            ${item.title || 'Başlıksız Duyuru'}
          </h3>

          <!-- Content -->
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-4">
            ${item.content || ''}
          </p>

          <!-- Footer: Yayınlayan (Author Info) -->
          <div class="pt-3 border-t border-slate-100 dark:border-dark-border flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                ${(authorName[0] || 'A').toUpperCase()}
              </div>
              <span class="font-semibold text-slate-700 dark:text-slate-300">Yayınlayan: <span class="font-bold text-slate-900 dark:text-white">${authorName}</span></span>
            </div>
          </div>

        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Bind Delete Event Handlers
    container.querySelectorAll('.btn-delete-announcement').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
          const res = await this.apiService.deleteAnnouncement(id);
          if (res.success || res.status === 200 || res.status === 204) {
            if (typeof window.showToast === 'function') {
              window.showToast('Duyuru silindi.', 'success');
            }
            await this.loadAnnouncements();
          } else {
            if (typeof window.showToast === 'function') {
              window.showToast(res.error || 'Duyuru silinemedi.', 'error');
            }
          }
        }
      };
    });
  }

  formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  }
}
