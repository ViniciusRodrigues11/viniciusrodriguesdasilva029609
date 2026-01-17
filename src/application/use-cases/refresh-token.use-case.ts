import { BehaviorSubject, Observable } from 'rxjs';
import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import type { AuthEntity } from '../../domain/entities/auth.entity';

export interface RefreshTokenState {
  data: AuthEntity | null;
  isLoading: boolean;
  error: string | null;
}

export class RefreshTokenUseCase {
  private readonly state$ = new BehaviorSubject<RefreshTokenState>({
    data: null,
    isLoading: false,
    error: null,
  });

  constructor(private readonly authRepository: IAuthRepository) { }

  execute(refreshToken: string): Observable<RefreshTokenState> {
    this.updateState({ isLoading: true, error: null });

    this.authRepository
      .refreshToken(refreshToken)
      .then((data) => {
        this.updateState({
          data,
          isLoading: false,
          error: null,
        });
      })
      .catch((error) => {
        this.updateState({
          data: null,
          isLoading: false,
          error: error.message || 'Erro ao renovar token',
        });
      });

    return this.state$.asObservable();
  }

  private updateState(state: Partial<RefreshTokenState>): void {
    const currentState = this.state$.value;
    this.state$.next({
      ...currentState,
      ...state,
    });
  }
}
