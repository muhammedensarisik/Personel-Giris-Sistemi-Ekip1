/**
 * GetAllPersonnelUseCase retrieves all personnel from the repository
 */
export class GetAllPersonnelUseCase {
  constructor(personnelRepository) {
    this.personnelRepository = personnelRepository;
  }

  async execute() {
    return this.personnelRepository.getAll();
  }
}
