import type { PaginatedPetsEntity } from '../../domain/entities/pet.entity';
import type { IPetRepository, ListPetsFilters } from '../../domain/repositories/pet.repository';

export class ListPetsUseCase {
  constructor(private readonly petRepository: IPetRepository) { }

  execute(filters: ListPetsFilters): Promise<PaginatedPetsEntity> {
    return this.petRepository.list(filters);
  }
}
