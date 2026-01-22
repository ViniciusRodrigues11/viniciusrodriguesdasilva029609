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
      if (refreshState.error) {
        this.updateAuthState({
          isLoading: false,
          error: refreshState.error,
        });
        this.logout();
      } else if (!refreshState.isLoading) {
        this.scheduleTokenRefresh();
      }
    });
  }

  isAuthenticatedSync(): boolean {
    return this.authState$.value.isAuthenticated;
  }

  private initializeAuthState(): void {
    const refreshExpiresAt = this.tokenStorage.getRefreshExpiresAt();
    if (refreshExpiresAt && refreshExpiresAt <= Date.now()) {
      this.logout();
      return;
    }

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
    const leadMs = 3_000;
    const msUntilRefresh = accessExpiresAt - now - leadMs;

    if (msUntilRefresh < 5_000) {
      return;
    }

    if (this.refreshTimeoutId !== null) {
      clearTimeout(this.refreshTimeoutId);
    }

    this.refreshTimeoutId = window.setTimeout(() => {
      if (this.tokenStorage.hasTokens()) {
        this.refreshToken();
      }
    }, msUntilRefresh);
  }
}
