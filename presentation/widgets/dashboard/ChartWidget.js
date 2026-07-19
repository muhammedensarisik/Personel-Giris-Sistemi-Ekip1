/**
 * ChartWidget manages the Chart.js line graph for weekly entry/exit trends.
 */
export class ChartWidget {
  constructor() {
    this.chartInstance = null;
    this.trendData = null;
    
    // Bind theme change handler
    this.handleThemeChange = this.handleThemeChange.bind(this);
    window.addEventListener('themeChanged', this.handleThemeChange);
  }

  /**
   * Render the HTML canvas wrapper
   */
  render() {
    return `
      <!-- Line Chart Container -->
      <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 shadow-xs lg:col-span-2 flex flex-col">
        <div class="mb-4">
          <h3 class="font-bold text-sm">Haftalık Giriş/Çıkış Trendi</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Son 5 iş günündeki giriş ve çıkış yapan personel sayıları</p>
        </div>
        <div class="relative flex-1 min-h-[260px] h-64">
          <canvas id="trendChart"></canvas>
        </div>
      </div>
    `;
  }

  /**
   * Initialize or update the Chart.js graphic
   * @param {Object} trendData - { labels: [], entries: [], exits: [] }
   */
  init(trendData) {
    this.trendData = trendData;
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? '#1e293b' : '#f1f5f9';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    
    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trendData.labels,
        datasets: [
          {
            label: 'Girişler',
            data: trendData.entries,
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.05)',
            tension: 0.35,
            fill: true,
            borderWidth: 2.5,
            pointBackgroundColor: '#4f46e5',
            pointHoverRadius: 6
          },
          {
            label: 'Çıkışlar',
            data: trendData.exits,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.02)',
            tension: 0.35,
            fill: true,
            borderWidth: 2.5,
            pointBackgroundColor: '#06b6d4',
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: textColor,
              boxWidth: 12,
              boxHeight: 12,
              font: {
                family: 'Plus Jakarta Sans',
                size: 11,
                weight: '600'
              }
            }
          },
          tooltip: {
            padding: 10,
            titleFont: { family: 'Plus Jakarta Sans', size: 11 },
            bodyFont: { family: 'Plus Jakarta Sans', size: 11 }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: textColor,
              font: {
                family: 'Plus Jakarta Sans',
                size: 10,
                weight: '500'
              }
            }
          },
          y: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              font: {
                family: 'Plus Jakarta Sans',
                size: 10,
                weight: '500'
              },
              stepSize: 1
            }
          }
        }
      }
    });
  }

  handleThemeChange() {
    if (this.trendData) {
      // Reinitialize to pick up correct grid/text colors
      setTimeout(() => this.init(this.trendData), 50);
    }
  }

  destroy() {
    window.removeEventListener('themeChanged', this.handleThemeChange);
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }
}
