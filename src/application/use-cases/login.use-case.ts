import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import type { CredentialsEntity } from '../../domain/entities/auth.entity';
import { Observable, from, catchError } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { extractErrorMessage } from '../../helpers/error-handler.helper';

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
        const errorMessage = extractErrorMessage(error);
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
}
