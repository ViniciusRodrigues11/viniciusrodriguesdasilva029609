import { BehaviorSubject, type Observable } from 'rxjs';
import type { TutorEntity } from '../../domain/entities/tutor.entity';
import type { ListTutoresUseCase } from '../use-cases/list-tutores.use-case';
import type { DeleteTutorUseCase } from '../use-cases/delete-tutor.use-case';
import type { TutorApi, CreateTutorApiPayload, UpdateTutorApiPayload } from '../../infrastructure/api/tutor.api';
import { extractErrorMessage } from '../../helpers/error-handler.helper';

export interface TutorPaginationState {
  page: number;
  pageSize: number;
  total: number | null;
}

export interface TutorDetail extends TutorEntity {
  pets?: Array<{
    id: number;
    nome: string;
    raca?: string;
    idade?: number;
    foto?: {
      id: number;
      nome?: string;
      contentType?: string;
      url?: string;
    };
  }>;
}

export class TutorFacade {
  private readonly tutoresSubject = new BehaviorSubject<TutorEntity[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly paginationSubject = new BehaviorSubject<TutorPaginationState>({
    page: 1,
    pageSize: 10,
    total: null,
  });
  private readonly tutorDetailSubject = new BehaviorSubject<TutorDetail | null>(null);
  private readonly detailLoadingSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly listTutoresUseCase: ListTutoresUseCase,
    private readonly deleteTutorUseCase: DeleteTutorUseCase,
    private readonly tutorApi: TutorApi
  ) { }

  get tutores$(): Observable<TutorEntity[]> {
    return this.tutoresSubject.asObservable();
  }

  get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  get error$(): Observable<string | null> {
    return this.errorSubject.asObservable();
  }

  get pagination$(): Observable<TutorPaginationState> {
    return this.paginationSubject.asObservable();
  }

  get tutorDetail$(): Observable<TutorDetail | null> {
    return this.tutorDetailSubject.asObservable();
  }

  get detailLoading$(): Observable<boolean> {
    return this.detailLoadingSubject.asObservable();
  }

  async getTotalCount(): Promise<number> {
    const result = await this.listTutoresUseCase.execute({ page: 1, size: 1 });
    const total = result.total ?? result.tutores.length ?? 0;
    return Math.max(0, total);
  }

  load(page: number = 1, pageSize: number = 10, query?: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.listTutoresUseCase
      .execute({ page, size: pageSize, nome: query?.trim() || undefined })
      .then((result) => {
        this.tutoresSubject.next(result.tutores);
        this.paginationSubject.next({
          page: result.page,
          pageSize: result.size,
          total: result.total ?? null,
        });
      })
      .catch((error) => {
        this.errorSubject.next(extractErrorMessage(error));
        this.tutoresSubject.next([]);
      })
      .finally(() => {
        this.loadingSubject.next(false);
      });
  }

  async addTutor(tutorData: CreateTutorApiPayload): Promise<TutorEntity> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      const createdTutor = await this.tutorApi.createTutor(tutorData);
      return createdTutor;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar tutor';
      this.errorSubject.next(errorMessage);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async updateTutor(tutorId: number, tutorData: UpdateTutorApiPayload): Promise<TutorEntity> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      const updatedTutor = await this.tutorApi.updateTutor(tutorId, tutorData);
      return updatedTutor;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar tutor';
      this.errorSubject.next(errorMessage);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteTutor(tutorId: number): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      await this.deleteTutorUseCase.execute(tutorId);

      const currentTutores = this.tutoresSubject.getValue();
      this.tutoresSubject.next(currentTutores.filter((tutor) => tutor.id !== tutorId));

      const currentPagination = this.paginationSubject.getValue();
      if (currentPagination.total !== null) {
        this.paginationSubject.next({
          ...currentPagination,
          total: Math.max(0, currentPagination.total - 1),
        });
      }
    } catch (error) {
      this.errorSubject.next(extractErrorMessage(error));
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async uploadFoto(tutorId: number, foto: File): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      await this.tutorApi.uploadFoto(tutorId, foto);
    } catch (error) {
      this.errorSubject.next(extractErrorMessage(error));
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteFoto(tutorId: number, fotoId: number): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      await this.tutorApi.deleteFoto(tutorId, fotoId);
    } catch (error) {
      this.errorSubject.next(extractErrorMessage(error));
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async loadTutorDetail(tutorId: number): Promise<void> {
    this.detailLoadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      const tutorDetail = await this.tutorApi.getTutorDetail(tutorId);
      this.tutorDetailSubject.next(tutorDetail);
    } catch (error) {
      this.errorSubject.next(extractErrorMessage(error));
      this.tutorDetailSubject.next(null);
      throw error;
    } finally {
      this.detailLoadingSubject.next(false);
    }
  }

  clearTutorDetail(): void {
    this.tutorDetailSubject.next(null);
    this.errorSubject.next(null);
  }

  async linkPets(tutorId: number, petIds: number[]): Promise<void> {
    if (!petIds.length) return;

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      await Promise.all(petIds.map((petId) => this.tutorApi.linkPet(tutorId, petId)));
      await this.loadTutorDetail(tutorId);
    } catch (error) {
      this.errorSubject.next(extractErrorMessage(error));
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async unlinkPet(tutorId: number, petId: number): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      await this.tutorApi.unlinkPet(tutorId, petId);
      await this.loadTutorDetail(tutorId);
    } catch (error) {
      this.errorSubject.next(extractErrorMessage(error));
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  reset(): void {
    this.tutoresSubject.next([]);
    this.loadingSubject.next(false);
    this.errorSubject.next(null);
    this.paginationSubject.next({
      page: 1,
      pageSize: 9,
      total: null,
    });
  }
}
