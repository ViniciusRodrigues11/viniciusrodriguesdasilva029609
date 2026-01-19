import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import type { CredentialsEntity } from '../../domain/entities/auth.entity';
import type { LoginState } from '../use-cases/login.use-case';
import { LoginUseCase } from '../use-cases/login.use-case';
import { RefreshTokenUseCase, type RefreshTokenState } from '../use-cases/refresh-token.use-case';
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
  private refreshTimeoutId: number | null = null;

  constructor(
    readonly loginUseCase: LoginUseCase,
    readonly refreshTokenUseCase: RefreshTokenUseCase,
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

      if (!loginState.error && !loginState.isLoading) {
        this.scheduleTokenRefresh();
      }
    });
  }

  logout(): void {
    this.tokenStorage.clearTokens();
    this.updateAuthState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    if (this.refreshTimeoutId !== null) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
  }

  refreshToken(): void {
    const refreshToken = this.tokenStorage.getRefreshToken();

    if (!refreshToken) {
      this.updateAuthState({
        isAuthenticated: false,
        error: 'Token de refresh não encontrado',
      });
      return;
    }

    this.refreshTokenUseCase.execute(refreshToken).subscribe((refreshState: RefreshTokenState) => {
      this.updateAuthState({
        isLoading: refreshState.isLoading,
        error: refreshState.error,
        isAuthenticated: !refreshState.error && !refreshState.isLoading,
      });

      // Se houve erro no refresh, fazer logout
      if (refreshState.error) {
        this.logout();
      }

      // Reagendar próximo refresh após sucesso
      if (!refreshState.error && !refreshState.isLoading) {
        this.scheduleTokenRefresh();
      }
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

    if (hasTokens) {
      this.scheduleTokenRefresh();
    }
  }

  private updateAuthState(state: Partial<AuthState>): void {
    const currentState = this.authState$.value;
    this.authState$.next({
      ...currentState,
      ...state,
    });
  }

  private scheduleTokenRefresh(): void {
    const accessExpiresAt = this.tokenStorage.getAccessExpiresAt();

    if (!accessExpiresAt) {
      return;
    }

    const now = Date.now();
    const leadMs = 3_000; // renova 3s antes de expirar
    const msUntilRefresh = accessExpiresAt - now - leadMs;

    // Se o token já expirou ou vai expirar em menos de 5s, não agenda
    // Deixa o interceptor do axios lidar com isso no próximo request
    if (msUntilRefresh < 5_000) {
      return;
    }

    if (this.refreshTimeoutId !== null) {
      clearTimeout(this.refreshTimeoutId);
    }

    this.refreshTimeoutId = window.setTimeout(() => {
      // Garante que ainda há tokens válidos antes de tentar
      if (this.tokenStorage.hasTokens()) {
        this.refreshToken();
      }
    }, msUntilRefresh);
  }
}
