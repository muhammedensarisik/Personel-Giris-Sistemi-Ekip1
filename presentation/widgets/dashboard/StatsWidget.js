/**
 * StatsWidget renders the compact quick info statistics cards at the top of the dashboard.
 */
export class StatsWidget {
  /**
   * Checks if a date falls on a weekend or a static Turkish public holiday
   * @param {Date} dateObj
   * @returns {boolean}
   */
  isHoliday(dateObj = new Date()) {
    const day = dateObj.getDay();
    const month = dateObj.getMonth() + 1;
    const date = dateObj.getDate();

    if (day === 0 || day === 6) {
      return true;
    }

    const mmdd = `${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    const publicHolidays = ['01-01', '04-23', '05-01', '05-19', '07-15', '08-30', '10-29'];

    return publicHolidays.includes(mmdd);
  }

  /**
   * Render compact quick info stats widget
   * @param {Object} stats - { totalEmployees, cameToday, lateToday, onLeaveToday, absentToday, pendingLeaves }
   * @returns {string} HTML string
   */
  render(stats) {
    const todayIsHoliday = this.isHoliday();
    
    const cameTodayValue = todayIsHoliday ? '—' : stats.cameToday;
    const lateTodayValue = todayIsHoliday ? '—' : stats.lateToday;
    
    const absentCount = stats.absentToday !== undefined 
      ? stats.absentToday 
      : Math.max(0, (stats.totalEmployees || 0) - (stats.cameToday || 0) - (stats.onLeaveToday || 0));

    const absentTodayValue = todayIsHoliday ? '—' : absentCount;
    const pendingLeavesValue = stats.pendingLeaves !== undefined ? stats.pendingLeaves : 2;

    return `
      <!-- Compact Quick Info Cards Grid (6 Columns - Draggable Widget) -->
      <div id="widget-stats" class="dashboard-draggable-widget grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 transition-all">
        
        <!-- Card 1: Toplam Personel -->
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Toplam</span>
            <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <i data-lucide="users" class="w-3.5 h-3.5"></i>
            </div>
          </div>
          <div class="text-xl font-extrabold text-slate-900 dark:text-white">${stats.totalEmployees}</div>
          <span class="text-[10px] font-semibold text-emerald-500 mt-1 block">Aktif Kadro</span>
        </div>

        <!-- Card 2: Bugün Mevcut -->
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mevcut</span>
            <div class="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
            </div>
          </div>
          <div class="text-xl font-extrabold text-slate-900 dark:text-white">${cameTodayValue}</div>
          <span class="text-[10px] font-semibold text-emerald-500 mt-1 block">Mesaide</span>
        </div>

        <!-- Card 3: Geç Kalan -->
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Geç Kalan</span>
            <div class="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <i data-lucide="clock" class="w-3.5 h-3.5"></i>
            </div>
          </div>
          <div class="text-xl font-extrabold text-slate-900 dark:text-white">${lateTodayValue}</div>
          <span class="text-[10px] font-semibold text-rose-500 mt-1 block">Gecikmeli</span>
        </div>

        <!-- Card 4: Devamsız -->
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Devamsız</span>
            <div class="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <i data-lucide="user-x" class="w-3.5 h-3.5"></i>
            </div>
          </div>
          <div class="text-xl font-extrabold text-slate-900 dark:text-white">${absentTodayValue}</div>
          <span class="text-[10px] font-semibold text-orange-500 mt-1 block">Gelmeyen</span>
        </div>

        <!-- Card 5: İzinli (Pop-up Modal Trigger) -->
        <div id="card-on-leave-stats" class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-4 shadow-xs hover:shadow-lg hover:border-amber-500/50 transition-all cursor-pointer group">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-semibold text-slate-400 group-hover:text-amber-600 uppercase tracking-wider transition-colors">İzinli</span>
            <div class="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <i data-lucide="calendar-off" class="w-3.5 h-3.5"></i>
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <div class="text-xl font-extrabold text-slate-900 dark:text-white">${stats.onLeaveToday}</div>
            <span class="text-[9px] font-bold text-amber-500 flex items-center gap-0.5">Detay <i data-lucide="chevron-right" class="w-2.5 h-2.5"></i></span>
          </div>
          <span class="text-[10px] font-semibold text-amber-500 mt-1 block">Planlı İzinli</span>
        </div>

        <!-- Card 6: Bekleyen İzin -->
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bekleyen İzin</span>
            <div class="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <i data-lucide="file-search" class="w-3.5 h-3.5"></i>
            </div>
          </div>
          <div class="text-xl font-extrabold text-slate-900 dark:text-white">${pendingLeavesValue}</div>
          <span class="text-[10px] font-semibold text-purple-500 mt-1 block">Onay Bekliyor</span>
        </div>

      </div>
    `;
  }
}
