import { describe, it, expect, beforeEach, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { PetFacade } from './pet.facade';
import { ListPetsUseCase } from '../use-cases/list-pets.use-case';
import type { PetApi } from '../../infrastructure/api/pet.api';
import type { IPetRepository } from '../../domain/repositories/pet.repository';
import type { PetEntity } from '../../domain/entities/pet.entity';

describe('PetFacade', () => {
  let facade: PetFacade;
  let mockListPetsUseCase: ListPetsUseCase;
  let mockRepository: IPetRepository;
  let mockPetApi: PetApi;

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
      delete: vi.fn(),
    };

    mockPetApi = {
      createPet: vi.fn(),
      updatePet: vi.fn(),
      deletePet: vi.fn(),
      getPetDetail: vi.fn(),
      uploadFoto: vi.fn(),
      deleteFoto: vi.fn(),
    } as unknown as PetApi;

    mockListPetsUseCase = new ListPetsUseCase(mockRepository);
    facade = new PetFacade(mockListPetsUseCase, mockPetApi);
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

  describe('addPet', () => {
    it('deve criar pet e mapear resposta da API', async () => {
      // Arrange
      const payload = { nome: 'Thor', raca: 'Husky', idade: 2 };
      vi.spyOn(mockPetApi, 'createPet').mockResolvedValue({
        id: 10,
        nome: 'Thor',
        raca: 'Husky',
        idade: 2,
        foto: {
          id: 99,
          nome: 'foto.png',
          contentType: 'image/png',
          url: 'https://cdn/foto.png',
        },
      });

      // Act
      const createdPet = await facade.addPet(payload);

      // Assert
      expect(mockPetApi.createPet).toHaveBeenCalledWith(payload);
      expect(createdPet).toEqual({
        id: 10,
        nome: 'Thor',
        raca: 'Husky',
        idade: 2,
        foto: {
          id: 99,
          nome: 'foto.png',
          contentType: 'image/png',
          url: 'https://cdn/foto.png',
        },
      });
    });
  });

  describe('updatePet', () => {
    it('deve atualizar pet e refletir na lista atual', async () => {
      // Arrange
      (facade as unknown as { petsSubject: { next: (pets: PetEntity[]) => void } }).petsSubject.next([
        {
          id: 1,
          nome: 'Rex',
          raca: 'Labrador',
          idade: 5,
          foto: { id: 1, url: 'old' },
        },
        {
          id: 2,
          nome: 'Mimi',
          raca: 'Siamês',
          idade: 3,
        },
      ]);

      vi.spyOn(mockPetApi, 'updatePet').mockResolvedValue({
        id: 1,
        nome: 'Rex Atualizado',
        raca: 'Labrador',
        idade: 6,
        foto: {
          id: 2,
          url: 'new',
        },
      });

      // Act
      const updatedPet = await facade.updatePet(1, { nome: 'Rex Atualizado', raca: 'Labrador', idade: 6 });
      const pets = await firstValueFrom(facade.pets$);

      // Assert
      expect(mockPetApi.updatePet).toHaveBeenCalledWith(1, {
        nome: 'Rex Atualizado',
        raca: 'Labrador',
        idade: 6,
      });
      expect(updatedPet).toEqual({
        id: 1,
        nome: 'Rex Atualizado',
        raca: 'Labrador',
        idade: 6,
        foto: {
          id: 2,
          url: 'new',
        },
      });
      expect(pets).toEqual([
        {
          id: 1,
          nome: 'Rex Atualizado',
          raca: 'Labrador',
          idade: 6,
          foto: {
            id: 2,
            url: 'new',
          },
        },
        {
          id: 2,
          nome: 'Mimi',
          raca: 'Siamês',
          idade: 3,
        },
      ]);
    });
  });

  describe('deletePet', () => {
    it('deve remover pet da lista e atualizar total', async () => {
      // Arrange
      (facade as unknown as { petsSubject: { next: (pets: PetEntity[]) => void } }).petsSubject.next([
        { id: 1, nome: 'Rex', raca: 'Labrador', idade: 5 },
        { id: 2, nome: 'Mimi', raca: 'Siamês', idade: 3 },
      ]);
      (facade as unknown as { paginationSubject: { next: (state: { page: number; pageSize: number; total: number | null }) => void } }).paginationSubject
        .next({ page: 1, pageSize: 10, total: 2 });

      vi.spyOn(mockRepository, 'delete').mockResolvedValue(undefined);

      // Act
      await facade.deletePet(1);
      const pets = await firstValueFrom(facade.pets$);
      const pagination = await firstValueFrom(facade.pagination$);

      // Assert
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(pets).toEqual([{ id: 2, nome: 'Mimi', raca: 'Siamês', idade: 3 }]);
      expect(pagination.total).toBe(1);
    });
  });

  describe('uploadFoto', () => {
    it('deve chamar API para upload de foto', async () => {
      // Arrange
      const file = new File(['foto'], 'foto.png', { type: 'image/png' });
      vi.spyOn(mockPetApi, 'uploadFoto').mockResolvedValue({
        id: 11,
        nome: 'foto.png',
        contentType: 'image/png',
        url: 'https://cdn/foto.png',
      });

      // Act
      await facade.uploadFoto(1, file);

      // Assert
      expect(mockPetApi.uploadFoto).toHaveBeenCalledWith(1, file);
    });
  });

  describe('deleteFoto', () => {
    it('deve remover foto do pet na lista', async () => {
      // Arrange
      (facade as unknown as { petsSubject: { next: (pets: PetEntity[]) => void } }).petsSubject.next([
        {
          id: 1,
          nome: 'Rex',
          raca: 'Labrador',
          idade: 5,
          foto: { id: 3, url: 'foto' },
        },
        { id: 2, nome: 'Mimi', raca: 'Siamês', idade: 3 },
      ]);

      vi.spyOn(mockPetApi, 'deleteFoto').mockResolvedValue(undefined);

      // Act
      await facade.deleteFoto(1, 3);
      const pets = await firstValueFrom(facade.pets$);

      // Assert
      expect(mockPetApi.deleteFoto).toHaveBeenCalledWith(1, 3);
      expect(pets).toEqual([
        { id: 1, nome: 'Rex', raca: 'Labrador', idade: 5, foto: undefined },
        { id: 2, nome: 'Mimi', raca: 'Siamês', idade: 3 },
      ]);
    });
  });

  describe('loadPetDetail', () => {
    it('deve buscar detalhes do pet e atualizar estado', async () => {
      // Arrange
      vi.spyOn(mockPetApi, 'getPetDetail').mockResolvedValue({
        id: 7,
        nome: 'Bolt',
        raca: 'SRD',
        idade: 4,
        foto: {
          id: 20,
          url: 'https://cdn/bolt.png',
        },
        tutores: [
          {
            id: 1,
            nome: 'Ana',
            email: 'ana@email.com',
            telefone: '9999-9999',
            endereco: 'Rua A',
            cpf: 12345678900,
            foto: {
              id: 30,
              url: 'https://cdn/ana.png',
            },
          },
        ],
      });

      // Act
      const detail = await facade.loadPetDetail(7);
      const detailState = await firstValueFrom(facade.petDetail$);

      // Assert
      expect(mockPetApi.getPetDetail).toHaveBeenCalledWith(7);
      expect(detail).toEqual({
        id: 7,
        nome: 'Bolt',
        raca: 'SRD',
        idade: 4,
        foto: {
          id: 20,
          url: 'https://cdn/bolt.png',
        },
        tutores: [
          {
            id: 1,
            nome: 'Ana',
            email: 'ana@email.com',
            telefone: '9999-9999',
            endereco: 'Rua A',
            cpf: 12345678900,
            foto: {
              id: 30,
              url: 'https://cdn/ana.png',
            },
          },
        ],
      });
      expect(detailState).toEqual(detail);
    });
  });
});
