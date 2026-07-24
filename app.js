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
      duyurular: new AnnouncementsScreen(this.apiService),
      auditlogs: new AuditLogsScreen(this.apiService),
      raporlar: new ReportsScreen(this.personnelRepository, this.apiService)
    };

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

    // Render screen
    const screen = this.screens[tabId];
    if (screen) {
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
    const managerFields = document.getElementById('conditional-manager-fields');
    const authFields = document.getElementById('conditional-auth-fields');
    const emailInput = document.getElementById('emp-email');
    const passwordInput = document.getElementById('emp-password');

    // If Manager is logged in, force role to User and lock dropdown visually
    if (isManager) {
      if (roleSelect) {
        roleSelect.value = 'User';
        roleSelect.disabled = true;
        roleSelect.classList.add('cursor-not-allowed', 'opacity-70', 'bg-slate-100', 'dark:bg-slate-800/80');
      }
      if (roleLockBadge) {
        roleLockBadge.classList.remove('hidden');
        roleLockBadge.classList.add('flex');
      }
      if (managerFields) managerFields.classList.add('hidden');
      if (authFields) authFields.classList.add('hidden');
      if (emailInput) emailInput.required = false;
      if (passwordInput) passwordInput.required = false;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // Admin user handling: unlock selection
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
      if (authFields) authFields.classList.add('hidden');
      if (managerFields) managerFields.classList.remove('hidden');
      if (emailInput) {
        emailInput.required = false;
        emailInput.value = '';
      }
      if (passwordInput) {
        passwordInput.required = false;
        passwordInput.value = '';
      }
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

    const fullName = document.getElementById('emp-fullname').value.trim();
    const department = document.getElementById('emp-dept').value;
    const roleSelect = document.getElementById('emp-role');
    const role = isManager ? 'User' : (roleSelect?.value || 'User');
    
    const email = document.getElementById('emp-email')?.value.trim();
    const password = document.getElementById('emp-password')?.value.trim();
    const selectedManagerId = document.getElementById('emp-manager-id')?.value;

    // RBAC Security: Manager automatically becomes the new User's manager (currentUser.id)
    const managerId = isManager
      ? (currentUser?.id || null)
      : (role === 'User' && selectedManagerId ? selectedManagerId : null);

    const payload = {
      FullName: fullName,
      Role: role,
      Department: department,
      Email: (role === 'User') ? null : (email || null),
      PasswordHash: (role === 'User') ? null : (password || null),
      ManagerId: managerId
    };

    const submitBtn = document.getElementById('btn-submit-employee');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Kaydediliyor...';
    }

    try {
      // Send directly to API / Repository
      const res = await this.apiService.post('/api/personnel', payload);
      
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
  window.handleRoleChange = (role) => app.handleRoleChange(role);
  window.handleLogout = () => app.handleLogout();
});
