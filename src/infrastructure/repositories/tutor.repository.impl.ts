import type { PaginatedTutoresEntity, TutorEntity } from '../../domain/entities/tutor.entity';
import type { ITutorRepository, ListTutoresFilters } from '../../domain/repositories/tutor.repository';
import type { TutorApi, TutorApiResponse } from '../api/tutor.api';

export class TutorRepositoryImpl implements ITutorRepository {
  constructor(private readonly tutorApi: TutorApi) { }

  async list(filters: ListTutoresFilters): Promise<PaginatedTutoresEntity> {
    const response = await this.tutorApi.listTutores({
      page: filters.page - 1,
      size: filters.size,
      nome: filters.nome,
    });

    return {
      tutores: response.content.map(this.mapToDomain),
      page: response.page + 1,
      size: response.size,
      total: response.total ?? null,
    };
  }

  private mapToDomain(tutorApi: TutorApiResponse): TutorEntity {
    return {
      id: tutorApi.id,
      nome: tutorApi.nome,
      email: tutorApi.email,
      telefone: tutorApi.telefone,
      endereco: tutorApi.endereco,
      cpf: tutorApi.cpf,
      foto: tutorApi.foto
        ? {
          id: tutorApi.foto.id,
          nome: tutorApi.foto.nome,
          contentType: tutorApi.foto.contentType,
          url: tutorApi.foto.url,
        }
        : undefined,
    };
  }
}
