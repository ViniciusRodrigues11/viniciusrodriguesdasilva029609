import type { PaginatedTutoresEntity } from '../../domain/entities/tutor.entity';
import type { ITutorRepository, ListTutoresFilters } from '../../domain/repositories/tutor.repository';

export class ListTutoresUseCase {
  constructor(private readonly tutorRepository: ITutorRepository) { }

  execute(filters: ListTutoresFilters): Promise<PaginatedTutoresEntity> {
    return this.tutorRepository.list(filters);
  }
}
