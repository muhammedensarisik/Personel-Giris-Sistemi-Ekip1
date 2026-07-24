/**
 * DelayStatusWidget renders 2 Donut Charts for the Right Analytics Column:
 * 1. Günlük Durum (Daily Status: Mevcut, Geç, Devamsız, İzinli)
 * 2. Departman Dağılımı (Department Personnel Distribution)
 */
export class DelayStatusWidget {
  constructor() {
    this.dailyChartInstance = null;
    this.deptChartInstance = null;

    // Bind theme change handler
    this.handleThemeChange = this.handleThemeChange.bind(this);
    window.addEventListener('themeChanged', this.handleThemeChange);
  }

  render() {
    return `
      <div id="widget-donut-charts" class="dashboard-draggable-widget space-y-6 transition-all">
        
        <!-- Donut Chart 1: Günlük Durum -->
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 shadow-xs">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white text-base">Günlük Durum Oranları</h3>
              <p class="text-xs text-slate-400 mt-0.5">Bugünkü devam ve katılım dağılımı</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                %85 Katılım
              </span>
              <span class="widget-drag-handle p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing" title="Sürükle">
                <i data-lucide="grip-vertical" class="w-4 h-4"></i>
              </span>
            </div>
          </div>

          <!-- Donut Chart Canvas -->
          <div class="relative w-40 h-40 mx-auto my-4 flex items-center justify-center">
            <canvas id="daily-status-chart"></canvas>
          </div>

          <!-- Legend breakdown list -->
          <div class="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100 dark:border-dark-border">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300 font-medium">Mevcut (%75)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300 font-medium">Geç (%10)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300 font-medium">Devamsız (%8)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300 font-medium">İzinli (%7)</span>
            </div>
          </div>
        </div>

        <!-- Donut Chart 2: Departman Dağılımı -->
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 shadow-xs">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white text-base">Departman Dağılımı</h3>
              <p class="text-xs text-slate-400 mt-0.5">Personel birim dağılım oranları</p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
              5 Departman
            </span>
          </div>

          <!-- Donut Chart Canvas -->
          <div class="relative w-40 h-40 mx-auto my-4 flex items-center justify-center">
            <canvas id="department-dist-chart"></canvas>
          </div>

          <!-- Legend breakdown list -->
          <div class="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100 dark:border-dark-border">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300 font-medium">Yazılım (%35)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300 font-medium">İnsan Kaynakları (%20)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300 font-medium">Pazarlama (%20)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300 font-medium">Finans (%15)</span>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  init() {
    this.initDailyStatusChart();
    this.initDepartmentDistChart();
  }

  initDailyStatusChart() {
    const ctx = document.getElementById('daily-status-chart');
    if (!ctx || !window.Chart) return;

    if (this.dailyChartInstance) {
      this.dailyChartInstance.destroy();
    }

    this.dailyChartInstance = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Mevcut', 'Geç', 'Devamsız', 'İzinli'],
        datasets: [{
          data: [75, 10, 8, 7],
          backgroundColor: ['#10b981', '#f43f5e', '#f97316', '#f59e0b'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: %${context.raw}`
            }
          }
        }
      }
    });
  }

  initDepartmentDistChart() {
    const ctx = document.getElementById('department-dist-chart');
    if (!ctx || !window.Chart) return;

    if (this.deptChartInstance) {
      this.deptChartInstance.destroy();
    }

    this.deptChartInstance = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Yazılım', 'İnsan Kaynakları', 'Pazarlama', 'Finans', 'Operasyon'],
        datasets: [{
          data: [35, 20, 20, 15, 10],
          backgroundColor: ['#6366f1', '#06b6d4', '#a855f7', '#f59e0b', '#10b981'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: %${context.raw}`
            }
          }
        }
      }
    });
  }

  handleThemeChange() {
    setTimeout(() => this.init(), 50);
  }

  destroy() {
    window.removeEventListener('themeChanged', this.handleThemeChange);
    if (this.dailyChartInstance) this.dailyChartInstance.destroy();
    if (this.deptChartInstance) this.deptChartInstance.destroy();
  }
}
