/**
 * AuditLogsScreen - Displays system audit logs & security activity history
 * Connected to GET /api/auditlogs endpoint
 */
export class AuditLogsScreen {
  constructor(apiService) {
    this.apiService = apiService;
    this.logs = [];
  }

  async render(container) {
    container.innerHTML = `
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <i data-lucide="shield-check" class="w-6 h-6 text-indigo-600 dark:text-indigo-400"></i>
            Sistem Kayıtları & Bildirimler
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Veritabanı üzerinde gerçekleşen tüm ekleme, güncelleme ve silme işlemlerinin güvenlik logları.</p>
        </div>

        <div>
          <button id="btn-refresh-audit-logs" class="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer">
            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
            Logları Yenile
          </button>
        </div>
      </div>

      <!-- Main Audit Logs Table Card -->
      <div class="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div class="flex items-center gap-2">
            <i data-lucide="history" class="w-4 h-4 text-slate-400"></i>
            <span class="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Son İşlem Kayıtları</span>
          </div>
          <span id="audit-logs-count-badge" class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            0 Kayıt
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th class="py-3.5 px-6">İŞLEM YAPAN KİŞİ</th>
                <th class="py-3.5 px-4">ETKİLENEN TABLO</th>
                <th class="py-3.5 px-4">İŞLEM TİPİ</th>
                <th class="py-3.5 px-4">İŞLEM TARİHİ</th>
                <th class="py-3.5 px-6 text-right">DETAY</th>
              </tr>
            </thead>
            <tbody id="audit-logs-tbody" class="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              <tr>
                <td colspan="5" class="py-12 text-center text-slate-400">Sistem logları yükleniyor...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    const refreshBtn = container.querySelector('#btn-refresh-audit-logs');
    if (refreshBtn) {
      refreshBtn.onclick = () => this.loadAuditLogs();
    }

    await this.loadAuditLogs();
  }

  async loadAuditLogs() {
    const tbody = document.getElementById('audit-logs-tbody');
    const badge = document.getElementById('audit-logs-count-badge');
    if (!tbody) return;

    try {
      const res = await this.apiService.getAuditLogs();
      if (res.success && Array.isArray(res.data)) {
        this.logs = res.data;
      } else if (Array.isArray(res)) {
        this.logs = res;
      } else {
        this.logs = [];
      }

      if (badge) {
        badge.textContent = `${this.logs.length} Kayıt`;
      }

      this.renderTableRows(tbody);

    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="py-12 text-center text-rose-500 font-semibold">
            Loglar çekilirken sunucu hatası oluştu. Yetkinizi kontrol edin.
          </td>
        </tr>
      `;
    }
  }

  renderTableRows(tbody) {
    if (!this.logs || this.logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="py-12 text-center text-slate-400">
            Sistemde henüz kaydedilmiş işlem logu bulunmuyor.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.logs.map(item => {
      const changedBy = item.changedBy || item.changed_by || 'Sistem Yöneticisi';
      const tableName = item.tableName || item.table_name || 'Veritabanı';
      const operation = (item.operation || 'UPDATE').toUpperCase();
      const dateText = this.formatDate(item.changedAt || item.changed_at);

      // Operation Badge styling
      let opBadgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300';
      if (operation.includes('INSERT') || operation.includes('CREATE')) {
        opBadgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
      } else if (operation.includes('DELETE')) {
        opBadgeClass = 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
      }

      const initials = (changedBy.split(' ')[0][0] + (changedBy.split(' ')[1]?.[0] || '')).toUpperCase();

      return `
        <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
          
          <!-- User -->
          <td class="py-3.5 px-6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                ${initials}
              </div>
              <div>
                <p class="font-bold text-slate-900 dark:text-white">${changedBy}</p>
                <p class="text-[10px] text-slate-400">Yetkili Kullanıcı</p>
              </div>
            </div>
          </td>

          <!-- Table Name -->
          <td class="py-3.5 px-4 font-mono font-medium text-slate-600 dark:text-slate-300">
            ${tableName}
          </td>

          <!-- Operation Type -->
          <td class="py-3.5 px-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold ${opBadgeClass}">
              ${operation}
            </span>
          </td>

          <!-- Date -->
          <td class="py-3.5 px-4 font-medium text-slate-500 dark:text-slate-400">
            ${dateText}
          </td>

          <!-- Action -->
          <td class="py-3.5 px-6 text-right">
            <span class="text-[11px] text-slate-400">Başarılı</span>
          </td>

        </tr>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
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
