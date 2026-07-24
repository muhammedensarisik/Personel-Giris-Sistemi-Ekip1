/**
 * ThemeManager - Centralized Theme Management Module
 * Manages light/dark mode state, localStorage persistence, DOM class toggling,
 * icon state updates, and global theme change event broadcasts.
 */
export class ThemeManager {
  static STORAGE_KEY = 'antigravity_theme';

  /**
   * Initializes the application theme state upon boot
   */
  static init() {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    this.setTheme(initialTheme);
  }

  /**
   * Gets current active theme ('dark' | 'light')
   */
  static getTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  /**
   * Sets theme explicitly and updates DOM, localStorage, icons, and listeners
   * @param {'dark' | 'light'} theme 
   */
  static setTheme(theme) {
    const htmlEl = document.documentElement;
    const lightIcon = document.getElementById('theme-icon-light');
    const darkIcon = document.getElementById('theme-icon-dark');

    if (theme === 'dark') {
      htmlEl.classList.add('dark');
      htmlEl.classList.remove('light');
      if (lightIcon) lightIcon.classList.remove('hidden');
      if (darkIcon) darkIcon.classList.add('hidden');
    } else {
      htmlEl.classList.remove('dark');
      htmlEl.classList.add('light');
      if (lightIcon) lightIcon.classList.add('hidden');
      if (darkIcon) darkIcon.classList.remove('hidden');
    }

    localStorage.setItem(this.STORAGE_KEY, theme);

    // Broadcast global theme change event for charts and dynamic widgets
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  /**
   * Toggles theme between dark and light
   */
  static toggleTheme() {
    const current = this.getTheme();
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
    return nextTheme;
  }
}
