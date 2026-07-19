/**
 * Personnel Entity represents an employee in the system
 */
export class Personnel {
  constructor({ id, fullName, department, role, status = 'Aktif', createdAt = null, avatar = null }) {
    this.id = id;
    this.fullName = fullName;
    this.department = department;
    this.role = role;
    this.status = status;
    this.createdAt = createdAt || new Date().toISOString();
    this.avatar = avatar || this.generateAvatar(fullName);
  }

  /**
   * Helper to generate a 2-character uppercase avatar from fullName
   * @param {string} name 
   * @returns {string}
   */
  generateAvatar(name) {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Format the creation date to localized Turkish representation
   * @returns {string}
   */
  getFormattedDate() {
    try {
      return new Date(this.createdAt).toLocaleDateString('tr-TR');
    } catch (e) {
      return 'Bilinmiyor';
    }
  }
}
