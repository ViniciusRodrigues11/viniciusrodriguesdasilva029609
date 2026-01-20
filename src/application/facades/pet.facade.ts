import { BehaviorSubject, type Observable } from 'rxjs';
import type { PetEntity } from '../../domain/entities/pet.entity';
import type { ListPetsUseCase } from '../use-cases/list-pets.use-case';
import type { PetApi, CreatePetApiPayload, PetApiResponse, UpdatePetApiPayload } from '../../infrastructure/api/pet.api';

export interface PetPaginationState {
  page: number;
  pageSize: number;
  total: number | null;
}

export class PetFacade {
  private readonly petsSubject = new BehaviorSubject<PetEntity[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly paginationSubject = new BehaviorSubject<PetPaginationState>({
    page: 1,
    pageSize: 9,
    total: null,
  });

  constructor(
    private readonly listPetsUseCase: ListPetsUseCase,
    private readonly petApi: PetApi,
  ) { }

  get pets$(): Observable<PetEntity[]> {
    return this.petsSubject.asObservable();
  }

  get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  get error$(): Observable<string | null> {
    return this.errorSubject.asObservable();
  }

  get pagination$(): Observable<PetPaginationState> {
    return this.paginationSubject.asObservable();
  }

  load(page: number = 1, pageSize: number = 10, query?: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.listPetsUseCase
      .execute({ page, size: pageSize, nome: query?.trim() || undefined })
      .then((result) => {
        this.petsSubject.next(result.pets);
        this.paginationSubject.next({
          page: result.page,
          pageSize: result.size,
          total: result.total ?? null,
        });
        this.errorSubject.next(null);
      })
      .catch((error: unknown) => {
        this.petsSubject.next([]);
        this.errorSubject.next(this.extractErrorMessage(error));
      })
      .finally(() => {
        this.loadingSubject.next(false);
      });
  }

  async addPet(petData: CreatePetApiPayload): Promise<PetEntity> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      const createdPet = await this.petApi.createPet(petData);
      const petEntity = this.mapApiPetToEntity(createdPet);

      return petEntity;
    } catch (error: unknown) {
      this.errorSubject.next(this.extractErrorMessage(error));
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async updatePet(petId: number, petData: UpdatePetApiPayload): Promise<PetEntity> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      const updatedPet = await this.petApi.updatePet(petId, petData);
      const petEntity = this.mapApiPetToEntity(updatedPet);

      const currentPets = this.petsSubject.getValue();
      const petIndex = currentPets.findIndex((pet) => pet.id === petId);

      if (petIndex >= 0) {
        const updatedPets = [...currentPets];
        updatedPets[petIndex] = {
          ...updatedPets[petIndex],
          ...petEntity,
        };
        this.petsSubject.next(updatedPets);
      }

      return petEntity;
    } catch (error: unknown) {
      this.errorSubject.next(this.extractErrorMessage(error));
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deletePet(petId: number): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      await this.listPetsUseCase['petRepository'].delete(petId);

      // Remove o pet da lista atual
      const currentPets = this.petsSubject.getValue();
      const updatedPets = currentPets.filter(pet => pet.id !== petId);
      this.petsSubject.next(updatedPets);

      // Atualiza o total se disponível
      const currentPagination = this.paginationSubject.getValue();
      if (currentPagination.total !== null) {
        this.paginationSubject.next({
          ...currentPagination,
          total: currentPagination.total - 1,
        });
      }
    } catch (error: unknown) {
      this.errorSubject.next(this.extractErrorMessage(error));
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async uploadFoto(petId: number, foto: File): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      await this.petApi.uploadFoto(petId, foto);
    } catch (error: unknown) {
      this.errorSubject.next(this.extractErrorMessage(error));
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'response' in error) {
      const httpError = error as { response?: { status?: number; data?: { message?: string } } };
      const status = httpError.response?.status;
      if (status === 401) return 'Sessão expirada. Faça login novamente.';
      if (status === 404) return 'Nenhum pet encontrado.';
      return httpError.response?.data?.message ?? 'Erro ao carregar pets.';
    }
    if (error instanceof Error) {
      if (error.message === 'Network Error') return 'Erro de conexão com o servidor.';
      return error.message || 'Erro ao processar solicitação.';
    }
    return 'Erro ao processar solicitação.';
  }

  private mapApiPetToEntity(apiPet: PetApiResponse): PetEntity {
    return {
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
    };
  }
}
