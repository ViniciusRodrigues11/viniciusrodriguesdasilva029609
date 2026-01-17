import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import type { CredentialsEntity } from '../../domain/entities/auth.entity';
import { Observable, from, catchError } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface LoginState {
  isLoading: boolean;
  error: string | null;
}

export class LoginUseCase {
  constructor(readonly authRepository: IAuthRepository) { }

  execute(credentials: CredentialsEntity): Observable<LoginState> {
    return from(this.authRepository.login(credentials)).pipe(
      map(() => ({
        isLoading: false,
        error: null,
      })),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        return [
          {
            isLoading: false,
            error: errorMessage,
          },
        ];
      }),
      startWith({
        isLoading: true,
        error: null,
      })
    );
  }

  private extractErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'response' in error) {
      const httpError = error as { response?: { status: number } };
      if (httpError.response?.status === 401) {
        return 'Usuário ou senha incorretos';
      }
      if (httpError.response?.status === 400) {
        return 'Dados de entrada inválidos';
      }
    }
    if (error instanceof Error) {
      if (error.message === 'Network Error') {
        return 'Erro de conexão com o servidor';
      }
      return error.message || 'Erro ao realizar login';
    }
    return 'Erro ao realizar login';
  }
}
