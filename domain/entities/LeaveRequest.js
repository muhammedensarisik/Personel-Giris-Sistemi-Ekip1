/**
 * LeaveRequest Entity represents an employee's requested time off.
 */
export class LeaveRequest {
  constructor({ id, userId, leaveType = '', startDate = null, endDate = null, status = 'Beklemede' }) {
    this.id = id;
    this.userId = userId;
    this.leaveType = leaveType;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
  }

  /**
   * Formats a date to localized Turkish representation (DD.MM.YYYY)
   * @param {string} dateString 
   * @returns {string}
   */
  formatDate(dateString) {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('tr-TR');
    } catch (e) {
      return '—';
    }
  }

  getFormattedStartDate() {
    return this.formatDate(this.startDate);
  }

  getFormattedEndDate() {
    return this.formatDate(this.endDate);
  }
}
