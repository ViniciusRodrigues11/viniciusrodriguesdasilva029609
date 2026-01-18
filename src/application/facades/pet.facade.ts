import { BehaviorSubject, type Observable } from 'rxjs';
import type { PetEntity } from '../../domain/entities/pet.entity';
import type { ListPetsUseCase } from '../use-cases/list-pets.use-case';

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

  constructor(private readonly listPetsUseCase: ListPetsUseCase) { }

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
      return error.message || 'Erro ao carregar pets.';
    }
    return 'Erro ao carregar pets.';
  }
}
