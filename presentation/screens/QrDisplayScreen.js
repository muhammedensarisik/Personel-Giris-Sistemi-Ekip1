/**
 * QrDisplayScreen renders the QR Code Management & Daily Print Page.
 * Strictly connected to real C# backend API endpoints:
 * - GET /api/Location/active
 * - PUT /api/Location/update-coordinates/{locationId}
 * - POST /api/QrAttendance/generate/{locationId}
 * - POST /api/QrAttendance/regenerate/{locationId}
 * 
 * Access Control: Admin ONLY.
 * Print Layout: <img> element rendering with strict @media print visibility CSS.
 */
export class QrDisplayScreen {
  constructor(personnelRepository, apiService) {
    this.repo = personnelRepository;
    this.api = apiService;
    this.selectedLocationId = null;
    this.locations = [];
    this.currentQrData = '';
  }

  destroy() {
    // Cleanup if necessary
  }

  /**
   * Helper to check if current logged in user has Admin role
   */
  isAdmin() {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        const role = (user.role || user.Role || '').toLowerCase();
        return role === 'admin';
      }
    } catch (e) {}
    return false;
  }

  /**
   * Main Render Method
   * @param {HTMLElement} container 
   */
  async render(container) {
    // 1. RBAC Guard: Block non-admin users
    if (!this.isAdmin()) {
      container.innerHTML = `
        <div class="max-w-md mx-auto my-16 p-8 bg-white dark:bg-dark-card border border-rose-200 dark:border-rose-900/50 rounded-2xl text-center shadow-xl space-y-4 fade-in">
          <div class="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold mx-auto border border-rose-500/20">
            <i data-lucide="shield-alert" class="w-8 h-8"></i>
          </div>
          <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Erişim Engellendi (403)</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            QR Kod Yönetimi sayfasına ve çıktı alma işlemlerine sadece <strong>Admin (Sistem Yöneticisi)</strong> yetkisine sahip kullanıcılar erişebilir.
          </p>
          <div class="pt-2">
            <button onclick="switchTab('dashboard')" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
              Dashboard'a Dön
            </button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // 2. Render Admin Print-Friendly QR Management UI
    container.innerHTML = `
      <!-- Inject Print-Only CSS Styles -->
      <style>
        @media print {
          /* Hide non-printable elements */
          header, aside, sidebar, #sidebar, #mobile-sidebar, .no-print, button, #modal-confirm-regenerate-qr, #toast-container, .notifications-dropdown {
            display: none !important;
          }

          body * {
            visibility: hidden !important;
          }

          #print-qr-section, #print-qr-section * {
            visibility: visible !important;
          }

          #print-qr-section {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            page-break-inside: avoid !important;
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 20px !important;
            box-sizing: border-box !important;
          }

          #qr-code-img {
            width: 380px !important;
            height: 380px !important;
            max-width: 80vw !important;
            object-fit: contain !important;
            display: block !important;
          }

          #print-company-name, #qr-location-name-badge, #print-date-label, #qr-raw-token-text {
            color: black !important;
          }
        }
      </style>

      <div class="space-y-6 fade-in max-w-4xl mx-auto pb-12">
        
        <!-- Header Banner (Screen Only) -->
        <div class="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl p-6 shadow-xs">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-xs shrink-0">
              <i data-lucide="qr-code" class="w-6 h-6"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">QR Kod Yönetimi</h1>
                <span class="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">Admin Özel</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Giriş noktası bazlı QR kodları yönetin, konum güncelleyin ve yazdırın</p>
            </div>
          </div>

          <!-- Print Quick Action Button -->
          <button id="btn-print-top" class="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0">
            <i data-lucide="printer" class="w-4 h-4"></i>
            <span>Çıktı Al / Yazdır</span>
          </button>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          <!-- Left Column: Controls (No-Print) -->
          <div class="no-print md:col-span-5 space-y-6">
            
            <!-- Location Select Box & Generate Actions -->
            <div class="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl p-6 shadow-xs space-y-4">
              <div class="flex items-center gap-2">
                <i data-lucide="map-pin" class="w-4 h-4 text-indigo-500"></i>
                <h3 class="font-bold text-slate-900 dark:text-white text-sm">Aktif Giriş Noktasını Seçiniz</h3>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Sistemdeki güncel giriş noktalarından birini seçerek QR kodu görüntüleyin veya GPS konumunu güncelleyin.</p>

              <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Giriş Noktaları</label>
                <select id="select-qr-location" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer">
                  <option value="" disabled selected>Giriş noktaları yükleniyor...</option>
                </select>
              </div>

              <!-- Button 1: QR Kodu Üret -->
              <button id="btn-fetch-qr" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <i data-lucide="qr-code" class="w-4 h-4"></i>
                <span>QR Kodu Üret</span>
              </button>

              <!-- Button 3: GPS Konumunu Güncelle -->
              <button id="btn-update-gps" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <i data-lucide="navigation" class="w-4 h-4"></i>
                <span>📍 Bu Girişin Konumunu (GPS) Güncelle</span>
              </button>

              <!-- Print Action Button -->
              <button id="btn-print-qr-main" class="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                <i data-lucide="printer" class="w-4 h-4"></i>
                <span>Çıktı Al / Yazdır</span>
              </button>
            </div>

            <!-- Button 2: Zorla Yenile Action Box -->
            <div class="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl p-5 space-y-3">
              <div class="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
                <i data-lucide="shield-alert" class="w-4 h-4"></i>
                <span>QR Kodu Yenile</span>
              </div>
              <p class="text-[11px] text-rose-600/90 dark:text-rose-400/80 leading-relaxed">
                Eski barkodu geçersiz kılıp veritabanında yeni bir QR kod oluşturur.
              </p>
              
              <button id="btn-force-regenerate" class="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                <span>Zorla Yenile</span>
              </button>
            </div>

          </div>

          <!-- Right Column: Print-Optimized QR Display Card -->
          <div class="md:col-span-7">
            <div id="print-qr-section" class="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl p-8 shadow-md flex flex-col items-center justify-center text-center relative overflow-hidden">
              
              <!-- Company Header Branding for Print -->
              <div class="mb-4 text-center">
                <span id="print-company-name" class="block font-black text-slate-900 dark:text-white text-lg tracking-wider uppercase">MERAM BELEDİYESİ</span>
                <span class="block text-xs font-bold text-slate-400 tracking-widest uppercase mt-0.5">Personel Mesai Giriş-Çıkış Noktası</span>
              </div>

              <!-- Selected Location Name Badge Header -->
              <div class="mb-6 flex items-center gap-2 px-5 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
                <i data-lucide="building-2" class="w-4 h-4 text-indigo-500"></i>
                <span id="qr-location-name-badge" class="font-black text-sm">Giriş Noktası Seçilmedi</span>
              </div>

              <!-- Large Print-Friendly QR Code Frame (IMG element, no canvas) -->
              <div class="relative p-6 bg-white rounded-3xl border-4 border-slate-900 dark:border-slate-700 shadow-2xl mb-6 flex items-center justify-center min-w-[320px] min-h-[320px]">
                <div id="qr-loading-spinner" class="absolute inset-0 bg-white/90 dark:bg-dark-card/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-2 z-10 transition-opacity">
                  <div class="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span class="text-xs font-bold text-slate-500">QR Hazırlanıyor...</span>
                </div>
                
                <!-- Explicit <img> tag for reliable printing without canvas clipping -->
                <img id="qr-code-img" src="" alt="Mesai Giriş-Çıkış QR Kodu" class="w-72 h-72 object-contain rounded-xl transition-all duration-300" />
              </div>

              <!-- Instructions & Date Footer for Printout -->
              <div class="w-full max-w-sm space-y-2 text-center">
                <p class="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  📲 Personel Mobil Uygulamasından Okutunuz
                </p>
                <div class="flex flex-col gap-1 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div class="flex items-center justify-between">
                    <span>Tarih: <strong id="print-date-label" class="text-slate-700 dark:text-slate-300">04.08.2026</strong></span>
                    <span>Durum: <strong class="text-emerald-600 dark:text-emerald-400 font-bold">Aktif</strong></span>
                  </div>
                  <div class="text-center pt-1">
                    <span class="text-[10px] text-slate-400">QR Kod Kodu:</span>
                    <div id="qr-raw-token-text" class="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 break-all select-all mt-0.5">--</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      <!-- Confirmation Modal Overlay for Force Regenerate QR -->
      <div id="modal-confirm-regenerate-qr" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md hidden flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
        <div class="bg-white dark:bg-dark-card border border-rose-200/80 dark:border-rose-900/50 rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-hidden relative flex flex-col space-y-4">
          
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0 border border-rose-500/20">
              <i data-lucide="shield-alert" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white text-base">QR Kodu Yenile</h3>
              <p class="text-[11px] text-slate-400">Güvenlik ve Yenileme İşlemi</p>
            </div>
          </div>

          <div class="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
            Bu işlem sonucunda seçili giriş noktasının <strong>eski tüm QR kodları geçersiz kılınacak</strong> ve yeni bir kod oluşturulacaktır.
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" id="btn-cancel-regenerate" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer">
              Vazgeç
            </button>
            <button type="button" id="btn-confirm-regenerate-submit" class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-600/20">
              Evet, Yenile
            </button>
          </div>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Set Company Branding
    const compName = localStorage.getItem('company_name') || 'MERAM BELEDİYESİ';
    const compHeaderEl = document.getElementById('print-company-name');
    if (compHeaderEl) compHeaderEl.textContent = compName.toUpperCase();

    // Set Date
    const printDateEl = document.getElementById('print-date-label');
    if (printDateEl) printDateEl.textContent = new Date().toLocaleDateString('tr-TR');

    // Dropdown change listener
    const select = document.getElementById('select-qr-location');
    if (select) {
      select.onchange = (e) => {
        const id = e.target.value;
        if (id) {
          this.selectedLocationId = id;
          const selectedOption = select.options[select.selectedIndex];
          if (selectedOption) {
            document.getElementById('qr-location-name-badge').textContent = selectedOption.text;
          }
          this.fetchAndDisplayQr(id);
        }
      };
    }

    // Button 1: QR Kodu Üret
    const fetchQrBtn = document.getElementById('btn-fetch-qr');
    if (fetchQrBtn) {
      fetchQrBtn.onclick = () => {
        if (this.selectedLocationId) {
          this.fetchAndDisplayQr(this.selectedLocationId);
        } else {
          if (typeof window.showToast === 'function') {
            window.showToast('Lütfen önce bir giriş noktası seçin.', 'warning');
          }
        }
      };
    }

    // Button 3: GPS Konumunu Güncelle (Browser Geolocation API)
    const updateGpsBtn = document.getElementById('btn-update-gps');
    if (updateGpsBtn) {
      updateGpsBtn.onclick = () => {
        const locationId = this.selectedLocationId;
        if (!locationId) {
          if (typeof window.showToast === 'function') {
            window.showToast('Lütfen önce bir giriş noktası seçin.', 'warning');
          }
          return;
        }

        if (!navigator.geolocation) {
          if (typeof window.showToast === 'function') {
            window.showToast('Tarayıcınız konum (GPS) desteği sunmuyor.', 'error');
          }
          return;
        }

        const originalContent = updateGpsBtn.innerHTML;
        updateGpsBtn.disabled = true;
        updateGpsBtn.innerHTML = `
          <div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>GPS Konumu Alınıyor...</span>
        `;

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            try {
              const res = await this.repo.updateLocationCoordinates(locationId, lat, lng);
              if (res && res.error) {
                throw new Error(res.error);
              }
              if (typeof window.showToast === 'function') {
                window.showToast('Giriş noktasının koordinatları güncellendi.', 'success');
              }
            } catch (err) {
              if (typeof window.showToast === 'function') {
                window.showToast(`Konum güncellenirken hata oluştu: ${err.message || 'Hata'}`, 'error');
              }
            } finally {
              updateGpsBtn.disabled = false;
              updateGpsBtn.innerHTML = originalContent;
            }
          },
          (err) => {
            updateGpsBtn.disabled = false;
            updateGpsBtn.innerHTML = originalContent;
            let errMsg = 'Konum bilgisi alınamadı.';
            if (err.code === err.PERMISSION_DENIED) {
              errMsg = 'Konum erişim izni reddedildi.';
            } else if (err.code === err.POSITION_UNAVAILABLE) {
              errMsg = 'Konum bilgisi kullanılamıyor.';
            } else if (err.code === err.TIMEOUT) {
              errMsg = 'Konum isteği zaman aşımına uğradı.';
            }
            if (typeof window.showToast === 'function') {
              window.showToast(errMsg, 'error');
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      };
    }

    // Print Buttons
    const printTopBtn = document.getElementById('btn-print-top');
    const printMainBtn = document.getElementById('btn-print-qr-main');
    const handlePrint = () => window.print();

    if (printTopBtn) printTopBtn.onclick = handlePrint;
    if (printMainBtn) printMainBtn.onclick = handlePrint;

    // Button 2: Zorla Yenile Modal Events
    const openForceRegenBtn = document.getElementById('btn-force-regenerate');
    const modalOverlay = document.getElementById('modal-confirm-regenerate-qr');
    const cancelModalBtn = document.getElementById('btn-cancel-regenerate');
    const confirmModalBtn = document.getElementById('btn-confirm-regenerate-submit');

    const closeModal = () => {
      if (modalOverlay) modalOverlay.classList.add('hidden');
    };

    if (openForceRegenBtn) {
      openForceRegenBtn.onclick = () => {
        if (modalOverlay) modalOverlay.classList.remove('hidden');
      };
    }

    if (cancelModalBtn) cancelModalBtn.onclick = closeModal;

    if (confirmModalBtn) {
      confirmModalBtn.onclick = async () => {
        closeModal();
        if (this.selectedLocationId) {
          await this.regenerateAndDisplayQr(this.selectedLocationId);
        }
      };
    }

    // Load active locations directly from API
    await this.loadLocations();
  }

  /**
   * Load active locations from GET /api/Location/active
   */
  async loadLocations() {
    const select = document.getElementById('select-qr-location');
    const badge = document.getElementById('qr-location-name-badge');
    if (!select) return;

    try {
      const locs = await this.repo.getActiveLocations();
      this.locations = Array.isArray(locs) ? locs : [];

      if (this.locations.length === 0) {
        select.innerHTML = `<option value="" disabled selected>Aktif giriş noktası bulunamadı</option>`;
        if (badge) badge.textContent = 'Giriş Noktası Bulunamadı';
        return;
      }

      select.innerHTML = this.locations.map((loc, idx) => {
        const id = loc.id !== undefined ? loc.id : (loc.locationId !== undefined ? loc.locationId : idx + 1);
        const name = loc.locationName || loc.name || loc.title || `Giriş Noktası ${id}`;
        return `<option value="${id}">${name}</option>`;
      }).join('');

      // Auto-select first real location
      const firstLoc = this.locations[0];
      const firstId = firstLoc.id !== undefined ? firstLoc.id : (firstLoc.locationId !== undefined ? firstLoc.locationId : 1);
      const firstName = firstLoc.locationName || firstLoc.name || firstLoc.title || `Giriş Noktası ${firstId}`;

      select.value = firstId;
      this.selectedLocationId = firstId;
      if (badge) badge.textContent = firstName;

      await this.fetchAndDisplayQr(firstId);

    } catch (err) {
      console.error("Location/active API hatası:", err);
      select.innerHTML = `<option value="" disabled selected>Giriş noktaları yüklenemedi</option>`;
      if (badge) badge.textContent = 'Giriş Noktaları Yüklenemedi';
      if (typeof window.showToast === 'function') {
        window.showToast('Giriş noktaları yüklenemedi.', 'error');
      }
    }
  }

  /**
   * Fetch QR code data from POST /api/QrAttendance/generate/{locationId}
   * @param {string|number} locationId 
   */
  async fetchAndDisplayQr(locationId) {
    const spinner = document.getElementById('qr-loading-spinner');
    const qrImg = document.getElementById('qr-code-img');
    const tokenText = document.getElementById('qr-raw-token-text');

    if (spinner) spinner.classList.remove('opacity-0', 'pointer-events-none');

    try {
      const res = await this.repo.generateQrCode(locationId);
      
      let qrData = '';
      if (typeof res === 'string') {
        qrData = res;
      } else if (res && (res.qrData || res.token || res.code)) {
        qrData = res.qrData || res.token || res.code;
      } else if (res && res.data) {
        qrData = typeof res.data === 'string' ? res.data : (res.data.qrData || res.data.token || res.data.code || JSON.stringify(res.data));
      }

      if (!qrData) {
        throw new Error("API boş QR verisi döndürdü.");
      }

      this.currentQrData = qrData;
      if (tokenText) tokenText.textContent = qrData;

      // Render QR code image as an <img> tag
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}&margin=10`;
      
      if (qrImg) {
        qrImg.src = qrUrl;
        qrImg.onload = () => {
          if (spinner) spinner.classList.add('opacity-0', 'pointer-events-none');
        };
        qrImg.onerror = () => {
          if (spinner) spinner.classList.add('opacity-0', 'pointer-events-none');
        };
      } else {
        if (spinner) spinner.classList.add('opacity-0', 'pointer-events-none');
      }

    } catch (err) {
      console.error("QrAttendance/generate API hatası:", err);
      if (tokenText) tokenText.textContent = "QR Alınamadı";
      if (qrImg) qrImg.src = "";
      if (spinner) spinner.classList.add('opacity-0', 'pointer-events-none');

      if (typeof window.showToast === 'function') {
        window.showToast(`QR kod üretilemedi: ${err.message || 'Hata'}`, 'error');
      }
    }
  }

  /**
   * Force Regenerate QR code via POST /api/QrAttendance/regenerate/{locationId}
   * @param {string|number} locationId 
   */
  async regenerateAndDisplayQr(locationId) {
    const spinner = document.getElementById('qr-loading-spinner');
    const qrImg = document.getElementById('qr-code-img');
    const tokenText = document.getElementById('qr-raw-token-text');

    if (spinner) spinner.classList.remove('opacity-0', 'pointer-events-none');

    try {
      const res = await this.repo.regenerateQrCode(locationId);
      
      let qrData = '';
      if (typeof res === 'string') {
        qrData = res;
      } else if (res && (res.qrData || res.token || res.code)) {
        qrData = res.qrData || res.token || res.code;
      } else if (res && res.data) {
        qrData = typeof res.data === 'string' ? res.data : (res.data.qrData || res.data.token || res.data.code || JSON.stringify(res.data));
      }

      if (!qrData) {
        throw new Error("API boş QR verisi döndürdü.");
      }

      this.currentQrData = qrData;
      if (tokenText) tokenText.textContent = qrData;

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}&margin=10`;
      
      if (qrImg) {
        qrImg.src = qrUrl;
        qrImg.onload = () => {
          if (spinner) spinner.classList.add('opacity-0', 'pointer-events-none');
        };
        qrImg.onerror = () => {
          if (spinner) spinner.classList.add('opacity-0', 'pointer-events-none');
        };
      }

      if (typeof window.showToast === 'function') {
        window.showToast('Yeni QR kod veritabanında başarıyla oluşturuldu.', 'success');
      }

    } catch (err) {
      console.error("QrAttendance/regenerate API hatası:", err);
      if (spinner) spinner.classList.add('opacity-0', 'pointer-events-none');

      if (typeof window.showToast === 'function') {
        window.showToast(`QR kod yenilenirken hata oluştu: ${err.message || 'Hata'}`, 'error');
      }
    }
  }
}
