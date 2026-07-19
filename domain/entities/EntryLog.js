/**
 * EntryLog Entity represents a card entry/exit event
 */
export class EntryLog {
  constructor({ id, employeeId, type, time = null, status = 'Zamanında' }) {
    this.id = id;
    this.employeeId = employeeId;
    this.type = type; // 'Giriş' or 'Çıkış' or 'İzinli'
    this.time = time || new Date().toISOString();
    this.status = status; // 'Zamanında', 'Gecikmeli', 'Planlı'
  }

  /**
   * Localizes time representation to Turkish standard HH:MM
   * @returns {string}
   */
  getFormattedTime() {
    try {
      const date = new Date(this.time);
      if (isNaN(date.getTime())) {
        // Return string if already formatted
        return this.time;
      }
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return this.time;
    }
  }

  /**
   * Localizes time representation to Turkish standard DD.MM.YYYY HH:MM
   * @returns {string}
   */
  getFormattedDateTime() {
    try {
      const date = new Date(this.time);
      if (isNaN(date.getTime())) {
        return this.time;
      }
      return date.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return this.time;
    }
  }
}
