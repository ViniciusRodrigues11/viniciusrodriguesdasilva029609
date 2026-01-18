import { describe, it, expect, beforeEach, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { PetFacade } from './pet.facade';
import { ListPetsUseCase } from '../use-cases/list-pets.use-case';
import type { IPetRepository } from '../../domain/repositories/pet.repository';
import type { PetEntity, PaginatedPetsEntity } from '../../domain/entities/pet.entity';

describe('PetFacade', () => {
  let facade: PetFacade;
  let mockListPetsUseCase: ListPetsUseCase;
  let mockRepository: IPetRepository;

  const mockPets: PetEntity[] = [
    {
      id: 1,
      nome: 'Rex',
      raca: 'Labrador',
      idade: 5,
    },
    {
      id: 2,
      nome: 'Mimi',
      raca: 'Siamês',
      idade: 3,
    },
  ];

  beforeEach(() => {
    mockRepository = {
      list: vi.fn(),
    };

    mockListPetsUseCase = new ListPetsUseCase(mockRepository);
    facade = new PetFacade(mockListPetsUseCase);
  });

  describe('pets$', () => {
    it('deve emitir array vazio inicialmente', async () => {
      // Act
      const pets = await firstValueFrom(facade.pets$);

      // Assert
      expect(pets).toEqual([]);
    });

    it('deve emitir pets após carregar com sucesso', async () => {
      // Arrange
      vi.spyOn(mockRepository, 'list').mockResolvedValue({
        pets: mockPets,
        page: 1,
        size: 10,
        total: 2,
      });

      // Act
      facade.load();
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      const pets = await firstValueFrom(facade.pets$);

      // Assert
      expect(pets).toEqual(mockPets);
    });
  });

  describe('loading$', () => {
    it('deve emitir false inicialmente', async () => {
      // Act
      const loading = await firstValueFrom(facade.loading$);

      // Assert
      expect(loading).toBe(false);
    });

    it('deve emitir true durante carregamento', async () => {
      // Arrange
      let resolvePromise: (value: PaginatedPetsEntity) => void;
      const promise = new Promise<PaginatedPetsEntity>((resolve) => {
        resolvePromise = resolve;
      });

      vi.spyOn(mockRepository, 'list').mockReturnValue(promise);

      // Act
      facade.load();
      const loading = await firstValueFrom(facade.loading$);

      // Assert
      expect(loading).toBe(true);

      // Cleanup
      resolvePromise!({
        pets: [],
        page: 1,
        size: 10,
        total: 0,
      });
    });

    it('deve emitir false após carregamento completar', async () => {
      // Arrange
      vi.spyOn(mockRepository, 'list').mockResolvedValue({
        pets: mockPets,
        page: 1,
        size: 10,
        total: 2,
      });

      // Act
      facade.load();
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      const loading = await firstValueFrom(facade.loading$);

      // Assert
      expect(loading).toBe(false);
    });
  });

  describe('error$', () => {
    it('deve emitir null inicialmente', async () => {
      // Act
      const error = await firstValueFrom(facade.error$);

      // Assert
      expect(error).toBeNull();
    });

    it('deve emitir null quando carregamento é bem-sucedido', async () => {
      // Arrange
      vi.spyOn(mockRepository, 'list').mockResolvedValue({
        pets: mockPets,
        page: 1,
        size: 10,
        total: 2,
      });

      // Act
      facade.load();
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      const error = await firstValueFrom(facade.error$);

      // Assert
      expect(error).toBeNull();
    });

    it('deve emitir mensagem de erro quando falha', async () => {
      // Arrange
      vi.spyOn(mockRepository, 'list').mockRejectedValue(new Error('Erro de teste'));

      // Act
      facade.load();
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      const error = await firstValueFrom(facade.error$);

      // Assert
      expect(error).toBe('Erro de teste');
    });

    it('deve emitir mensagem específica para erro 401', async () => {
      // Arrange
      const httpError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      vi.spyOn(mockRepository, 'list').mockRejectedValue(httpError);

      // Act
      facade.load();
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      const error = await firstValueFrom(facade.error$);

      // Assert
      expect(error).toBe('Sessão expirada. Faça login novamente.');
    });

    it('deve emitir mensagem específica para erro 404', async () => {
      // Arrange
      const httpError = {
        response: {
          status: 404,
          data: { message: 'Not Found' },
        },
      };
      vi.spyOn(mockRepository, 'list').mockRejectedValue(httpError);

      // Act
      facade.load();
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      const error = await firstValueFrom(facade.error$);

      // Assert
      expect(error).toBe('Nenhum pet encontrado.');
    });

    it('deve emitir mensagem para Network Error', async () => {
      // Arrange
      const networkError = new Error('Network Error');
      vi.spyOn(mockRepository, 'list').mockRejectedValue(networkError);

      // Act
      facade.load();
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      const error = await firstValueFrom(facade.error$);

      // Assert
      expect(error).toBe('Erro de conexão com o servidor.');
    });
  });

  describe('pagination$', () => {
    it('deve emitir estado inicial de paginação', async () => {
      // Act
      const pagination = await firstValueFrom(facade.pagination$);

      // Assert
      expect(pagination).toEqual({
        page: 1,
        pageSize: 9,
        total: null,
      });
    });

    it('deve atualizar estado de paginação após carregar', async () => {
      // Arrange
      vi.spyOn(mockRepository, 'list').mockResolvedValue({
        pets: mockPets,
        page: 2,
        size: 5,
        total: 20,
      });

      // Act
      facade.load(2, 5);
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      const pagination = await firstValueFrom(facade.pagination$);

      // Assert
      expect(pagination).toEqual({
        page: 2,
        pageSize: 5,
        total: 20,
      });
    });
  });

  describe('load', () => {
    it('deve chamar use case com parâmetros padrão', async () => {
      // Arrange
      const listSpy = vi.spyOn(mockRepository, 'list').mockResolvedValue({
        pets: mockPets,
        page: 1,
        size: 10,
        total: 2,
      });

      // Act
      facade.load();
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      // Assert
      expect(listSpy).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        nome: undefined,
      });
    });

    it('deve chamar use case com parâmetros personalizados', async () => {
      // Arrange
      const listSpy = vi.spyOn(mockRepository, 'list').mockResolvedValue({
        pets: mockPets,
        page: 3,
        size: 20,
        total: 2,
      });

      // Act
      facade.load(3, 20);
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      // Assert
      expect(listSpy).toHaveBeenCalledWith({
        page: 3,
        size: 20,
        nome: undefined,
      });
    });

    it('deve chamar use case com query de busca', async () => {
      // Arrange
      const listSpy = vi.spyOn(mockRepository, 'list').mockResolvedValue({
        pets: mockPets,
        page: 1,
        size: 10,
        total: 2,
      });

      // Act
      facade.load(1, 10, 'Rex');
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      // Assert
      expect(listSpy).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        nome: 'Rex',
      });
    });

    it('deve ignorar query vazia', async () => {
      // Arrange
      const listSpy = vi.spyOn(mockRepository, 'list').mockResolvedValue({
        pets: mockPets,
        page: 1,
        size: 10,
        total: 2,
      });

      // Act
      facade.load(1, 10, '   ');
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      // Assert
      expect(listSpy).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        nome: undefined,
      });
    });

    it('deve limpar pets anteriores em caso de erro', async () => {
      // Arrange
      vi.spyOn(mockRepository, 'list').mockRejectedValue(new Error('Erro de teste'));

      // Act
      facade.load();
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      const pets = await firstValueFrom(facade.pets$);

      // Assert
      expect(pets).toEqual([]);
    });

    it('deve lidar com total null', async () => {
      // Arrange
      vi.spyOn(mockRepository, 'list').mockResolvedValue({
        pets: mockPets,
        page: 1,
        size: 10,
        total: null,
      });

      // Act
      facade.load();
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      const pagination = await firstValueFrom(facade.pagination$);

      // Assert
      expect(pagination.total).toBeNull();
    });
  });
});
