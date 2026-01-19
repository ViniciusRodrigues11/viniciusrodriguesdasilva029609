import type { IPetRepository, ListPetsFilters } from '../../domain/repositories/pet.repository';
import type { PaginatedPetsEntity, PetEntity } from '../../domain/entities/pet.entity';
import { PetApi } from '../api/pet.api';

const mapToEntity = (apiPet: { id: number; nome: string; raca?: string; idade?: number; foto?: { id: number; nome?: string; contentType?: string; url?: string } }): PetEntity => ({
  id: apiPet.id,
  nome: apiPet.nome,
  raca: apiPet.raca,
  idade: apiPet.idade,
  foto: apiPet.foto
    ? {
      id: apiPet.foto.id,
      nome: apiPet.foto.nome,
      contentType: apiPet.foto.contentType,
      url: apiPet.foto.url,
    }
    : undefined,
});

export class PetRepositoryImpl implements IPetRepository {
  constructor(private readonly petApi: PetApi) { }

  async list(filters: ListPetsFilters): Promise<PaginatedPetsEntity> {
    const { page, size, nome } = filters;
    const apiPage = page > 0 ? page - 1 : 0;

    const response = await this.petApi.listPets({
      page: apiPage,
      size,
      nome,
    });

    const pets = response.content.map(mapToEntity);

    return {
      pets,
      page: (response.page ?? apiPage) + 1,
      size: response.size,
      total: response.total ?? null,
    };
  }

  async delete(petId: number): Promise<void> {
    await this.petApi.deletePet(petId);
  }
}
