/**
 * AddPersonnelUseCase registers a new personnel to the system
 */
export class AddPersonnelUseCase {
  constructor(personnelRepository) {
    this.personnelRepository = personnelRepository;
  }

  /**
   * Run the use case
   * @param {Object} personnelData - { fullName, department, role, status }
   */
  async execute(personnelData) {
    // Business rule checks can be added here
    if (!personnelData.fullName || personnelData.fullName.trim() === '') {
      throw new Error('Personel adı soyadı boş bırakılamaz.');
    }
    return this.personnelRepository.add(personnelData);
  }
}
