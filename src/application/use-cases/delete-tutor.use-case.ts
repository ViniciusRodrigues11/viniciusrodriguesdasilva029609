import type { ITutorRepository } from '../../domain/repositories/tutor.repository';

export class DeleteTutorUseCase {
  constructor(private readonly tutorRepository: ITutorRepository) { }

  execute(tutorId: number): Promise<void> {
    return this.tutorRepository.delete(tutorId);
  }
}
