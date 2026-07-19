/**
 * Overtime Entity represents an employee's extra hours worked.
 */
export class Overtime {
  constructor({ id, userId, date = null, hours = 0, description = '' }) {
    this.id = id;
    this.userId = userId;
    this.date = date || new Date().toISOString();
    this.hours = hours;
    this.description = description;
  }

  /**
   * Formats the overtime date to localized Turkish representation (DD.MM.YYYY)
   * @returns {string}
   */
  getFormattedDate() {
    try {
      return new Date(this.date).toLocaleDateString('tr-TR');
    } catch (e) {
      return 'Bilinmiyor';
    }
  }
}
