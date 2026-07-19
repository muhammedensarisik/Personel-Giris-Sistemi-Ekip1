/**
 * ReportsScreen renders department percentage bars and monthly files downloads list
 */
export class ReportsScreen {
  async render(container) {
    container.innerHTML = `
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Raporlar & Analizler</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Genel performans, aylık mesai saatleri ve gecikme analiz raporları.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <!-- Report Download Widget -->
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 shadow-xs">
          <h3 class="font-bold text-sm mb-4">Hazır Rapor İndir</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Şirketinizin veri güvenliğine uygun şekilde oluşturulmuş Excel ve PDF formatında katılım raporları.</p>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 border border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/10 rounded-xl hover:border-slate-200 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <i data-lucide="file-text" class="w-4 h-4"></i>
                </div>
                <div>
                  <h4 class="text-xs font-semibold">Temmuz 2026 Katılım Raporu</h4>
                  <p class="text-[10px] text-slate-400">PDF • 2.4 MB • Güncel</p>
                </div>
              </div>
              <button class="btn-download-report p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg cursor-pointer" data-name="Temmuz 2026 Katılım Raporu (PDF)">
                <i data-lucide="download" class="w-4 h-4"></i>
              </button>
            </div>

            <div class="flex items-center justify-between p-3 border border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/10 rounded-xl hover:border-slate-200 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
                </div>
                <div>
                  <h4 class="text-xs font-semibold">Haziran 2026 Giriş/Çıkış Tablosu</h4>
                  <p class="text-[10px] text-slate-400">XLSX • 1.1 MB • 1 ay önce</p>
                </div>
              </div>
              <button class="btn-download-report p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg cursor-pointer" data-name="Haziran 2026 Giriş/Çıkış Tablosu (XLSX)">
                <i data-lucide="download" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Performance Widget -->
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 shadow-xs">
          <h3 class="font-bold text-sm mb-4">Departman Dağılımları</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Şirket içi personellerin departman bazında yüzde dağılımı</p>
          
          <div class="space-y-4">
            <div>
              <div class="flex justify-between items-center text-xs font-semibold mb-1">
                <span>Yazılım Geliştirme (IT)</span>
                <span class="text-slate-500">40%</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-600 rounded-full" style="width: 40%"></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between items-center text-xs font-semibold mb-1">
                <span>İnsan Kaynakları (IK)</span>
                <span class="text-slate-500">20%</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-500 rounded-full" style="width: 20%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center text-xs font-semibold mb-1">
                <span>Tasarım (UI/UX)</span>
                <span class="text-slate-500">20%</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 rounded-full" style="width: 20%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center text-xs font-semibold mb-1">
                <span>Yönetim / PM</span>
                <span class="text-slate-500">20%</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="h-full bg-amber-500 rounded-full" style="width: 20%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind click events
    const downloadBtns = container.querySelectorAll('.btn-download-report');
    downloadBtns.forEach(btn => {
      btn.onclick = () => {
        const name = btn.getAttribute('data-name');
        if (typeof window.showToast === 'function') {
          window.showToast(`${name} başarıyla indirildi.`, 'success');
        }
      };
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}
