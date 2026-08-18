import { ApiService } from './data/sources/ApiService.js';
import { PersonnelRepository } from './data/repositories/PersonnelRepository.js';
import { AddPersonnelUseCase } from './domain/usecases/AddPersonnelUseCase.js';

import { Sidebar } from './presentation/layout/Sidebar.js';
import { Header } from './presentation/layout/Header.js';

import { DashboardScreen } from './presentation/screens/DashboardScreen.js';
import { PersonnelScreen } from './presentation/screens/PersonnelScreen.js';
import { LogsScreen } from './presentation/screens/LogsScreen.js';
import { ReportsScreen } from './presentation/screens/ReportsScreen.js';
import { OvertimeScreen } from './presentation/screens/OvertimeScreen.js';
import { LeaveScreen } from './presentation/screens/LeaveScreen.js';
import { AnnouncementsScreen } from './presentation/screens/AnnouncementsScreen.js';
import { AuditLogsScreen } from './presentation/screens/AuditLogsScreen.js';
import { HolidaysScreen } from './presentation/screens/HolidaysScreen.js';
import { SupportTicketsScreen } from './presentation/screens/SupportTicketsScreen.js';
import { QrDisplayScreen } from './presentation/screens/QrDisplayScreen.js';

// Central Repository Layer instantiation for Clean Architecture
const apiService = new ApiService();
export const Repository = {
  personnel: new PersonnelRepository(apiService)
};

// Expose globally to align with legacy requirements and user query scripts
window.Repository = Repository;

/**
 * App - Root Application Controller
 */
class App {
  constructor() {
    this.apiService = apiService;
    this.personnelRepository = Repository.personnel;
    
    // 2. Initialize Use Cases
    this.addPersonnelUseCase = new AddPersonnelUseCase(this.personnelRepository);

    // 3. Initialize Presentation Layout Components
    this.sidebar = new Sidebar((tabId) => this.switchTab(tabId));
    this.header = new Header(this.apiService);

    this.screens = {
      dashboard: new DashboardScreen(this.personnelRepository),
      personeller: new PersonnelScreen(this.personnelRepository),
      logs: new LogsScreen(this.personnelRepository),
      overtime: new OvertimeScreen(this.personnelRepository),
      leave: new LeaveScreen(this.personnelRepository),
      holidays: new HolidaysScreen(this.personnelRepository),
      support: new SupportTicketsScreen(this.personnelRepository),
      duyurular: new AnnouncementsScreen(this.apiService),
      auditlogs: new AuditLogsScreen(this.apiService),
      raporlar: new ReportsScreen(this.personnelRepository, this.apiService),
      qr: new QrDisplayScreen(this.personnelRepository, this.apiService)
    };

    this.currentScreen = null;
    this.activeTab = 'dashboard';
  }

  /**
   * Bootstrap the application with Route Guard checks
   */
  async init() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const normalizedRole = (user?.role || '').toLowerCase();
        
        // Login Guard: Block standard 'User' role on initialization
        if (normalizedRole === 'user' || (!normalizedRole.includes('admin') && !normalizedRole.includes('manager'))) {
          this.handleLogout();
          return;
        }
        
        // Show App layout, hide Login layout
        document.getElementById('login-layout').classList.add('hidden');
        document.getElementById('app-layout').classList.remove('hidden');
        
        // Populate profile name & avatar elements
        this.updateProfileUI(user);
        
        // Initialize Header & Sidebar components (themes, notifications, collapsible sidebar)
        this.header.init();
        this.sidebar.init();
        this.updateCompanyBranding();

        try {
          const settings = await this.personnelRepository.getSystemSettings();
          if (settings) this.updateCompanyBranding(settings);
        } catch (e) {}
        
        // Setup Global Navigate tab listener
        window.addEventListener('navigateToTab', (e) => {
          if (e.detail && e.detail.tab) {
            this.switchTab(e.detail.tab);
          }
        });

        // Setup Browser Back / Forward button navigation (popstate)
        window.addEventListener('popstate', (e) => {
          let targetTab = 'dashboard';
          if (e.state && e.state.tab) {
            targetTab = e.state.tab;
          } else if (window.location.hash) {
            targetTab = window.location.hash.replace('#', '');
          }
          
          if (this.screens[targetTab]) {
            this.switchTab(targetTab, false);
          } else {
            this.switchTab('dashboard', false);
          }
        });

        // Determine initial screen from URL hash or default to 'dashboard'
        let initialTab = 'dashboard';
        const currentHash = window.location.hash ? window.location.hash.replace('#', '') : '';
        if (currentHash && this.screens[currentHash]) {
          initialTab = currentHash;
        }

        history.replaceState({ tab: initialTab }, '', `#${initialTab}`);
        await this.switchTab(initialTab, false);
        
      } catch (err) {
        this.handleLogout();
      }
    } else {
      // Not logged in: Show login page, hide app layout
      document.getElementById('app-layout').classList.add('hidden');
      const loginLayout = document.getElementById('login-layout');
      if (loginLayout) {
        loginLayout.classList.remove('hidden');
        
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
          loginForm.onsubmit = (e) => this.handleLogin(e);
        }
      }
    }
  }

  /**
   * Handles user authentication POST submission with Login Guard
   */
  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorAlert = document.getElementById('login-error-alert');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (errorAlert) errorAlert.classList.add('hidden');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Giriş Yapılıyor...</span>';
    }

    try {
      const res = await this.apiService.post('/api/auth/login-web', { email, passwordHash: password });
      
      if (res.success && res.data) {
        const user = res.data;
        const normalizedRole = (user?.role || '').toLowerCase();

        // Login Guard: Block standard 'User' role from entering panel
        if (normalizedRole === 'user' || (!normalizedRole.includes('admin') && !normalizedRole.includes('manager'))) {
          if (errorAlert) {
            errorAlert.textContent = 'Bu panele sadece Yöneticiler giriş yapabilir.';
            errorAlert.classList.remove('hidden');
          }
          return;
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        
        document.getElementById('login-layout').classList.add('hidden');
        document.getElementById('app-layout').classList.remove('hidden');
        
        this.updateProfileUI(user);
        this.header.init();
        
        try {
          const settings = await this.personnelRepository.getSystemSettings();
          if (settings) this.updateCompanyBranding(settings);
        } catch (e) {}
        await this.switchTab('dashboard');
        
        if (typeof window.showToast === 'function') {
          window.showToast(`Hoş geldiniz, ${user.fullName}!`, 'success');
        }
      } else {
        if (errorAlert) {
          errorAlert.textContent = res.error || 'Hatalı e-posta veya şifre.';
          errorAlert.classList.remove('hidden');
        }
      }
    } catch (err) {
      if (errorAlert) {
        errorAlert.textContent = 'Giriş işlemi başarısız. Bağlantınızı kontrol edin.';
        errorAlert.classList.remove('hidden');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Giriş Yap</span>';
      }
    }
  }

  /**
   * Safe logout clearing currentUser details
   */
  handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
  }

  /**
   * Dynamic profile initials and title mapper
   */
  updateProfileUI(user) {
    if (!user) return;
    
    const initials = this.getInitials(user.fullName);
    const normalizedRole = (user?.role || '').toLowerCase();
    
    let roleTitle = 'Yönetici';
    if (normalizedRole.includes('admin')) {
      roleTitle = 'Sistem Yöneticisi';
    } else if (normalizedRole.includes('manager') || normalizedRole.includes('müdür')) {
      roleTitle = 'Departman Müdürü';
    }
    
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const sidebarFullName = document.getElementById('sidebar-fullname');
    const sidebarRole = document.getElementById('sidebar-role');
    
    if (sidebarAvatar) sidebarAvatar.textContent = initials;
    if (sidebarFullName) sidebarFullName.textContent = user.fullName;
    if (sidebarRole) sidebarRole.textContent = roleTitle;
    
    const mobAvatar = document.getElementById('mob-sidebar-avatar');
    const mobFullName = document.getElementById('mob-sidebar-fullname');
    const mobRole = document.getElementById('mob-sidebar-role');
    
    if (mobAvatar) mobAvatar.textContent = initials;
    if (mobFullName) mobFullName.textContent = user.fullName;
    if (mobRole) mobRole.textContent = roleTitle;
    
    const headerAvatar = document.getElementById('header-avatar');
    const dropdownFullName = document.getElementById('dropdown-fullname');
    
    if (headerAvatar) headerAvatar.textContent = initials;
    if (dropdownFullName) dropdownFullName.textContent = user.fullName;
  }

  getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  /**
   * Switch the active screen / tab with browser history support
   * @param {string} tabId 
   * @param {boolean} pushToHistory - whether to update history state
   */
  async switchTab(tabId, pushToHistory = true) {
    if (!this.screens[tabId]) {
      tabId = 'dashboard';
    }

    // RBAC Check for QR Kod Yönetimi: Block non-Admin roles
    if (tabId === 'qr') {
      const user = this.getCurrentUser();
      const role = (user?.role || user?.Role || '').toLowerCase();
      if (role !== 'admin') {
        if (typeof window.showToast === 'function') {
          window.showToast('Bu sayfaya sadece Admin rolüne sahip kullanıcılar erişebilir.', 'error');
        }
        tabId = 'dashboard';
      }
    }

    this.activeTab = tabId;
    
    // Update browser history state and URL hash (#tabId)
    if (pushToHistory) {
      const hash = `#${tabId}`;
      if (window.location.hash !== hash) {
        history.pushState({ tab: tabId }, '', hash);
      }
    }

    // Update sidebar navigation indicators
    this.sidebar.setActiveTab(tabId);
    
    // Select main content element
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // Cleanup current active screen if destroy method exists
    if (this.currentScreen && typeof this.currentScreen.destroy === 'function') {
      this.currentScreen.destroy();
    }

    // Render screen
    const screen = this.screens[tabId];
    if (screen) {
      this.currentScreen = screen;
      await screen.render(mainContent);
    }
  }

  /**
   * Helper to retrieve currently logged in user object
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) return JSON.parse(userStr);
    } catch (e) {
      console.warn('Current user parsing failed:', e);
    }
    return null;
  }

  /**
   * Handle Role Selection change inside Add Employee modal
   */
  async handleRoleChange(role) {
    const currentUser = this.getCurrentUser();
    const isManager = (currentUser?.role || '').toLowerCase() === 'manager';

    const roleSelect = document.getElementById('emp-role');
    const roleLockBadge = document.getElementById('role-lock-badge');
    const roleFields = document.getElementById('conditional-role-fields');
    const managerFields = document.getElementById('conditional-manager-fields');
    const authFields = document.getElementById('conditional-auth-fields');
    const emailInput = document.getElementById('emp-email');
    const passwordInput = document.getElementById('emp-password');

    // 1. Manager Role Handling: Hide role dropdown and manager dropdown completely
    if (isManager) {
      if (roleSelect) {
        roleSelect.value = 'User';
      }
      if (roleFields) {
        roleFields.classList.add('hidden');
        roleFields.style.display = 'none';
      }
      if (managerFields) {
        managerFields.classList.add('hidden');
        managerFields.style.display = 'none';
      }
      // Show email & password inputs for manager to create user credentials
      if (authFields) authFields.classList.remove('hidden');
      if (emailInput) emailInput.required = false;
      if (passwordInput) passwordInput.required = false;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // 2. Admin User Handling: Make all fields visible
    if (roleFields) {
      roleFields.classList.remove('hidden');
      roleFields.style.display = 'block';
    }
    if (roleSelect) {
      roleSelect.disabled = false;
      roleSelect.classList.remove('cursor-not-allowed', 'opacity-70', 'bg-slate-100', 'dark:bg-slate-800/80');
    }
    if (roleLockBadge) {
      roleLockBadge.classList.add('hidden');
      roleLockBadge.classList.remove('flex');
    }

    if (role === 'Manager' || role === 'Admin') {
      if (authFields) authFields.classList.remove('hidden');
      if (managerFields) managerFields.classList.add('hidden');
      if (emailInput) emailInput.required = true;
      if (passwordInput) passwordInput.required = true;
    } else {
      // Default: 'User'
      if (authFields) authFields.classList.remove('hidden');
      if (managerFields) managerFields.classList.remove('hidden');
      if (emailInput) emailInput.required = false;
      if (passwordInput) passwordInput.required = false;
      await this.loadManagersDropdown();
    }
  }

  /**
   * Fetch managers list and populate Manager select dropdown
   */
  async loadManagersDropdown() {
    const select = document.getElementById('emp-manager-id');
    if (!select) return;

    try {
      const managers = await this.personnelRepository.getManagers();
      select.innerHTML = '<option value="">Yönetici Seçiniz (İsteğe Bağlı)</option>';
      if (Array.isArray(managers) && managers.length > 0) {
        managers.forEach(m => {
          select.innerHTML += `<option value="${m.id}">${m.fullName || m.fullName} (${m.department || 'Yönetici'})</option>`;
        });
      }
    } catch (e) {
      console.warn('Yöneticiler yüklenemedi:', e);
    }
  }

  /**
   * Add new employee submit form with RBAC security & C# backend model structure
   */
  async handleNewEmployeeSubmit(e) {
    e.preventDefault();
    const currentUser = this.getCurrentUser();
    const isManager = (currentUser?.role || '').toLowerCase() === 'manager';

    const currentUserId = currentUser?.id || currentUser?.userId || currentUser?.Id || '';
    const currentUserRole = currentUser?.role || currentUser?.Role || (isManager ? 'Manager' : 'Admin');

    const fullName = document.getElementById('emp-fullname').value.trim();
    const department = document.getElementById('emp-dept').value;
    const roleSelect = document.getElementById('emp-role');
    const role = isManager ? 'User' : (roleSelect?.value || 'User');
    
    const email = document.getElementById('emp-email')?.value.trim();
    const password = document.getElementById('emp-password')?.value.trim();
    const selectedManagerId = document.getElementById('emp-manager-id')?.value;

    // RBAC Security: Manager automatically becomes the new User's manager (currentUserId)
    const managerId = isManager
      ? (currentUserId || null)
      : (role === 'User' && selectedManagerId ? selectedManagerId : null);

    const payload = {
      FullName: fullName,
      Role: role,
      Department: department,
      Email: email || null,
      PasswordHash: password || null,
      ManagerId: managerId
    };

    const submitBtn = document.getElementById('btn-submit-employee');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Kaydediliyor...';
    }

    try {
      // Pass X-User-Role & X-User-Id headers explicitly to POST /api/personnel
      const res = await this.apiService.post('/api/personnel', payload, {
        headers: {
          'X-User-Id': currentUserId,
          'X-User-Role': currentUserRole
        }
      });
      
      if (res.success || res.status === 200 || res.status === 201) {
        if (typeof window.showToast === 'function') {
          window.showToast(`${fullName} sisteme eklendi.`, 'success');
        }

        this.header.addNotification({
          title: 'Yeni personel kaydı',
          desc: `${fullName} sisteme eklendi.`,
          type: 'info'
        });

        // Close Modal & Reset Form
        await this.toggleAddEmployeeModal();
        document.getElementById('add-employee-form').reset();

        // Refresh active screen
        if (this.activeTab === 'personeller') {
          await this.screens.personeller.loadEmployees();
        } else if (this.activeTab === 'dashboard') {
          await this.screens.dashboard.refreshData();
        }
      } else {
        if (typeof window.showToast === 'function') {
          window.showToast(res.error || 'Personel eklenemedi.', 'error');
        }
      }

    } catch (err) {
      if (typeof window.showToast === 'function') {
        window.showToast(err.message || 'Sunucu hatası oluştu.', 'error');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Kaydet';
      }
    }
  }

  /**
   * Modal Open/Close Toggler with RBAC role initialization
   */
  async toggleAddEmployeeModal() {
    const modal = document.getElementById('add-employee-modal');
    if (!modal) return;
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
      const currentUser = this.getCurrentUser();
      const isManager = (currentUser?.role || '').toLowerCase() === 'manager';
      const roleSelect = document.getElementById('emp-role');

      if (isManager && roleSelect) {
        roleSelect.value = 'User';
        roleSelect.disabled = true;
      } else if (roleSelect) {
        roleSelect.disabled = false;
      }

      await this.handleRoleChange(roleSelect?.value || 'User');
      const input = document.getElementById('emp-fullname');
      if (input) input.focus();
    }
  }

  /**
   * Dynamically updates Desktop and Mobile Sidebar headers with Company Name and Logo
   */
  updateCompanyBranding(settings = {}) {
    const companyName = settings.companyName || settings.CompanyName || localStorage.getItem('company_name') || 'Meram Belediyesi';
    const logoUrl = settings.logoUrl || settings.LogoUrl || localStorage.getItem('company_logo_url') || '';

    localStorage.setItem('company_name', companyName);
    if (logoUrl) {
      localStorage.setItem('company_logo_url', logoUrl);
    }

    const words = companyName.trim().split(' ');
    const initials = (words[0][0] + (words[1]?.[0] || '')).toUpperCase();

    const companyTitleEl = document.getElementById('sidebar-company-name');
    const logoBoxEl = document.getElementById('sidebar-logo-box');
    const mobCompanyTitleEl = document.getElementById('mob-sidebar-company-name');
    const mobLogoBoxEl = document.getElementById('mob-sidebar-logo-box');

    if (companyTitleEl) companyTitleEl.textContent = companyName;
    if (mobCompanyTitleEl) mobCompanyTitleEl.textContent = companyName;

    const logoHtml = logoUrl 
      ? `<img src="${logoUrl}" alt="${companyName}" class="w-full h-full object-contain p-0.5 rounded-lg" onerror="this.parentElement.innerHTML='${initials}'" />`
      : initials;

    if (logoBoxEl) logoBoxEl.innerHTML = logoHtml;
    if (mobLogoBoxEl) mobLogoBoxEl.innerHTML = logoHtml;
  }

  /**
   * Opens sleek dark-mode System Settings Modal dialog with 4 inputs:
   * - Mesai Başlangıç Saati
   * - Mesai Bitiş Saati
   * - Kurum Adı
   * - Kurum Logosu (URL)
   */
  async openSystemSettingsModal() {
    const oldModal = document.getElementById('modal-system-settings-overlay');
    if (oldModal) oldModal.remove();

    let settings = { companyName: "Meram Belediyesi", logoUrl: "", workStartTime: "08:30", workEndTime: "17:30" };
    try {
      const fetched = await this.personnelRepository.getSystemSettings();
      if (fetched) {
        settings = {
          companyName: fetched.companyName || fetched.CompanyName || localStorage.getItem('company_name') || "Meram Belediyesi",
          logoUrl: fetched.logoUrl || fetched.LogoUrl || localStorage.getItem('company_logo_url') || "",
          workStartTime: fetched.workStartTime || fetched.WorkStartTime || "08:30",
          workEndTime: fetched.workEndTime || fetched.WorkEndTime || "17:30"
        };
      }
    } catch (e) {}

    const modalWrapper = document.createElement('div');
    modalWrapper.id = 'modal-system-settings-overlay';
    modalWrapper.className = 'fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in';

    modalWrapper.innerHTML = `
      <div class="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-hidden relative flex flex-col">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-dark-border shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <i data-lucide="settings" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white text-base">Kurum & Sistem Ayarları</h3>
              <p class="text-[11px] text-slate-400">Kurum ismi, logo ve mesai başlangıç/bitiş saatleri</p>
            </div>
          </div>
          <button id="btn-close-settings-modal" class="text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Form Body -->
        <form id="form-system-settings" class="py-4 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
          
          <!-- Kurum Adı -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <i data-lucide="building-2" class="w-3.5 h-3.5 text-indigo-500"></i>
              Kurum Adı
            </label>
            <input type="text" id="setting-company-name" required value="${settings.companyName || 'Meram Belediyesi'}" placeholder="Örn: Meram Belediyesi" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <!-- Kurum Logosu (URL) -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <i data-lucide="image" class="w-3.5 h-3.5 text-indigo-500"></i>
              Kurum Logosu (URL / Görsel Yolu)
            </label>
            <input type="text" id="setting-logo-url" value="${settings.logoUrl || ''}" placeholder="https://ornek.com/logo.png veya /assets/logo.png" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
            <p class="text-[10px] text-slate-400 mt-1">Görsel URL'si boş bırakılırsa başharf rozeti gösterilir.</p>
          </div>

          <!-- Divider -->
          <div class="border-t border-slate-100 dark:border-slate-800 my-2"></div>

          <!-- Mesai Başlangıç Saati -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-indigo-500"></i>
              Mesai Başlangıç Saati
            </label>
            <input type="time" id="setting-work-start" required value="${settings.workStartTime || '08:30'}" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <!-- Mesai Bitiş Saati -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <i data-lucide="clock-4" class="w-3.5 h-3.5 text-purple-500"></i>
              Mesai Bitiş Saati
            </label>
            <input type="time" id="setting-work-end" required value="${settings.workEndTime || '17:30'}" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <!-- Footer Action Buttons -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
            <button type="button" id="btn-cancel-settings-modal" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer">
              İptal
            </button>
            <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/20">
              Ayarları Kaydet
            </button>
          </div>

        </form>

      </div>
    `;

    document.body.appendChild(modalWrapper);
    if (window.lucide) window.lucide.createIcons();

    const closeModal = () => modalWrapper.remove();
    document.getElementById('btn-close-settings-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-settings-modal')?.addEventListener('click', closeModal);

    modalWrapper.addEventListener('click', (e) => {
      if (e.target === modalWrapper) closeModal();
    });

    const form = document.getElementById('form-system-settings');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const compName = document.getElementById('setting-company-name').value.trim();
        const logo = document.getElementById('setting-logo-url').value.trim();
        const start = document.getElementById('setting-work-start').value;
        const end = document.getElementById('setting-work-end').value;

        const payload = {
          companyName: compName || "Meram Belediyesi",
          logoUrl: logo || null,
          workStartTime: start,
          workEndTime: end
        };

        try {
          await this.personnelRepository.updateSystemSettings(payload);
          this.updateCompanyBranding(payload);
          closeModal();

          if (this.currentTab === 'dashboard' && this.screens.dashboard) {
            await this.screens.dashboard.render(document.getElementById('content-area'));
          }
        } catch (err) {
          this.updateCompanyBranding(payload);
          closeModal();
          if (typeof window.showToast === 'function') {
            window.showToast("Ayarlar güncellendi.", "success");
          }
        }
      };
    }
  }

  /**
   * Modal Open/Close Toggler with RBAC role initialization
   */
  async toggleAddEmployeeModal() {
    const modal = document.getElementById('add-employee-modal');
    if (!modal) return;
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
      const currentUser = this.getCurrentUser();
      const isManager = (currentUser?.role || '').toLowerCase() === 'manager';
      const roleSelect = document.getElementById('emp-role');

      if (isManager && roleSelect) {
        roleSelect.value = 'User';
        roleSelect.disabled = true;
      } else if (roleSelect) {
        roleSelect.disabled = false;
      }

      await this.handleRoleChange(roleSelect?.value || 'User');
      const input = document.getElementById('emp-fullname');
      if (input) input.focus();
    }
  }

}

// Instantiate and bind to window for document markup access
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();

  // Expose global actions needed by static HTML inline listeners
  window.switchTab = (tabId) => app.switchTab(tabId);
  window.toggleTheme = () => app.header.toggleTheme();
  window.toggleNotifications = () => app.header.toggleNotifications();
  window.toggleProfileDropdown = () => app.header.toggleProfileDropdown();
  window.markAllNotificationsRead = () => app.header.markAllAsRead();
  window.toggleMobileSidebar = () => app.sidebar.toggleMobileSidebar();
  window.toggleSidebarCollapse = () => app.sidebar.toggleCollapse();
  window.handleNewEmployeeSubmit = (e) => app.handleNewEmployeeSubmit(e);
  window.toggleAddEmployeeModal = () => app.toggleAddEmployeeModal();
  window.openSystemSettingsModal = () => app.openSystemSettingsModal();
  window.handleRoleChange = (role) => app.handleRoleChange(role);
  window.handleLogout = () => app.handleLogout();
});
