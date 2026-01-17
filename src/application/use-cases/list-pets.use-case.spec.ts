import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListPetsUseCase } from './list-pets.use-case';
import type { IPetRepository, ListPetsFilters } from '../../domain/repositories/pet.repository';
import type { PaginatedPetsEntity } from '../../domain/entities/pet.entity';

describe('ListPetsUseCase', () => {
  let useCase: ListPetsUseCase;
  let repository: IPetRepository;

  beforeEach(() => {
    repository = {
      list: vi.fn(),
    } as unknown as IPetRepository;

    useCase = new ListPetsUseCase(repository);
  });

  it('deve delegar a listagem para o repositório', async () => {
    const filters: ListPetsFilters = { page: 1, size: 10, nome: 'Rex' };

    const paginatedPets: PaginatedPetsEntity = {
      pets: [
        { id: 1, nome: 'Rex', raca: 'Labrador' },
        { id: 2, nome: 'Luna', raca: 'Poodle' },
      ],
      page: 1,
      size: 10,
      total: 2,
    };

    vi.mocked(repository.list).mockResolvedValue(paginatedPets);

    const result = await useCase.execute(filters);

    expect(repository.list).toHaveBeenCalledWith(filters);
    expect(result).toEqual(paginatedPets);
  });

  it('deve propagar erros do repositório', async () => {
    const error = new Error('Falha ao listar pets');
    vi.mocked(repository.list).mockRejectedValue(error);

    await expect(useCase.execute({ page: 1, size: 10 })).rejects.toThrow('Falha ao listar pets');
  });
});
