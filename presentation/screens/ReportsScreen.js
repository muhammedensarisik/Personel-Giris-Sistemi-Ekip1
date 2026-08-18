/**
 * ReportsScreen - Enterprise Reports & Analytics View Controller
 * Connected to live ASP.NET Core API endpoints:
 * - Bireysel Rapor: Re-fetches fresh live data on every submit (/api/attendance, /api/leaverequest)
 * - Toplu Rapor: Connects to GET /api/reports/bulk
 * Preserves tab state, removes Excel exports (PDF only), and features Chart.js analytics.
 */
export class ReportsScreen {
  constructor(personnelRepository, apiService) {
    this.repo = personnelRepository;
    this.api = apiService;
    this.activeTab = 'bireysel'; // 'bireysel' or 'toplu'
    
    // State preservation across tab switches
    this.selectedPersonId = '';
    this.startDate = '';
    this.endDate = '';
    this.bireyselReportData = null;
    this.personnelList = [];
  }

  async render(container) {
    this.container = container;
    
    container.innerHTML = `
      <!-- Header -->
      <div class="mb-8 no-print">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <i data-lucide="bar-chart-3" class="w-6 h-6 text-indigo-600 dark:text-indigo-400"></i>
          Raporlar & Analizler
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Personel katılımı, çalışma süreleri ve fazla mesai analizlerini veritabanı üzerinden raporlayın.
        </p>
      </div>

      <!-- Modern Navigation Tabs -->
      <div class="flex border-b border-slate-200 dark:border-dark-border mb-8 gap-6 text-sm no-print">
        <button id="tab-report-bireysel" class="pb-3 font-semibold transition-all cursor-pointer border-b-2 ${this.activeTab === 'bireysel' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}">
          Bireysel Rapor
        </button>
        <button id="tab-report-toplu" class="pb-3 font-semibold transition-all cursor-pointer border-b-2 ${this.activeTab === 'toplu' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}">
          Toplu Rapor
        </button>
      </div>

      <!-- Active Tab Content Area -->
      <div id="report-tab-content">
        <!-- Rendered via JS -->
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    this.bindTabEvents();
    await this.renderActiveTab();
  }

  bindTabEvents() {
    const tabBireysel = document.getElementById('tab-report-bireysel');
    const tabToplu = document.getElementById('tab-report-toplu');

    if (tabBireysel) {
      tabBireysel.onclick = async () => {
        if (this.activeTab !== 'bireysel') {
          this.saveBireyselInputState();
          this.activeTab = 'bireysel';
          await this.render(this.container);
        }
      };
    }

    if (tabToplu) {
      tabToplu.onclick = async () => {
        if (this.activeTab !== 'toplu') {
          this.saveBireyselInputState();
          this.activeTab = 'toplu';
          await this.render(this.container);
        }
      };
    }
  }

  saveBireyselInputState() {
    const startDateInput = document.getElementById('report-start-date');
    const endDateInput = document.getElementById('report-end-date');

    if (startDateInput) this.startDate = startDateInput.value;
    if (endDateInput) this.endDate = endDateInput.value;
  }

  async renderActiveTab() {
    const tabContent = document.getElementById('report-tab-content');
    if (!tabContent) return;

    if (this.activeTab === 'bireysel') {
      await this.renderBireyselTab(tabContent);
    } else {
      await this.renderTopluTab(tabContent);
    }
  }

  /**
   * Render Bireysel Rapor Tab View
   */
  async renderBireyselTab(tabContent) {
    tabContent.innerHTML = `
      <!-- Bireysel Rapor Filtre Alanı -->
      <div class="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl p-6 shadow-xs mb-8 no-print">
        <h3 class="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
          <i data-lucide="filter" class="w-4 h-4 text-indigo-600 dark:text-indigo-400"></i>
          Bireysel Rapor Filtreleme
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
          
          <!-- Personel Seçimi (Searchable Custom Dropdown) -->
          <div class="relative" id="report-person-wrapper">
            <label class="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Personel Seçiniz *</label>
            <div class="relative">
              <input type="text" id="report-person-search" placeholder="Personel ara veya seç..." autocomplete="off" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:border-indigo-500 outline-none transition-all cursor-pointer pr-9" />
              <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"></i>
            </div>

            <!-- Absolute Dropdown List Container -->
            <div id="person-dropdown-list" class="hidden absolute left-0 right-0 top-full mt-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              <!-- Dynamic Rows -->
            </div>
          </div>

          <!-- Başlangıç Tarihi -->
          <div>
            <label class="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Başlangıç Tarihi *</label>
            <input type="date" id="report-start-date" value="${this.startDate}" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:border-indigo-500 outline-none transition-all cursor-pointer" />
          </div>

          <!-- Bitiş Tarihi -->
          <div>
            <label class="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Bitiş Tarihi *</label>
            <input type="date" id="report-end-date" value="${this.endDate}" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:border-indigo-500 outline-none transition-all cursor-pointer" />
          </div>

          <!-- Rapor Oluştur Butonu -->
          <div>
            <button id="btn-generate-report" disabled class="w-full px-5 py-2.5 bg-blue-600/50 text-white/70 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed transition-all flex items-center justify-center gap-2">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              Rapor Oluştur
            </button>
          </div>

        </div>
      </div>

      <!-- Rapor Çıktı Container -->
      <div id="report-result-container" class="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center shadow-xs">
        <div class="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/40 text-slate-400 flex items-center justify-center mb-3">
          <i data-lucide="bar-chart-2" class="w-6 h-6"></i>
        </div>
        <h4 class="font-bold text-slate-800 dark:text-white text-sm">Rapor Henüz Oluşturulmadı</h4>
        <p class="text-xs text-slate-400 max-w-sm mt-1">
          Yukarıdaki 3 filtre alanını da doldurduktan sonra "Rapor Oluştur" butonuna basarak detaylı analizi veritabanından çekebilirsiniz.
        </p>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // 1. Fetch live personnel from DB for custom dropdown
    await this.loadPersonnelDropdown();

    // 2. Setup Validation and Action Listeners
    this.setupBireyselFormListeners();

    // 3. Restore existing report if generated previously
    if (this.bireyselReportData) {
      const container = document.getElementById('report-result-container');
      if (container) {
        this.renderBireyselReportDOM(container, this.bireyselReportData);
      }
    }
  }

  async loadPersonnelDropdown() {
    const searchInput = document.getElementById('report-person-search');
    const dropdownList = document.getElementById('person-dropdown-list');
    if (!searchInput || !dropdownList) return;

    try {
      if (this.repo && typeof this.repo.getAll === 'function') {
        this.personnelList = await this.repo.getAll();
      } else {
        const res = await this.api.getPersonnel();
        this.personnelList = res.success && Array.isArray(res.data) ? res.data : [];
      }

      if (!this.personnelList || this.personnelList.length === 0) {
        dropdownList.innerHTML = '<div class="p-3 text-slate-400 text-xs text-center">Veritabanında personel bulunamadı</div>';
        return;
      }

      // Restore previously selected person name
      if (this.selectedPersonId) {
        const selectedPerson = this.personnelList.find(p => String(p.id) === String(this.selectedPersonId));
        if (selectedPerson) {
          searchInput.value = `${selectedPerson.fullName || selectedPerson.name} (${selectedPerson.department || 'Genel'})`;
        }
      }

      this.renderDropdownItems(this.personnelList);

    } catch (err) {
      if (dropdownList) dropdownList.innerHTML = '<div class="p-3 text-rose-500 text-xs text-center">Personeller yüklenirken hata oluştu</div>';
    }
  }

  renderDropdownItems(list) {
    const dropdownList = document.getElementById('person-dropdown-list');
    if (!dropdownList) return;

    if (!list || list.length === 0) {
      dropdownList.innerHTML = '<div class="p-3 text-slate-400 text-xs text-center">Eşleşen personel bulunamadı</div>';
      return;
    }

    dropdownList.innerHTML = list.map(p => `
      <div data-person-id="${p.id}" data-person-name="${p.fullName || p.name}" data-person-dept="${p.department || 'Genel'}" class="person-dropdown-item px-3.5 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer flex items-center justify-between transition-colors ${String(p.id) === String(this.selectedPersonId) ? 'bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-200'}">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0">
            ${((p.fullName || p.name || 'P').charAt(0)).toUpperCase()}
          </div>
          <span class="font-semibold text-xs">${p.fullName || p.name}</span>
        </div>
        <span class="text-[10px] text-slate-400 font-normal px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">${p.department || 'Genel'}</span>
      </div>
    `).join('');

    // Bind item selection event listeners
    dropdownList.querySelectorAll('.person-dropdown-item').forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        const id = item.getAttribute('data-person-id');
        const name = item.getAttribute('data-person-name');
        const dept = item.getAttribute('data-person-dept');

        this.selectedPersonId = id;
        const searchInput = document.getElementById('report-person-search');
        if (searchInput) searchInput.value = `${name} (${dept})`;
        
        dropdownList.classList.add('hidden');

        if (typeof this.validateBireyselInputs === 'function') {
          this.validateBireyselInputs();
        }
      };
    });
  }

  setupBireyselFormListeners() {
    const searchInput = document.getElementById('report-person-search');
    const dropdownList = document.getElementById('person-dropdown-list');
    const startDateInput = document.getElementById('report-start-date');
    const endDateInput = document.getElementById('report-end-date');
    const generateBtn = document.getElementById('btn-generate-report');

    this.validateBireyselInputs = () => {
      if (startDateInput) this.startDate = startDateInput.value;
      if (endDateInput) this.endDate = endDateInput.value;

      const hasPerson = !!this.selectedPersonId;
      const hasStart = !!this.startDate;
      const hasEnd = !!this.endDate;

      if (generateBtn) {
        if (hasPerson && hasStart && hasEnd) {
          generateBtn.disabled = false;
          generateBtn.className = "w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer";
        } else {
          generateBtn.disabled = true;
          generateBtn.className = "w-full px-5 py-2.5 bg-blue-600/50 text-white/70 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed transition-all flex items-center justify-center gap-2";
        }
      }
    };

    // Open dropdown on input focus / click
    if (searchInput && dropdownList) {
      searchInput.onfocus = () => {
        dropdownList.classList.remove('hidden');
        this.renderDropdownItems(this.personnelList);
      };

      searchInput.onclick = (e) => {
        e.stopPropagation();
        dropdownList.classList.remove('hidden');
      };

      // Filter personnel as user types in input
      searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        dropdownList.classList.remove('hidden');

        // Clear selected ID until a choice is clicked
        this.selectedPersonId = '';
        this.validateBireyselInputs();

        const filtered = this.personnelList.filter(p => {
          const name = (p.fullName || p.name || '').toLowerCase();
          const dept = (p.department || '').toLowerCase();
          return name.includes(query) || dept.includes(query);
        });

        this.renderDropdownItems(filtered);
      };
    }

    // Close dropdown on click outside
    document.onclick = (e) => {
      const wrapper = document.getElementById('report-person-wrapper');
      if (wrapper && !wrapper.contains(e.target) && dropdownList) {
        dropdownList.classList.add('hidden');
      }
    };

    startDateInput?.addEventListener('change', () => this.validateBireyselInputs());
    endDateInput?.addEventListener('change', () => this.validateBireyselInputs());

    // Initial validation check
    this.validateBireyselInputs();

    // Re-fetch Submit Handler
    if (generateBtn) {
      generateBtn.onclick = async () => {
        if (generateBtn.disabled) return;

        this.bireyselReportData = null;

        const resultContainer = document.getElementById('report-result-container');
        if (!resultContainer) return;

        resultContainer.className = "bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center shadow-xs";
        resultContainer.innerHTML = `
          <div class="flex flex-col items-center justify-center py-16">
            <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-xs font-semibold text-slate-600 dark:text-slate-300">Güncel veriler API'den çekiliyor, lütfen bekleyin...</p>
          </div>
        `;

        this.startDate = startDateInput.value;
        this.endDate = endDateInput.value;

        const personObj = this.personnelList.find(p => String(p.id) === String(this.selectedPersonId));
        const personName = personObj ? (personObj.fullName || personObj.name) : 'Personel';

        setTimeout(async () => {
          await this.fetchAndRenderBireyselReport(resultContainer, personName, this.selectedPersonId, this.startDate, this.endDate);
        }, 1000);
      };
    }
  }

  /**
   * Fetches real API records from GET /api/attendance/my-history/${personId} for Bireysel Rapor
   */
  async fetchAndRenderBireyselReport(container, personName, personId, startDate, endDate) {
    try {
      // 1. Fetch direct personal history endpoint from C# Backend API
      let allLogs = [];
      let allLeaves = [];

      const historyRes = await this.api.get(`/api/attendance/my-history/${personId}`);
      if (historyRes && historyRes.success && Array.isArray(historyRes.data)) {
        allLogs = historyRes.data;
      } else if (Array.isArray(historyRes)) {
        allLogs = historyRes;
      } else if (this.repo && typeof this.repo.getLogs === 'function') {
        const repoLogs = await this.repo.getLogs();
        allLogs = repoLogs.filter(l => String(l.employeeId || l.userId || l.personelId || l.id) === String(personId));
      }

      if (this.repo && typeof this.repo.getLeaveRequests === 'function') {
        const repoLeaves = await this.repo.getLeaveRequests();
        allLeaves = repoLeaves.filter(l => String(l.userId || l.employeeId || l.profileId) === String(personId));
      } else {
        const res = await this.api.get('/api/leaverequest');
        const rawLeaves = res.success && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        allLeaves = rawLeaves.filter(l => String(l.userId || l.employeeId || l.profileId) === String(personId));
      }

      // 2. Date Range Filtering on CheckInTime / EntryTime
      const startTs = new Date(startDate + 'T00:00:00').getTime();
      const endTs = new Date(endDate + 'T23:59:59').getTime();

      const personLogs = allLogs.filter(item => {
        const rawTime = item.checkInTime || item.entryTime || item.checkIn || item.time;
        if (!rawTime) return false;
        const entryTs = new Date(rawTime).getTime();
        return !isNaN(entryTs) && entryTs >= startTs && entryTs <= endTs;
      });

      // 3. Leaves for selected person
      const personLeaves = allLeaves;

      // 4. Calculate Time Analysis statistics
      let onTimeCount = 0;
      let lateCount = 0;
      let earlyCount = 0;

      personLogs.forEach(l => {
        if (l.isLate || l.status === 'Gecikmeli' || l.status === 'Geç') {
          lateCount++;
        } else if (l.status === 'Erken') {
          earlyCount++;
        } else {
          onTimeCount++;
        }
      });

      const total = personLogs.length || 1;
      const onTimePct = Math.round((onTimeCount / total) * 100);
      const latePct = Math.round((lateCount / total) * 100);
      const earlyPct = 100 - (onTimePct + latePct);

      // 5. Store in State Preservation Object
      this.bireyselReportData = {
        personName,
        startDate,
        endDate,
        logs: personLogs,
        leaves: personLeaves,
        stats: {
          onTimeCount,
          lateCount,
          earlyCount,
          onTimePct: personLogs.length === 0 ? 100 : onTimePct,
          latePct: personLogs.length === 0 ? 0 : latePct,
          earlyPct: personLogs.length === 0 ? 0 : Math.max(0, earlyPct)
        }
      };

      this.renderBireyselReportDOM(container, this.bireyselReportData);

    } catch (err) {
      container.innerHTML = `
        <div class="py-12 text-center text-rose-500 font-semibold">
          Rapor verileri veritabanından çekilirken sunucu hatası oluştu: ${err.message}
        </div>
      `;
    }
  }

  /**
   * Renders report output DOM from structured report data object
   * Keeps container.id = "report-result-container" intact to allow subsequent report generation.
   * Wraps print output in #report-printable-area div.
   */
  renderBireyselReportDOM(container, reportData) {
    container.className = "bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl p-6 shadow-xs text-left block";

    const formattedStart = new Date(reportData.startDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedEnd = new Date(reportData.endDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    const logsHtml = reportData.logs.length === 0
      ? `<tr><td colspan="4" class="py-6 text-center text-slate-400">Seçilen tarihlerde giriş/çıkış kaydı bulunamadı.</td></tr>`
      : reportData.logs.map(log => {
          const rawCheckIn = log.checkInTime || log.checkIn || log.entryTime || log.time;
          const rawCheckOut = log.checkOutTime || log.checkOut || log.exitTime;

          const dateStr = rawCheckIn ? new Date(rawCheckIn).toLocaleDateString('tr-TR') : '—';
          const inStr = rawCheckIn ? new Date(rawCheckIn).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '—';
          
          let outStr = '—';
          if (rawCheckOut && rawCheckOut !== 'null' && rawCheckOut !== '--:--' && !String(rawCheckOut).includes('0001-01-01')) {
            outStr = new Date(rawCheckOut).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
          }

          // Compute dynamic duration text
          let durationText = log.duration || log.workHours || log.totalWorkHours || '—';
          if (durationText === '—' && rawCheckIn && rawCheckOut && outStr !== '—') {
            const diffMs = new Date(rawCheckOut).getTime() - new Date(rawCheckIn).getTime();
            if (diffMs > 0) {
              const hours = (diffMs / (1000 * 60 * 60)).toFixed(1);
              durationText = `${hours} Saat`;
            }
          } else if (typeof durationText === 'number') {
            durationText = `${durationText} Saat`;
          } else if (typeof durationText === 'string' && !durationText.toLowerCase().includes('saat') && durationText !== '—') {
            durationText = `${durationText} Saat`;
          }

          let statusBadge = `<span class="text-emerald-600 dark:text-emerald-400 font-medium">${inStr}</span>`;
          if (log.isLate || log.status === 'Gecikmeli' || log.status === 'Geç') {
            statusBadge = `<span class="text-rose-500 font-medium flex items-center gap-1">${inStr} <span class="text-[10px] bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 px-1.5 py-0.5 rounded font-bold">Geç</span></span>`;
          }

          return `
            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white">${dateStr}</td>
              <td class="py-3 px-4">${statusBadge}</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">${outStr}</td>
              <td class="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">${durationText}</td>
            </tr>
          `;
        }).join('');

    const leavesHtml = reportData.leaves.length === 0
      ? `<tr><td colspan="4" class="py-6 text-center text-slate-400">Bu personele ait onaylı izin kaydı bulunamadı.</td></tr>`
      : reportData.leaves.map(l => {
          const startStr = l.startDate ? new Date(l.startDate).toLocaleDateString('tr-TR') : '—';
          const endStr = l.endDate ? new Date(l.endDate).toLocaleDateString('tr-TR') : '—';
          const status = l.status || 'Onaylandı';
          return `
            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white">${startStr}</td>
              <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white">${endStr}</td>
              <td class="py-3 px-4"><span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold rounded-md text-[11px]">${l.leaveType || 'Yıllık İzin'}</span></td>
              <td class="py-3 px-4 text-right"><span class="text-emerald-600 dark:text-emerald-400 font-bold">${status}</span></td>
            </tr>
          `;
        }).join('');

    container.innerHTML = `
      <div id="report-printable-area">
        <!-- Rapor Başlığı & PDF Butonu -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">${reportData.personName}</h2>
              <span class="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 text-[10px] font-bold rounded-full">Bireysel Performans Raporu</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
              Tarih Aralığı: <span class="font-semibold text-slate-700 dark:text-slate-200">${formattedStart} - ${formattedEnd}</span>
            </p>
          </div>

          <!-- Sadece PDF İndir (Yazdırmada Gizlenir) -->
          <div class="flex items-center gap-2.5 no-print shrink-0">
            <button id="btn-print-bireysel-pdf" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/20">
              <i data-lucide="printer" class="w-4 h-4"></i>
              <span>PDF İndir / Yazdır</span>
            </button>
          </div>
        </div>

        <!-- Tablo 1: Giriş-Çıkış Logları -->
        <div class="mb-8">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
            <i data-lucide="clock" class="w-4 h-4 text-blue-500"></i>
            Giriş - Çıkış Logları (Canlı Veri)
          </h3>
          
          <div class="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th class="py-3 px-4">Tarih</th>
                  <th class="py-3 px-4">Giriş Saat</th>
                  <th class="py-3 px-4">Çıkış Saat</th>
                  <th class="py-3 px-4 text-right">Toplam Süre</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                ${logsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tablo 2: İzin Geçmişi -->
        <div class="mb-8">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
            <i data-lucide="calendar-off" class="w-4 h-4 text-indigo-500"></i>
            İzin Geçmişi (Canlı Veri)
          </h3>
          
          <div class="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th class="py-3 px-4">Başlangıç</th>
                  <th class="py-3 px-4">Bitiş</th>
                  <th class="py-3 px-4">İzin Türü</th>
                  <th class="py-3 px-4 text-right">Durum</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                ${leavesHtml}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Görsel Grafik: Zaman Analizi -->
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
            <i data-lucide="pie-chart" class="w-4 h-4 text-emerald-500"></i>
            Zaman Analizi
          </h3>

          <div class="bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="w-full md:w-1/2 h-48 flex items-center justify-center">
              <canvas id="bireysel-zaman-chart" class="max-h-[190px]"></canvas>
            </div>

            <div class="w-full md:w-1/2 space-y-3 text-xs">
              <div class="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span class="font-semibold text-slate-700 dark:text-slate-300">Zamanında Katılım</span>
                </div>
                <span class="font-bold text-slate-900 dark:text-white">%${reportData.stats.onTimePct} (${reportData.stats.onTimeCount} Gün)</span>
              </div>

              <div class="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span class="font-semibold text-slate-700 dark:text-slate-300">Geç Giriş</span>
                </div>
                <span class="font-bold text-slate-900 dark:text-white">%${reportData.stats.latePct} (${reportData.stats.lateCount} Gün)</span>
              </div>

              <div class="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span class="font-semibold text-slate-700 dark:text-slate-300">Erken Çıkış</span>
                </div>
                <span class="font-bold text-slate-900 dark:text-white">%${reportData.stats.earlyPct} (${reportData.stats.earlyCount} Gün)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Chart.js Donut Chart
    const canvas = document.getElementById('bireysel-zaman-chart');
    if (canvas && window.Chart) {
      const ctx = canvas.getContext('2d');
      const isDark = document.documentElement.classList.contains('dark');
      new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Zamanında', 'Geç', 'Erken'],
          datasets: [{
            data: [reportData.stats.onTimePct, reportData.stats.latePct, reportData.stats.earlyPct],
            backgroundColor: ['#10b981', '#f43f5e', '#f59e0b'],
            borderWidth: 2,
            borderColor: isDark ? '#151c2c' : '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          cutout: '72%'
        }
      });
    }

    // PDF Print Event
    const printPdfBtn = document.getElementById('btn-print-bireysel-pdf');
    if (printPdfBtn) {
      printPdfBtn.onclick = () => window.print();
    }
  }

  /**
   * Render Toplu Rapor Tab View with Live DB API endpoint (GET /api/reports/bulk)
   */
  async renderTopluTab(tabContent) {
    tabContent.innerHTML = `
      <div id="report-printable-area" class="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-xs overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <i data-lucide="users" class="w-4 h-4 text-indigo-600 dark:text-indigo-400"></i>
              Personel Aylık Özet Performans Raporu (GET /api/reports/bulk)
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Tüm şirket personelinin canlı API verilerinden çekilen çalışma ve izin özetleri.</p>
          </div>

          <div class="flex items-center gap-2.5 shrink-0 no-print">
            <button id="btn-export-toplu-pdf" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/20">
              <i data-lucide="printer" class="w-4 h-4"></i>
              <span>PDF İndir / Yazdır</span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-50/70 dark:bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th class="py-4 px-6">PERSONEL ADI</th>
                <th class="py-4 px-4">DEPARTMAN</th>
                <th class="py-4 px-4">TOPLAM ÇALIŞMA SAATİ</th>
                <th class="py-4 px-4">TOPLAM GEÇ KALMA (GÜN)</th>
                <th class="py-4 px-6">KULLANDIĞI İZİN (GÜN)</th>
              </tr>
            </thead>
            <tbody id="toplu-report-tbody" class="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
              <tr>
                <td colspan="5" class="py-12 text-center text-slate-400">
                  <div class="flex flex-col items-center justify-center">
                    <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Toplu rapor verileri çekiliyor (/api/reports/bulk)...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Print handler for Toplu Rapor
    const topluPdfBtn = document.getElementById('btn-export-toplu-pdf');
    if (topluPdfBtn) {
      topluPdfBtn.onclick = () => window.print();
    }

    await this.loadTopluReportData();
  }

  /**
   * Fetches real API data from GET /api/reports/bulk with fallback to live repository aggregation
   */
  async loadTopluReportData() {
    const tbody = document.getElementById('toplu-report-tbody');
    if (!tbody) return;

    try {
      // Call GET /api/reports/bulk
      const res = await this.api.getBulkReport();
      let bulkData = [];

      if (res.success && Array.isArray(res.data)) {
        bulkData = res.data;
      } else if (Array.isArray(res)) {
        bulkData = res;
      }

      // If backend endpoint has no data, fallback to aggregating live personnel & logs
      if (!bulkData || bulkData.length === 0) {
        let employees = [];
        let logs = [];
        let leaves = [];

        if (this.repo) {
          employees = await this.repo.getAll();
          logs = typeof this.repo.getAttendancePanel === 'function' ? await this.repo.getAttendancePanel() : await this.repo.getLogs();
          leaves = await this.repo.getLeaveRequests();
        } else {
          const pRes = await this.api.getPersonnel();
          const aRes = await this.api.get('/api/attendance/panel');
          const lRes = await this.api.get('/api/leaverequest');
          employees = pRes.success && Array.isArray(pRes.data) ? pRes.data : [];
          logs = aRes.success && Array.isArray(aRes.data) ? aRes.data : (Array.isArray(aRes) ? aRes : []);
          leaves = lRes.success && Array.isArray(lRes.data) ? lRes.data : [];
        }

        bulkData = employees.map(emp => {
          const empLogs = logs.filter(l => String(l.employeeId || l.userId || l.personelId || l.id) === String(emp.id));
          const empLeaves = leaves.filter(l => String(l.userId || l.employeeId || l.profileId) === String(emp.id));

          // Calculate totalWorkHours dynamically converting duration minutes to hours (/ 60)
          const totalHours = empLogs.reduce((sum, log) => {
            let durInMinutes = log.duration || log.Duration || log.workMinutes || log.totalWorkMinutes || 0;
            let durInHours = 0;

            if (typeof durInMinutes === 'string') {
              durInMinutes = parseFloat(durInMinutes.replace(/[^\d.]/g, '')) || 0;
            }

            if (durInMinutes > 0) {
              durInHours = durInMinutes / 60;
            } else if ((log.checkInTime || log.entryTime) && (log.checkOutTime || log.exitTime)) {
              const inT = new Date(log.checkInTime || log.entryTime).getTime();
              const outT = new Date(log.checkOutTime || log.exitTime).getTime();
              if (outT > inT) {
                durInHours = (outT - inT) / (1000 * 60 * 60);
              }
            } else if (log.workHours || log.totalWorkHours) {
              durInHours = Number(log.workHours || log.totalWorkHours) || 0;
            }

            return sum + (Number(durInHours) || 0);
          }, 0);

          return {
            fullName: emp.fullName || emp.name || 'Personel',
            department: emp.department || 'Genel',
            totalWorkHours: Math.round(totalHours * 10) / 10,
            totalLateDays: empLogs.filter(l => l.isLate || l.status === 'Gecikmeli' || l.status === 'Geç').length,
            usedLeaveDays: empLeaves.length
          };
        });
      }

      if (!bulkData || bulkData.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="py-12 text-center text-slate-400">Veritabanında henüz toplu rapor verisi bulunmuyor.</td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = bulkData.map(item => {
        const name = item.fullName || item.personelName || item.personName || item.name || 'Personel';
        const dept = item.department || item.departman || 'Genel';
        const hours = item.totalWorkHours !== undefined ? item.totalWorkHours : (item.totalHours !== undefined ? item.totalHours : (item.workHours !== undefined ? item.workHours : 0));
        const lateDays = item.totalLateDays !== undefined ? item.totalLateDays : (item.lateDays !== undefined ? item.lateDays : (item.lateCount || 0));
        const leaveDays = item.usedLeaveDays !== undefined ? item.usedLeaveDays : (item.totalLeaveDays !== undefined ? item.totalLeaveDays : (item.leaveDays || 0));

        const email = item.email || `${name.toLowerCase().replace(/\s+/g, '.')}@sirket.com`;
        const initials = (name.split(' ')[0][0] + (name.split(' ')[1]?.[0] || '')).toUpperCase();

        return `
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
            <td class="py-4 px-6">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
                  ${initials}
                </div>
                <div>
                  <p class="font-bold text-slate-900 dark:text-white">${name}</p>
                  <p class="text-[10px] text-slate-400 font-normal">${email}</p>
                </div>
              </div>
            </td>
            <td class="py-4 px-4">
              <span class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">${dept}</span>
            </td>
            <td class="py-4 px-4 font-bold text-slate-900 dark:text-white">${hours} Saat</td>
            <td class="py-4 px-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${lateDays > 0 ? 'bg-amber-100/80 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'}">
                ${lateDays} Gün
              </span>
            </td>
            <td class="py-4 px-6">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100/80 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                ${leaveDays} Gün
              </span>
            </td>
          </tr>
        `;
      }).join('');

    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="py-12 text-center text-rose-500 font-semibold">
            Toplu veriler /api/reports/bulk endpoint'inden çekilirken bir hata oluştu: ${err.message}
          </td>
        </tr>
      `;
    }
  }
}
