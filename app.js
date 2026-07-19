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
      raporlar: new ReportsScreen()
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
        
        // Show App layout, hide Login layout
        document.getElementById('login-layout').classList.add('hidden');
        document.getElementById('app-layout').classList.remove('hidden');
        
        // Populate profile name & avatar elements
        this.updateProfileUI(user);
        
        // Initialize Header components (themes, notifications)
        this.header.init();
        
        // Setup Global Navigate tab listener
        window.addEventListener('navigateToTab', (e) => {
          if (e.detail && e.detail.tab) {
            this.switchTab(e.detail.tab);
          }
        });

        // Render initial screen (Dashboard)
        await this.switchTab('dashboard');
        
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
   * Handles user authentication POST submission
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
      const res = await this.apiService.post('/api/auth/login', { email, passwordHash: password });
      
      if (res.success && res.data) {
        localStorage.setItem('currentUser', JSON.stringify(res.data));
        
        document.getElementById('login-layout').classList.add('hidden');
        document.getElementById('app-layout').classList.remove('hidden');
        
        this.updateProfileUI(res.data);
        this.header.init();
        await this.switchTab('dashboard');
        
        if (typeof window.showToast === 'function') {
          window.showToast(`Hoş geldiniz, ${res.data.fullName}!`, 'success');
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
    const roleName = user.role === 'Admin' ? 'Sistem Yöneticisi' : 'Departman Müdürü';
    
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const sidebarFullName = document.getElementById('sidebar-fullname');
    const sidebarRole = document.getElementById('sidebar-role');
    
    if (sidebarAvatar) sidebarAvatar.textContent = initials;
    if (sidebarFullName) sidebarFullName.textContent = user.fullName;
    if (sidebarRole) sidebarRole.textContent = roleName;
    
    const mobAvatar = document.getElementById('mob-sidebar-avatar');
    const mobFullName = document.getElementById('mob-sidebar-fullname');
    const mobRole = document.getElementById('mob-sidebar-role');
    
    if (mobAvatar) mobAvatar.textContent = initials;
    if (mobFullName) mobFullName.textContent = user.fullName;
    if (mobRole) mobRole.textContent = roleName;
    
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
   * Switch the active screen / tab
   * @param {string} tabId 
   */
  async switchTab(tabId) {
    this.activeTab = tabId;
    
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
   * Add new employee submit form
   */
  async handleNewEmployeeSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('emp-fullname').value;
    const dept = document.getElementById('emp-dept').value;
    const role = document.getElementById('emp-role').value;

    const data = {
      fullName: name,
      department: dept,
      role: role,
      status: 'Aktif'
    };

    // Close Modal
    this.toggleAddEmployeeModal();

    try {
      // Execute Add Use Case
      const addedPersonnel = await this.addPersonnelUseCase.execute(data);
      
      // Inject alert notification into Header UI
      this.header.addNotification({
        title: 'Yeni personel kaydı',
        desc: `${addedPersonnel.fullName} sisteme eklendi.`,
        type: 'info'
      });

      // Refresh current screen if visible
      if (this.activeTab === 'personeller') {
        await this.screens.personeller.loadEmployees();
      } else if (this.activeTab === 'dashboard') {
        await this.screens.dashboard.refreshData();
      }

    } catch (err) {
      if (typeof window.showToast === 'function') {
        window.showToast(err.message, 'error');
      }
    }

    // Reset Form
    document.getElementById('add-employee-form').reset();
  }

  /**
   * Modal Open/Close Toggler
   */
  toggleAddEmployeeModal() {
    const modal = document.getElementById('add-employee-modal');
    if (!modal) return;
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
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
  window.handleNewEmployeeSubmit = (e) => app.handleNewEmployeeSubmit(e);
  window.toggleAddEmployeeModal = () => app.toggleAddEmployeeModal();
  window.handleLogout = () => app.handleLogout();
});
