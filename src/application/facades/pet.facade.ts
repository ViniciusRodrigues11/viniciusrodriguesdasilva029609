import { BehaviorSubject, type Observable } from 'rxjs';
import type { PetEntity } from '../../domain/entities/pet.entity';
import type { ListPetsUseCase } from '../use-cases/list-pets.use-case';
import type { PetApi, CreatePetApiPayload, PetApiResponse, UpdatePetApiPayload, PetDetailApiResponse } from '../../infrastructure/api/pet.api';
import { extractErrorMessage } from '../../helpers/error-handler.helper';

export interface PetPaginationState {
  page: number;
  pageSize: number;
  total: number | null;
}

export interface PetDetail extends PetEntity {
  tutores?: Array<{
    id: number;
    nome: string;
    email?: string;
    telefone: string;
    endereco?: string;
    cpf?: number;
    foto?: {
      id: number;
      nome?: string;
      contentType?: string;
      url?: string;
    };
  }>;
}

export class PetFacade {
  private readonly petsSubject = new BehaviorSubject<PetEntity[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly paginationSubject = new BehaviorSubject<PetPaginationState>({
    page: 1,
    pageSize: 10,
    total: null,
  });
  private readonly petDetailSubject = new BehaviorSubject<PetDetail | null>(null);
  private readonly detailLoadingSubject = new BehaviorSubject<boolean>(false);

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

  get petDetail$(): Observable<PetDetail | null> {
    return this.petDetailSubject.asObservable();
  }

  get detailLoading$(): Observable<boolean> {
    return this.detailLoadingSubject.asObservable();
  }

  async getTotalCount(): Promise<number> {
    const result = await this.listPetsUseCase.execute({ page: 1, size: 1 });
    const total = result.total ?? result.pets.length ?? 0;
    return Math.max(0, total);
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
        this.errorSubject.next(extractErrorMessage(error));
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
      this.errorSubject.next(extractErrorMessage(error));
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
      this.errorSubject.next(extractErrorMessage(error));
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
      this.errorSubject.next(extractErrorMessage(error));
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
      this.errorSubject.next(extractErrorMessage(error));
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteFoto(petId: number, fotoId: number): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      await this.petApi.deleteFoto(petId, fotoId);

      const currentPets = this.petsSubject.getValue();
      const updatedPets = currentPets.map((pet) =>
        pet.id === petId
          ? { ...pet, foto: undefined }
          : pet,
      );
      this.petsSubject.next(updatedPets);
    } catch (error: unknown) {
      this.errorSubject.next(extractErrorMessage(error));
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async loadPetDetail(petId: number): Promise<PetDetail> {
    this.detailLoadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      const petDetail = await this.petApi.getPetDetail(petId);
      const petEntity = this.mapApiDetailPetToEntity(petDetail);

      this.petDetailSubject.next(petEntity);
      return petEntity;
    } catch (error: unknown) {
      this.errorSubject.next(extractErrorMessage(error));
      throw error;
    } finally {
      this.detailLoadingSubject.next(false);
    }
  }

  clearPetDetail(): void {
    this.petDetailSubject.next(null);
    this.errorSubject.next(null);
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

  private mapApiDetailPetToEntity(apiPet: PetDetailApiResponse): PetDetail {
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
      tutores: apiPet.tutores?.map(tutor => ({
        id: tutor.id,
        nome: tutor.nome,
        email: tutor.email,
        telefone: tutor.telefone,
        endereco: tutor.endereco,
        cpf: tutor.cpf,
        foto: tutor.foto
          ? {
            id: tutor.foto.id,
            nome: tutor.foto.nome,
            contentType: tutor.foto.contentType,
            url: tutor.foto.url,
          }
          : undefined,
      })),
    };
  }
}
