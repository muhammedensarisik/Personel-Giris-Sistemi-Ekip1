/**
 * LeaveCalendarWidget displays an interactive monthly calendar with official holidays highlighted,
 * plus a full list of official national holidays.
 */
export class LeaveCalendarWidget {
  constructor() {
    this.currentDate = new Date(2026, 6, 15); // Default to July 2026 (matching screenshot)
    this.selectedDate = 20; // 20 Temmuz selected as per screenshot
    
    // Official Turkey Holidays Database
    this.holidays = [
      { date: '2026-01-01', dayMonth: '1 Ocak', name: 'Yılbaşı', duration: '1 Gün', month: 0, day: 1 },
      { date: '2026-03-19', dayMonth: '19 Mart', name: 'Ramazan Bayramı Arefesi', duration: '0.5 Gün', month: 2, day: 19 },
      { date: '2026-03-20', dayMonth: '20 Mart', name: 'Ramazan Bayramı 1. Gün', duration: '1 Gün', month: 2, day: 20 },
      { date: '2026-03-21', dayMonth: '21 Mart', name: 'Ramazan Bayramı 2. Gün', duration: '1 Gün', month: 2, day: 21 },
      { date: '2026-03-22', dayMonth: '22 Mart', name: 'Ramazan Bayramı 3. Gün', duration: '1 Gün', month: 2, day: 22 },
      { date: '2026-04-23', dayMonth: '23 Nisan', name: 'Ulusal Egemenlik B.', duration: '1 Gün', month: 3, day: 23 },
      { date: '2026-05-01', dayMonth: '1 Mayıs', name: 'Emek Bayramı', duration: '1 Gün', month: 4, day: 1 },
      { date: '2026-05-19', dayMonth: '19 Mayıs', name: 'Atatürk\'ü Anma, Gençlik ve Spor B.', duration: '1 Gün', month: 4, day: 19 },
      { date: '2026-05-26', dayMonth: '26 Mayıs', name: 'Kurban Bayramı Arefesi', duration: '0.5 Gün', month: 4, day: 26 },
      { date: '2026-05-27', dayMonth: '27 Mayıs', name: 'Kurban Bayramı 1. Gün', duration: '1 Gün', month: 4, day: 27 },
      { date: '2026-05-28', dayMonth: '28 Mayıs', name: 'Kurban Bayramı 2. Gün', duration: '1 Gün', month: 4, day: 28 },
      { date: '2026-05-29', dayMonth: '29 Mayıs', name: 'Kurban Bayramı 3. Gün', duration: '1 Gün', month: 4, day: 29 },
      { date: '2026-05-30', dayMonth: '30 Mayıs', name: 'Kurban Bayramı 4. Gün', duration: '1 Gün', month: 4, day: 30 },
      { date: '2026-07-15', dayMonth: '15 Temmuz', name: 'Demokrasi ve Milli Birlik Günü', duration: '1 Gün', month: 6, day: 15 },
      { date: '2026-08-30', dayMonth: '30 Ağustos', name: 'Zafer Bayramı', duration: '1 Gün', month: 7, day: 30 },
      { date: '2026-10-29', dayMonth: '29 Ekim', name: 'Cumhuriyet Bayramı', duration: '1 Gün', month: 9, day: 29 }
    ];

    this.monthNames = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
  }

  render() {
    return `
      <div class="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-xs">
        <!-- Card Title -->
        <div class="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-dark-border">
          <i data-lucide="calendar" class="w-5 h-5 text-blue-600 dark:text-blue-400"></i>
          <h3 class="font-bold text-slate-800 dark:text-white text-sm">
            <span id="calendar-card-year">${this.currentDate.getFullYear()}</span> Resmi Tatiller ve Takvim
          </h3>
        </div>

        <!-- Month & Year Navigation Header -->
        <div class="flex items-center justify-between mb-4 px-1">
          <button id="btn-prev-month" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors cursor-pointer">
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
          </button>

          <div class="flex items-center gap-2 font-semibold text-slate-800 dark:text-white text-sm">
            <select id="calendar-month-select" class="bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 py-1 px-2 rounded-lg cursor-pointer font-bold focus:outline-none">
              ${this.monthNames.map((m, idx) => `<option value="${idx}" ${idx === this.currentDate.getMonth() ? 'selected' : ''}>${m}</option>`).join('')}
            </select>

            <select id="calendar-year-select" class="bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 py-1 px-2 rounded-lg cursor-pointer font-bold focus:outline-none">
              ${[2024, 2025, 2026, 2027].map(y => `<option value="${y}" ${y === this.currentDate.getFullYear() ? 'selected' : ''}>${y}</option>`).join('')}
            </select>
          </div>

          <button id="btn-next-month" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors cursor-pointer">
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Calendar Days Grid -->
        <div class="mb-6">
          <!-- Weekday Headers -->
          <div class="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 mb-2">
            <div>Pzt</div>
            <div>Sal</div>
            <div>Çar</div>
            <div>Per</div>
            <div>Cum</div>
            <div>Cmt</div>
            <div>Paz</div>
          </div>

          <!-- Days Grid Container -->
          <div id="calendar-days-grid" class="grid grid-cols-7 gap-y-1 text-center text-xs">
            <!-- Dynamic days -->
          </div>
        </div>

        <!-- Official Holidays Section Header -->
        <div class="pt-4 border-t border-slate-100 dark:border-dark-border">
          <div class="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3">
            Resmî Tatil Listesi
          </div>

          <!-- Official Holidays List -->
          <div id="holiday-list-container" class="space-y-2.5 max-h-60 overflow-y-auto pr-1 text-xs">
            ${this.renderHolidayList()}
          </div>
        </div>
      </div>
    `;
  }

  renderDaysGrid() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // First day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(year, month, 1);
    let startingDay = firstDay.getDay(); // 0 is Sunday
    startingDay = startingDay === 0 ? 6 : startingDay - 1; // Convert to Monday = 0

    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    let html = '';

    // Days from previous month
    for (let i = startingDay - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      html += `<div class="py-2 text-slate-300 dark:text-slate-600">${dayNum}</div>`;
    }

    // Days for current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const isSelected = (d === this.selectedDate);
      const isHoliday = this.holidays.some(h => h.month === month && h.day === d);

      let dayClasses = "w-8 h-8 mx-auto flex items-center justify-center rounded-full transition-all cursor-pointer font-medium ";

      if (isSelected) {
        dayClasses += "bg-blue-600 text-white font-bold shadow-xs";
      } else if (isHoliday) {
        dayClasses += "border-2 border-rose-500 text-rose-600 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30";
      } else {
        dayClasses += "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";
      }

      html += `
        <div class="py-1">
          <div class="${dayClasses}" data-day="${d}">
            ${d}
          </div>
        </div>
      `;
    }

    // Days for next month to complete grid
    const totalCells = startingDay + totalDaysInMonth;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let n = 1; n <= remainingCells; n++) {
      html += `<div class="py-2 text-slate-300 dark:text-slate-600">${n}</div>`;
    }

    return html;
  }

  renderHolidayList() {
    return this.holidays.map(h => `
      <div class="flex items-center justify-between text-xs py-1 border-b border-dashed border-slate-100 dark:border-dark-border/50 last:border-none">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-900 dark:text-white min-w-[65px]">${h.dayMonth}</span>
          <span class="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[140px]">${h.name}</span>
        </div>
        <span class="text-slate-400 font-medium text-[11px]">${h.duration}</span>
      </div>
    `).join('');
  }

  initListeners(container) {
    const grid = container.querySelector('#calendar-days-grid');
    if (grid) {
      grid.innerHTML = this.renderDaysGrid();

      // Bind day selection
      grid.querySelectorAll('[data-day]').forEach(el => {
        el.addEventListener('click', (e) => {
          const day = parseInt(e.currentTarget.getAttribute('data-day'), 10);
          this.selectedDate = day;
          grid.innerHTML = this.renderDaysGrid();
          this.initListeners(container);
        });
      });
    }

    const monthSelect = container.querySelector('#calendar-month-select');
    if (monthSelect) {
      monthSelect.onchange = (e) => {
        const m = parseInt(e.target.value, 10);
        this.currentDate.setMonth(m);
        this.updateCalendar(container);
      };
    }

    const yearSelect = container.querySelector('#calendar-year-select');
    if (yearSelect) {
      yearSelect.onchange = (e) => {
        const y = parseInt(e.target.value, 10);
        this.currentDate.setFullYear(y);
        this.updateCalendar(container);
      };
    }

    const prevBtn = container.querySelector('#btn-prev-month');
    if (prevBtn) {
      prevBtn.onclick = () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.updateCalendar(container);
      };
    }

    const nextBtn = container.querySelector('#btn-next-month');
    if (nextBtn) {
      nextBtn.onclick = () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.updateCalendar(container);
      };
    }
  }

  updateCalendar(container) {
    const yearSpan = container.querySelector('#calendar-card-year');
    if (yearSpan) yearSpan.textContent = this.currentDate.getFullYear();

    const monthSelect = container.querySelector('#calendar-month-select');
    if (monthSelect) monthSelect.value = this.currentDate.getMonth();

    const yearSelect = container.querySelector('#calendar-year-select');
    if (yearSelect) yearSelect.value = this.currentDate.getFullYear();

    this.initListeners(container);
  }
}
