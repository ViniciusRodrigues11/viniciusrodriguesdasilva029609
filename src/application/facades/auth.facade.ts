import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import type { CredentialsEntity } from '../../domain/entities/auth.entity';
import type { LoginState } from '../use-cases/login.use-case';
import { LoginUseCase } from '../use-cases/login.use-case';
import { TokenStorage } from '../../infrastructure/storage/token.storage';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export class AuthFacade {
  private readonly authState$ = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  constructor(
    readonly loginUseCase: LoginUseCase,
    readonly authRepository: IAuthRepository,
    readonly tokenStorage: TokenStorage
  ) {
    this.initializeAuthState();
  }

  get authState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.authState$.pipe(map((state) => state.isAuthenticated));
  }

  get isLoading$(): Observable<boolean> {
    return this.authState$.pipe(map((state) => state.isLoading));
  }

  get error$(): Observable<string | null> {
    return this.authState$.pipe(map((state) => state.error));
  }

  login(credentials: CredentialsEntity): void {
    this.loginUseCase.execute(credentials).subscribe((loginState: LoginState) => {
      this.updateAuthState({
        isLoading: loginState.isLoading,
        error: loginState.error,
        isAuthenticated: !loginState.error && !loginState.isLoading,
      });
    });
  }

  logout(): void {
    this.tokenStorage.clearTokens();
    this.updateAuthState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }

  isAuthenticatedSync(): boolean {
    return this.authState$.value.isAuthenticated;
  }

  private initializeAuthState(): void {
    const hasTokens = this.tokenStorage.hasTokens();
    this.updateAuthState({
      isAuthenticated: hasTokens,
      isLoading: false,
      error: null,
    });
  }

  private updateAuthState(state: Partial<AuthState>): void {
    const currentState = this.authState$.value;
    this.authState$.next({
      ...currentState,
      ...state,
    });
  }
}
