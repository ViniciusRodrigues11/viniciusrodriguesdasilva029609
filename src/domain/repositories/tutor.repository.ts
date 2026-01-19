import type { PaginatedTutoresEntity } from '../entities/tutor.entity';

export interface ListTutoresFilters {
  page: number;
  size: number;
  nome?: string;
}

export interface ITutorRepository {
  list(filters: ListTutoresFilters): Promise<PaginatedTutoresEntity>;
  delete(tutorId: number): Promise<void>;
}
