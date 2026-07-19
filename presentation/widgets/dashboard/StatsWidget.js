/**
 * StatsWidget renders the 4 statistics cards at the top of the dashboard.
 */
export class StatsWidget {
  /**
   * Checks if a date falls on a weekend or a static Turkish public holiday
   * @param {Date} dateObj
   * @returns {boolean}
   */
  isHoliday(dateObj = new Date()) {
    const day = dateObj.getDay();
    const month = dateObj.getMonth() + 1; // 0-11 -> 1-12
    const date = dateObj.getDate();

    // Weekend: Saturday (6) or Sunday (0)
    if (day === 0 || day === 6) {
      return true;
    }

    // Static Turkish Public Holidays: MM-DD
    const mmdd = `${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    const publicHolidays = [
      '01-01', // Yılbaşı
      '04-23', // 23 Nisan Ulusal Egemenlik ve Çocuk Bayramı
      '05-01', // 1 Mayıs Emek ve Dayanışma Günü
      '05-19', // 19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı
      '07-15', // 15 Temmuz Demokrasi ve Milli Birlik Günü
      '08-30', // 30 Ağustos Zafer Bayramı
      '10-29'  // 29 Ekim Cumhuriyet Bayramı
    ];

    return publicHolidays.includes(mmdd);
  }

  /**
   * Render the stats widget
   * @param {Object} stats - { totalEmployees, cameToday, lateToday, onLeaveToday }
   * @returns {string} HTML string
   */
  render(stats) {
    const todayIsHoliday = this.isHoliday();
    
    // Configure holiday values
    const cameTodayValue = todayIsHoliday ? '— (Tatil)' : stats.cameToday;
    const cameTodayLabel = todayIsHoliday ? 'Resmi tatil veya hafta sonu' : 'kişi giriş yaptı';
    
    const lateTodayValue = todayIsHoliday ? '— (Tatil)' : stats.lateToday;
    const lateTodayLabel = todayIsHoliday ? 'Resmi tatil veya hafta sonu' : 'Gecikmeli Giriş';

    return `
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <!-- Card 1: Toplam Personel -->
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Toplam Personel</span>
            <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <i data-lucide="users" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900 dark:text-white">${stats.totalEmployees}</span>
            <span class="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
              <i data-lucide="trending-up" class="w-3 h-3"></i> Aktif
            </span>
          </div>
        </div>

        <!-- Card 2: Bugün Gelen -->
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Bugün Gelen</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <i data-lucide="check-circle" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900 dark:text-white">${cameTodayValue}</span>
            <span class="text-xs font-semibold text-slate-400">${cameTodayLabel}</span>
          </div>
        </div>

        <!-- Card 3: Geç Kalan -->
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Geç Kalan</span>
            <div class="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <i data-lucide="clock" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900 dark:text-white">${lateTodayValue}</span>
            <span class="text-xs font-semibold text-rose-500">${lateTodayLabel}</span>
          </div>
        </div>

        <!-- Card 4: İzinli -->
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wide">İzinli</span>
            <div class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <i data-lucide="calendar-off" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900 dark:text-white">${stats.onLeaveToday}</span>
            <span class="text-xs font-semibold text-amber-500">Planlı İzinli</span>
          </div>
        </div>

      </div>
    `;
  }
}
