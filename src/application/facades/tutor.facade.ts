import { BehaviorSubject, type Observable } from 'rxjs';
import type { TutorEntity } from '../../domain/entities/tutor.entity';
import type { ListTutoresUseCase } from '../use-cases/list-tutores.use-case';
import type { DeleteTutorUseCase } from '../use-cases/delete-tutor.use-case';
import type { TutorApi, CreateTutorApiPayload } from '../../infrastructure/api/tutor.api';

export interface TutorPaginationState {
  page: number;
  pageSize: number;
  total: number | null;
}

export class TutorFacade {
  private readonly tutoresSubject = new BehaviorSubject<TutorEntity[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly paginationSubject = new BehaviorSubject<TutorPaginationState>({
    page: 1,
    pageSize: 9,
    total: null,
  });

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
        this.errorSubject.next(this.extractErrorMessage(error));
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
      this.errorSubject.next(this.extractErrorMessage(error));
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
      this.errorSubject.next(this.extractErrorMessage(error));
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

  private extractErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'response' in error) {
      const httpError = error as { response?: { data?: { message?: string }; status?: number } };
      const status = httpError.response?.status;
      if (status === 401) return 'Sessão expirada. Faça login novamente.';
      return httpError.response?.data?.message ?? 'Erro ao processar solicitação.';
    }

    if (error instanceof Error) {
      if (error.message === 'Network Error') return 'Erro de conexão com o servidor.';
      return error.message || 'Erro ao processar solicitação.';
    }

    return 'Erro ao processar solicitação.';
  }
}
