/**
 * SupportTableWidget renders the support tickets list in both modern table layout (desktop)
 * and responsive card layout (mobile) to guarantee 100% responsive compatibility.
 */
export class SupportTableWidget {
  /**
   * @param {Function} onInspectClick - callback when "İncele" button is clicked
   */
  constructor(onInspectClick) {
    this.onInspectClick = onInspectClick;
    this.tickets = [];
  }

  render() {
    return `
      <!-- Main Data Container (Responsive Table + Mobile Cards) -->
      <div id="support-table-container" class="space-y-4">
        <!-- Desktop/Tablet View (Hidden on mobile) -->
        <div class="hidden md:block bg-white dark:bg-dark-card border border-slate-200/60 dark:border-dark-border rounded-2xl overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-200/60 dark:border-dark-border bg-slate-50/80 dark:bg-slate-900/50 text-slate-400 font-bold tracking-wider uppercase">
                  <th class="px-6 py-4">PERSONEL</th>
                  <th class="px-6 py-4">HEDEF YÖNETİCİ</th>
                  <th class="px-6 py-4">KONU</th>
                  <th class="px-6 py-4">TARİH</th>
                  <th class="px-6 py-4">DURUM</th>
                  <th class="px-6 py-4 text-right">AKSİYON</th>
                </tr>
              </thead>
              <tbody id="tickets-table-body" class="divide-y divide-slate-100 dark:divide-dark-border text-slate-700 dark:text-slate-300 font-medium">
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-slate-400 font-semibold">
                    <div class="flex items-center justify-center gap-3">
                      <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Canlı destek biletleri yükleniyor...</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile Card-based Layout (Visible only on mobile) -->
        <div id="tickets-mobile-cards" class="md:hidden grid grid-cols-1 gap-3.5">
          <div class="bg-white dark:bg-dark-card border border-slate-200/60 dark:border-dark-border rounded-2xl p-6 text-center text-slate-400 font-semibold shadow-xs">
            <div class="flex items-center justify-center gap-3">
              <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Canlı destek biletleri yükleniyor...</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showLoading() {
    const tbody = document.getElementById('tickets-table-body');
    const mobileCards = document.getElementById('tickets-mobile-cards');

    const loadingHtml = `
      <div class="flex items-center justify-center gap-3 py-12 text-slate-400 font-semibold">
        <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Destek biletleri güncelleniyor...</span>
      </div>
    `;

    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-12 text-center text-slate-400">${loadingHtml}</td></tr>`;
    }
    if (mobileCards) {
      mobileCards.innerHTML = `<div class="bg-white dark:bg-dark-card border border-slate-200/60 dark:border-dark-border rounded-2xl p-6 text-center shadow-xs">${loadingHtml}</div>`;
    }
  }

  formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * Normalizes status string handling Turkish characters and mixed casing
   */
  normalizeStatus(str) {
    if (!str) return '';
    return str.toString()
      .trim()
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .replace(/Ğ/g, 'g')
      .replace(/ü/g, 'u').replace(/Ü/g, 'u')
      .replace(/ş/g, 's').replace(/Ş/g, 's')
      .replace(/ö/g, 'o').replace(/Ö/g, 'o')
      .replace(/ç/g, 'c').replace(/Ç/g, 'c')
      .replace(/ı/g, 'i')
      .toLowerCase();
  }

  /**
   * Generates status badge with robust string matching
   */
  getStatusBadge(statusStr) {
    const st = this.normalizeStatus(statusStr);
    
    if (st.includes('cozul') || st.includes('solv') || st.includes('tamam')) {
      return `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Çözüldü
        </span>
      `;
    } else if (st.includes('incel') || st.includes('inreview') || st.includes('islem') || st.includes('review')) {
      return `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-2xs">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> İnceleniyor
        </span>
      `;
    } else if (st.includes('red') || st.includes('reject') || st.includes('iptal') || st.includes('cancel')) {
      return `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-2xs">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Reddedildi
        </span>
      `;
    } else {
      return `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Beklemede
        </span>
      `;
    }
  }

  update(ticketsList = []) {
    this.tickets = ticketsList;
    const tbody = document.getElementById('tickets-table-body');
    const mobileCards = document.getElementById('tickets-mobile-cards');

    if (!ticketsList || ticketsList.length === 0) {
      const emptyHtml = `
        <div class="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mb-1">
            <i data-lucide="headset" class="w-6 h-6"></i>
          </div>
          <span class="text-sm font-bold text-slate-800 dark:text-slate-200">Destek Bileti Bulunmuyor</span>
          <p class="text-xs text-slate-400 max-w-sm">Seçili filtre veya veritabanında gösterilecek herhangi bir destek talebi kaydı bulunmadı.</p>
        </div>
      `;

      if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8">${emptyHtml}</td></tr>`;
      if (mobileCards) mobileCards.innerHTML = `<div class="bg-white dark:bg-dark-card border border-slate-200/60 dark:border-dark-border rounded-2xl p-6 shadow-xs">${emptyHtml}</div>`;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // 1. Render Desktop/Tablet Rows
    if (tbody) {
      tbody.innerHTML = ticketsList.map(item => {
        const ticketId = item.Id || item.id || item.ID || '';
        const name = item.PersonnelFullName || item.personnelFullName || item.PersonnelName || item.personnelName || item.FullName || item.fullName || item.userFullName || 'Personel';
        const dept = item.Department || item.department || item.Departman || item.departman || 'Genel Kadro';
        const managerName = item.TargetManagerName || item.targetManagerName || item.ManagerName || item.managerName || 'Genel Yönetici';
        const subject = item.Subject || item.subject || 'Konusuz Destek Bileti';
        const messageText = item.Message || item.message || item.Description || item.description || '';
        const dateRaw = item.CreatedAt || item.createdAt || item.Date || item.date;
        const dateText = this.formatDate(dateRaw);
        const statusRaw = item.Status || item.status || 'Beklemede';
        const statusBadge = this.getStatusBadge(statusRaw);
        const initials = (name.split(' ')[0][0] + (name.split(' ')[1]?.[0] || '')).toUpperCase();

        return `
          <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all duration-200 group">
            <!-- Personel -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform duration-200">
                  ${initials}
                </div>
                <div>
                  <div class="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">${name}</div>
                  <div class="text-[10px] text-slate-400 font-medium">${dept}</div>
                </div>
              </div>
            </td>

            <!-- Hedef Yönetici -->
            <td class="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
              <div class="flex items-center gap-1.5">
                <i data-lucide="user-check" class="w-3.5 h-3.5 text-slate-400"></i>
                <span>${managerName}</span>
              </div>
            </td>

            <!-- Konu & Açıklama Önizlemesi -->
            <td class="px-6 py-4">
              <div class="font-bold text-slate-900 dark:text-white text-xs truncate max-w-xs">${subject}</div>
              <div class="text-[11px] text-slate-400 truncate max-w-xs font-normal mt-0.5">${messageText}</div>
            </td>

            <!-- Tarih -->
            <td class="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
              ${dateText}
            </td>

            <!-- Durum Rozeti -->
            <td class="px-6 py-4">
              ${statusBadge}
            </td>

            <!-- Aksiyon Butonu -->
            <td class="px-6 py-4 text-right">
              <button class="btn-inspect-ticket inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs" data-id="${ticketId}">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                Detayı Gör
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // 2. Render Mobile Responsive Cards
    if (mobileCards) {
      mobileCards.innerHTML = ticketsList.map(item => {
        const ticketId = item.Id || item.id || item.ID || '';
        const name = item.PersonnelFullName || item.personnelFullName || item.PersonnelName || item.personnelName || item.FullName || item.fullName || item.userFullName || 'Personel';
        const dept = item.Department || item.department || item.Departman || item.departman || 'Genel Kadro';
        const managerName = item.TargetManagerName || item.targetManagerName || item.ManagerName || item.managerName || 'Genel Yönetici';
        const subject = item.Subject || item.subject || 'Konusuz Destek Bileti';
        const messageText = item.Message || item.message || item.Description || item.description || 'Açıklama girilmedi.';
        const dateRaw = item.CreatedAt || item.createdAt || item.Date || item.date;
        const dateText = this.formatDate(dateRaw);
        const statusRaw = item.Status || item.status || 'Beklemede';
        const statusBadge = this.getStatusBadge(statusRaw);
        const initials = (name.split(' ')[0][0] + (name.split(' ')[1]?.[0] || '')).toUpperCase();

        return `
          <div class="bg-white dark:bg-dark-card border border-slate-200/60 dark:border-dark-border rounded-2xl p-4 shadow-xs space-y-3">
            <!-- Card Header: Personnel & Status -->
            <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                  ${initials}
                </div>
                <div>
                  <div class="font-bold text-slate-900 dark:text-white text-xs">${name}</div>
                  <div class="text-[10px] text-slate-400">${dept}</div>
                </div>
              </div>
              <div>
                ${statusBadge}
              </div>
            </div>

            <!-- Subject & Body -->
            <div>
              <div class="font-bold text-slate-900 dark:text-white text-xs mb-1">${subject}</div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">${messageText}</p>
            </div>

            <!-- Card Footer: Manager, Date & Inspect Button -->
            <div class="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 font-medium">
              <div class="flex flex-col gap-0.5">
                <span>Yönetici: <strong class="text-slate-700 dark:text-slate-300 font-semibold">${managerName}</strong></span>
                <span>${dateText}</span>
              </div>

              <button class="btn-inspect-ticket px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5" data-id="${ticketId}">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                İncele
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Attach click listeners to inspect buttons (both desktop rows & mobile cards)
    document.querySelectorAll('.btn-inspect-ticket').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const match = this.tickets.find(t => (t.Id || t.id || t.ID) == id);
        if (match && this.onInspectClick) {
          this.onInspectClick(match);
        }
      };
    });
  }
}
