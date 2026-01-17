import type { PaginatedPetsEntity } from '../entities/pet.entity';

export interface ListPetsFilters {
  page: number;
  size: number;
  nome?: string;
}

export interface IPetRepository {
  list(filters: ListPetsFilters): Promise<PaginatedPetsEntity>;
}
