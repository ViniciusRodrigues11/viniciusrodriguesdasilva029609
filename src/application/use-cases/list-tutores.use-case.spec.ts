import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListTutoresUseCase } from './list-tutores.use-case';
import type { ITutorRepository, ListTutoresFilters } from '../../domain/repositories/tutor.repository';
import type { PaginatedTutoresEntity } from '../../domain/entities/tutor.entity';

describe('ListTutoresUseCase', () => {
  let useCase: ListTutoresUseCase;
  let repository: ITutorRepository;

  beforeEach(() => {
    repository = {
      list: vi.fn(),
      delete: vi.fn(),
    } as unknown as ITutorRepository;

    useCase = new ListTutoresUseCase(repository);
  });

  it('deve delegar a listagem para o repositório', async () => {
    const filters: ListTutoresFilters = { page: 1, size: 10, nome: 'João' };

    const paginatedTutores: PaginatedTutoresEntity = {
      tutores: [
        { id: 1, nome: 'João', telefone: '11999999999' },
        { id: 2, nome: 'Maria', telefone: '11988888888' },
      ],
      page: 1,
      size: 10,
      total: 2,
    };

    vi.mocked(repository.list).mockResolvedValue(paginatedTutores);

    const result = await useCase.execute(filters);

    expect(repository.list).toHaveBeenCalledWith(filters);
    expect(result).toEqual(paginatedTutores);
  });

  it('deve propagar erros do repositório', async () => {
    const error = new Error('Falha ao listar tutores');
    vi.mocked(repository.list).mockRejectedValue(error);

    await expect(useCase.execute({ page: 1, size: 10 })).rejects.toThrow('Falha ao listar tutores');
  });
});
