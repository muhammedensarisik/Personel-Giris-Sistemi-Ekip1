/**
 * AttendanceTableWidget renders the list of attendances inside a structured Data Table grid.
 */
export class AttendanceTableWidget {
  /**
   * @param {Function} onDetailClick - callback when "Detay" button is clicked
   */
  constructor(onDetailClick) {
    this.onDetailClick = onDetailClick;
    this.attendances = [];
  }

  render() {
    return `
      <!-- Data Table Shell -->
      <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-xs">
            <thead>
              <tr class="border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/20 text-slate-500 font-semibold">
                <th class="px-6 py-4">İsim / Rol</th>
                <th class="px-6 py-4">Departman</th>
                <th class="px-6 py-4">Giriş Zamanı</th>
                <th class="px-6 py-4">Çıkış Zamanı</th>
                <th class="px-6 py-4">Durum</th>
                <th class="px-6 py-4 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody id="attendance-table-body" class="divide-y divide-slate-100 dark:divide-dark-border">
              <!-- Dynamically populated rows -->
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Update table content with strict date formatting and optional chaining checks
   * @param {Array<Object>} list - mapped attendance objects 
   * @param {Array<Object>} employees - resolved personnel list
   */
  update(list, employees) {
    this.attendances = list;
    const tbody = document.getElementById('attendance-table-body');
    if (!tbody) return;

    if (!list || list?.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-8 text-center text-slate-400">Eşleşen giriş/çıkış kaydı bulunamadı.</td>
        </tr>
      `;
      return;
    }

    // Format dates to DD.MM HH:MM (toLocaleString)
    const formatTime = (rawTime) => {
      if (!rawTime || rawTime === 'null' || rawTime === 'undefined' || rawTime === '') {
        return '—';
      }

      try {
        const date = new Date(rawTime);
        if (isNaN(date.getTime())) {
          return '—';
        }

        // Output format: DD.MM HH:MM (e.g. 18.07 16:50)
        return date.toLocaleString('tr-TR', { 
          day: '2-digit', 
          month: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } catch (e) {
        return '—';
      }
    };

    tbody.innerHTML = list.map(item => {
      // Find employee details with safety checks
      const emp = employees?.find(e => e?.id === item?.employeeId) || { 
        fullName: 'Bilinmeyen Personel', 
        role: 'Bilinmeyen', 
        department: 'Bilinmeyen', 
        avatar: 'BP' 
      };
      
      let entryTimeText = formatTime(item?.entryTime);
      const exitTimeText = formatTime(item?.exitTime);

      // Determine Status badge
      const isInside = !item?.exitTime || item?.exitTime === 'null' || item?.exitTime === '';
      let badgeStyle = 'text-slate-600 bg-slate-50 dark:text-slate-300 dark:bg-slate-900';
      let statusText = 'Bilinmiyor';

      if (isInside) {
        badgeStyle = 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/20';
        statusText = 'İçeride';

        // Check if checkInTime is missing due to database NULL state
        if (!item?.entryTime || item?.entryTime === 'null' || item?.entryTime === '') {
          console.warn(`Veritabanı Hatası: Kayıt ID ${item?.id} 'İçeride' durumunda ancak Giriş Zamanı NULL/boş!`);
          entryTimeText = '<span class="text-rose-500 font-semibold">Giriş Yok (Veritabanı Hatası)</span>';
        }
      } else {
        if (item?.status === 'Gecikmeli') {
          badgeStyle = 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20';
          statusText = 'Gecikmeli';
        } else {
          badgeStyle = 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20';
          statusText = 'Dışarıda';
        }
      }

      return `
        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                ${emp?.avatar || '??'}
              </div>
              <div>
                <div class="font-semibold text-slate-900 dark:text-white">${emp?.fullName || 'Bilinmeyen'}</div>
                <div class="text-[10px] text-slate-400 font-medium">${emp?.role || 'Bilinmeyen'}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4">
            <span class="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">${emp?.department || 'Bilinmeyen'}</span>
          </td>
          <td class="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">${entryTimeText}</td>
          <td class="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">${exitTimeText}</td>
          <td class="px-6 py-4">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeStyle}">
              ${statusText}
            </span>
          </td>
          <td class="px-6 py-4 text-right">
            <button class="btn-attendance-detail px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 dark:text-indigo-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer" data-id="${item?.id}">
              Detay
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach listeners
    const detailBtns = tbody.querySelectorAll('.btn-attendance-detail');
    detailBtns.forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const match = this.attendances?.find(a => a?.id?.toString() === id?.toString());
        if (match && this.onDetailClick) {
          this.onDetailClick(match, employees);
        }
      };
    });
  }
}
