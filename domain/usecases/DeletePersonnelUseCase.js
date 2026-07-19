/**
 * DeletePersonnelUseCase removes a personnel from the system
 */
export class DeletePersonnelUseCase {
  constructor(personnelRepository) {
    this.personnelRepository = personnelRepository;
  }

  async execute(id) {
    return this.personnelRepository.delete(id);
  }
}
