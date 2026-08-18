/**
 * HolidaysScreen handles management of official and custom business holidays.
 * Integrates with GET /api/Holiday, POST /api/Holiday, DELETE /api/Holiday/{id}.
 * Enforces `isFixed` rule & Role-Based Access Control (RBAC):
 * Only 'Admin' role users can create (+ Yeni Tatil Ekle) or delete holidays.
 */
export class HolidaysScreen {
  constructor(personnelRepository) {
    this.repo = personnelRepository;
    this.holidays = [];
  }

  /**
   * Helper to check if current logged-in user has Admin role
   */
  isAdminUser() {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        const role = (user.role || user.Role || '').toString().toLowerCase();
        return role === 'admin';
      }
    } catch (e) {}
    return false;
  }

  async render(container) {
    const isAdmin = this.isAdminUser();

    container.innerHTML = `
      <!-- Top Action & Navigation Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tatil ve Özel Günler</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">İşletmenin resmi ve özel tatil günlerinin yönetimi</p>
        </div>

        <!-- Conditional Action Button (+ Yeni Tatil Ekle - Only Visible for Admin) -->
        <div>
          ${isAdmin ? `
            <button id="btn-add-holiday" class="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer">
              <i data-lucide="plus" class="w-4 h-4 stroke-[2.5]"></i>
              Yeni Tatil Ekle
            </button>
          ` : `
            <span class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700" title="Tatil eklemek/silmek için Admin yetkisi gereklidir">
              <i data-lucide="shield-alert" class="w-4 h-4 text-amber-500"></i>
              Salt Okunur Mod (Yönetici Yetkisi Gereklidir)
            </span>
          `}
        </div>
      </div>

      <!-- Main Data Card Container (Matching Son Giriş/Çıkış Kayıtları Card Style) -->
      <div class="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-100 dark:border-dark-border bg-slate-50/60 dark:bg-slate-900/30 text-slate-400 font-bold tracking-wider uppercase">
                <th class="px-6 py-4">TATİL ADI</th>
                <th class="px-6 py-4">TARİH</th>
                <th class="px-6 py-4">TÜR</th>
                <th class="px-6 py-4">SÜRE</th>
                <th class="px-6 py-4 text-right">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody id="holidays-table-body" class="divide-y divide-slate-100 dark:divide-dark-border text-slate-700 dark:text-slate-300 font-medium">
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-slate-400 font-semibold">
                  <div class="flex items-center justify-center gap-3">
                    <div class="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Tatil günleri yükleniyor (/api/Holiday)...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Holiday Modal -->
      <div id="add-holiday-modal" class="hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 fade-in">
        <div class="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-dark-border">
            <h3 class="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <i data-lucide="calendar-plus" class="w-5 h-5 text-purple-500"></i>
              Yeni Tatil Ekle
            </h3>
            <button id="btn-close-holiday-modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="add-holiday-form" class="space-y-4 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tatil Adı</label>
              <input type="text" id="holiday-name" required placeholder="Örn: 29 Ekim Cumhuriyet Bayramı" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 font-semibold" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tarih</label>
              <input type="date" id="holiday-date" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 font-semibold" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tatil Türü</label>
              <select id="holiday-type" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 font-semibold">
                <option value="Resmi Tatil">Resmi Tatil</option>
                <option value="Dini Bayram">Dini Bayram</option>
                <option value="Şirket İzni">Şirket İzni</option>
                <option value="İdari İzin">İdari İzin</option>
                <option value="Özel Tatil">Özel Tatil</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Süre</label>
              <select id="holiday-is-halfday" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 font-semibold">
                <option value="false">Tam Gün</option>
                <option value="true">Yarım Gün</option>
              </select>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3">
              <button type="button" id="btn-cancel-holiday-modal" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all cursor-pointer">
                İptal
              </button>
              <button type="submit" class="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer">
                Tatili Kaydet
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
    await this.loadData();
  }

  bindEvents(container) {
    const addBtn = container.querySelector('#btn-add-holiday');
    const modal = container.querySelector('#add-holiday-modal');
    const closeBtn = container.querySelector('#btn-close-holiday-modal');
    const cancelBtn = container.querySelector('#btn-cancel-holiday-modal');
    const form = container.querySelector('#add-holiday-form');

    const closeModal = () => {
      if (modal) modal.classList.add('hidden');
      if (form) form.reset();
    };

    if (addBtn && modal) {
      addBtn.onclick = () => modal.classList.remove('hidden');
    }

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
      };
    }

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const name = container.querySelector('#holiday-name')?.value?.trim();
        const dateStr = container.querySelector('#holiday-date')?.value;
        const holidayType = container.querySelector('#holiday-type')?.value;
        const isHalfDay = container.querySelector('#holiday-is-halfday')?.value === 'true';

        if (!name || !dateStr) return;

        const payload = {
          name: name,
          date: new Date(dateStr).toISOString(),
          holidayType: holidayType || 'Resmi Tatil',
          isHalfDay: isHalfDay,
          isFixed: false
        };

        try {
          await this.repo.addHoliday(payload);
          closeModal();
          await this.loadData();
        } catch (err) {
          if (typeof window.showToast === 'function') {
            window.showToast(err.message || 'Tatil günü eklenemedi.', 'error');
          }
        }
      };
    }
  }

  async loadData() {
    const tbody = document.getElementById('holidays-table-body');
    if (!tbody) return;

    try {
      const data = await this.repo.getHolidays();
      this.holidays = Array.isArray(data) ? data : [];
    } catch (e) {
      this.holidays = [];
    }

    // Default official holidays fallback if backend returns empty array initially
    if (!this.holidays || this.holidays.length === 0) {
      this.holidays = [
        { id: 'h-1', name: 'Yılbaşı', date: '2026-01-01T00:00:00', holidayType: 'Resmi Tatil', isHalfDay: false, isFixed: true },
        { id: 'h-2', name: 'Ulusal Egemenlik ve Çocuk Bayramı', date: '2026-04-23T00:00:00', holidayType: 'Resmi Tatil', isHalfDay: false, isFixed: true },
        { id: 'h-3', name: 'Emek ve Dayanışma Günü', date: '2026-05-01T00:00:00', holidayType: 'Resmi Tatil', isHalfDay: false, isFixed: true },
        { id: 'h-4', name: 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı', date: '2026-05-19T00:00:00', holidayType: 'Resmi Tatil', isHalfDay: false, isFixed: true },
        { id: 'h-5', name: 'Demokrasi ve Milli Birlik Günü', date: '2026-07-15T00:00:00', holidayType: 'Resmi Tatil', isHalfDay: false, isFixed: true },
        { id: 'h-6', name: 'Zafer Bayramı', date: '2026-08-30T00:00:00', holidayType: 'Resmi Tatil', isHalfDay: false, isFixed: true },
        { id: 'h-7', name: 'Cumhuriyet Bayramı Arifesi', date: '2026-10-28T00:00:00', holidayType: 'Resmi Tatil', isHalfDay: true, isFixed: true },
        { id: 'h-8', name: '29 Ekim Cumhuriyet Bayramı', date: '2026-10-29T00:00:00', holidayType: 'Resmi Tatil', isHalfDay: false, isFixed: true }
      ];
    }

    this.renderTableRows(tbody);
  }

  formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (e) {
      return dateStr;
    }
  }

  renderTableRows(tbody) {
    const isAdmin = this.isAdminUser();

    if (!this.holidays || this.holidays.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-12 text-center text-slate-400 font-semibold">
            Kayıtlı tatil günü bulunmuyor.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.holidays.map(item => {
      const dateText = this.formatDate(item.date);
      const isHalfDayText = item.isHalfDay ? 'Yarım Gün' : 'Tam Gün';
      const durationBadgeClass = item.isHalfDay 
        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' 
        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400';

      const typeBadgeClass = item.holidayType === 'Resmi Tatil'
        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
        : 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400';

      // Security Check: if isFixed === true OR user is NOT Admin
      const isFixed = item.isFixed === true;

      let actionHtml = '';
      if (!isAdmin) {
        // Non-admin user: Read-only notice
        actionHtml = `
          <div class="flex items-center justify-end gap-2 text-slate-400">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-[11px] font-semibold text-slate-400 cursor-not-allowed opacity-60" title="Silmek için Admin yetkisi gereklidir">
              <i data-lucide="lock" class="w-3.5 h-3.5 text-slate-400"></i>
              Yetki Yok
            </span>
          </div>
        `;
      } else if (isFixed) {
        // Fixed national holiday
        actionHtml = `
          <div class="flex items-center justify-end gap-2 text-slate-400">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-[11px] font-semibold text-slate-400 cursor-not-allowed opacity-60" title="Resmi bayram / Değiştirilemez tatil">
              <i data-lucide="lock" class="w-3.5 h-3.5 text-slate-400"></i>
              Silinemez
            </span>
          </div>
        `;
      } else {
        // Admin user & custom holiday: Active delete button
        actionHtml = `
          <div class="flex items-center justify-end">
            <button class="btn-delete-holiday p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 rounded-xl transition-all cursor-pointer" data-id="${item.id}" title="Tatili Sil">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        `;
      }

      return `
        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
          <!-- Tatil Adı -->
          <td class="px-6 py-4">
            <div class="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              ${isFixed ? `<i data-lucide="shield-alert" class="w-4 h-4 text-rose-500 shrink-0" title="Resmi Tatil"></i>` : `<i data-lucide="calendar" class="w-4 h-4 text-purple-500 shrink-0"></i>`}
              <span>${item.name}</span>
            </div>
          </td>

          <!-- Tarih -->
          <td class="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
            ${dateText}
          </td>

          <!-- Tür -->
          <td class="px-6 py-4">
            <span class="px-2.5 py-1 rounded-md text-[11px] font-bold ${typeBadgeClass}">
              ${item.holidayType || 'Resmi Tatil'}
            </span>
          </td>

          <!-- Süre -->
          <td class="px-6 py-4">
            <span class="px-2.5 py-1 rounded-md text-[11px] font-bold ${durationBadgeClass}">
              ${isHalfDayText}
            </span>
          </td>

          <!-- İşlemler -->
          <td class="px-6 py-4 text-right">
            ${actionHtml}
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Attach delete handlers if admin
    if (isAdmin) {
      tbody.querySelectorAll('.btn-delete-holiday').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.getAttribute('data-id');
          if (confirm('Bu tatil gününü silmek istediğinize emin misiniz?')) {
            try {
              await this.repo.deleteHoliday(id);
              await this.loadData();
            } catch (err) {
              if (typeof window.showToast === 'function') {
                window.showToast(err.message || 'Tatil silinemedi.', 'error');
              }
            }
          }
        };
      });
    }
  }
}
