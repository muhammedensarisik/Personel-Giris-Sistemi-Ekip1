/**
 * SupportDetailModal renders the support ticket details, screenshot preview, and status update actions
 * in a glassmorphic modern pop-up overlay.
 */
export class SupportDetailModal {
  /**
   * @param {Function} onStatusUpdate - callback when admin clicks a status button (id, newStatus)
   */
  constructor(onStatusUpdate) {
    this.onStatusUpdate = onStatusUpdate;
    this.currentTicket = null;
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
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Çözüldü
        </span>
      `;
    } else if (st.includes('incel') || st.includes('inreview') || st.includes('islem') || st.includes('review')) {
      return `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-2xs">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> İnceleniyor
        </span>
      `;
    } else if (st.includes('red') || st.includes('reject') || st.includes('iptal') || st.includes('cancel')) {
      return `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-2xs">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Reddedildi
        </span>
      `;
    } else {
      return `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Beklemede
        </span>
      `;
    }
  }

  render(item) {
    this.currentTicket = item;

    const ticketId = item.Id || item.id || item.ID || 'N/A';
    const name = item.PersonnelFullName || item.personnelFullName || item.PersonnelName || item.personnelName || item.FullName || item.fullName || item.userFullName || 'Personel';
    const dept = item.Department || item.department || item.Departman || item.departman || 'Genel Kadro';
    const managerName = item.TargetManagerName || item.targetManagerName || item.ManagerName || item.managerName || 'Yönetici';
    const subject = item.Subject || item.subject || 'Konusuz Destek Bileti';
    const messageText = item.Message || item.message || item.Description || item.description || 'Açıklama girilmedi.';
    const dateRaw = item.CreatedAt || item.createdAt || item.Date || item.date;
    const dateText = this.formatDate(dateRaw);
    const statusRaw = item.Status || item.status || 'Beklemede';
    const statusBadge = this.getStatusBadge(statusRaw);
    const imagePath = item.ImagePath || item.imagePath || item.Image || item.image;
    const initials = (name.split(' ')[0][0] + (name.split(' ')[1]?.[0] || '')).toUpperCase();

    return `
      <!-- Glassmorphic Overlay Backdrop -->
      <div id="support-modal-overlay" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
        <div class="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
          
          <!-- Header -->
          <div class="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-dark-border shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <i data-lucide="headset" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 dark:text-white text-base">Destek Bileti Detayı</h3>
                <p class="text-[11px] text-slate-400">Bilet ID: #${ticketId}</p>
              </div>
            </div>
            <button id="btn-close-support-modal" class="text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Scrollable Modal Content -->
          <div class="space-y-4 text-xs py-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            <!-- Employee & Target Manager Info Card -->
            <div class="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                  ${initials}
                </div>
                <div>
                  <div class="font-bold text-sm text-slate-900 dark:text-white">${name}</div>
                  <div class="text-[11px] text-slate-400">${dept} • Hedef: <span class="font-semibold text-slate-700 dark:text-slate-300">${managerName}</span></div>
                </div>
              </div>
              <div id="modal-status-badge-container">
                ${statusBadge}
              </div>
            </div>

            <!-- Subject & Date Card -->
            <div class="p-4 bg-slate-50/60 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/60">
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i data-lucide="file-text" class="w-3.5 h-3.5 text-indigo-500"></i> Konu & Tarih
              </div>
              <div class="font-bold text-sm text-slate-900 dark:text-white mb-0.5">${subject}</div>
              <div class="text-xs text-slate-400 font-medium">${dateText}</div>
            </div>

            <!-- Message Text Card -->
            <div class="p-4 bg-slate-50/60 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/60">
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i data-lucide="message-square" class="w-3.5 h-3.5 text-indigo-500"></i> Personel Mesajı
              </div>
              <p class="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-medium">${messageText}</p>
            </div>

            <!-- Image Attachment Preview if present -->
            ${imagePath ? `
              <div class="p-4 bg-slate-50/60 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <i data-lucide="image" class="w-3.5 h-3.5 text-indigo-500"></i> Ekran Görüntüsü / Görsel
                </div>
                <div class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/80 max-h-56 flex items-center justify-center bg-slate-950 p-2 group relative">
                  <img src="${imagePath}" alt="Bilet Görseli" class="max-h-52 object-contain rounded-lg w-full transition-transform duration-300 group-hover:scale-102" onerror="this.parentElement.innerHTML='<span class=\'text-slate-400 text-xs py-6\'>Görsel yüklenemedi veya dosya yolu bulunamadı</span>'" />
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Status Update Action Buttons Footer -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Durum Güncelleme İşlemleri</label>
            <div class="grid grid-cols-3 gap-2">
              <button class="btn-update-status px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/70 dark:text-indigo-300 rounded-xl font-bold transition-all duration-200 hover:scale-102 active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5 text-xs shadow-2xs" data-status="İnceleniyor">
                <i data-lucide="search" class="w-3.5 h-3.5"></i>
                <span>İnceleniyor</span>
              </button>

              <button class="btn-update-status px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/70 dark:text-emerald-300 rounded-xl font-bold transition-all duration-200 hover:scale-102 active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5 text-xs shadow-2xs" data-status="Çözüldü">
                <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>
                <span>Çözüldü</span>
              </button>

              <button class="btn-update-status px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/70 dark:text-rose-300 rounded-xl font-bold transition-all duration-200 hover:scale-102 active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5 text-xs shadow-2xs" data-status="Reddedildi">
                <i data-lucide="x-circle" class="w-3.5 h-3.5"></i>
                <span>Reddet</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  init() {
    const modalOverlay = document.getElementById('support-modal-overlay');
    const closeBtn = document.getElementById('btn-close-support-modal');

    const closeModal = () => {
      if (modalOverlay) modalOverlay.remove();
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (modalOverlay) {
      modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) closeModal();
      };
    }

    // Attach status update button listeners
    const statusBtns = document.querySelectorAll('.btn-update-status');
    statusBtns.forEach(btn => {
      btn.onclick = async () => {
        const newStatus = btn.getAttribute('data-status');
        if (this.currentTicket && this.onStatusUpdate) {
          const originalText = btn.innerHTML;
          btn.innerHTML = `<div class="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>`;
          btn.disabled = true;

          try {
            await this.onStatusUpdate(this.currentTicket.Id || this.currentTicket.id, newStatus);
            
            // Instantly update current ticket state and modal badge UI
            this.currentTicket.Status = newStatus;
            this.currentTicket.status = newStatus;
            
            const badgeContainer = document.getElementById('modal-status-badge-container');
            if (badgeContainer) {
              badgeContainer.innerHTML = this.getStatusBadge(newStatus);
            }
            
            setTimeout(closeModal, 300);
          } catch (err) {
            btn.disabled = false;
            btn.innerHTML = originalText;
          }
        }
      };
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}
