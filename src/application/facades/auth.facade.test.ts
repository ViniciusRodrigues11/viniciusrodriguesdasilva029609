import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthFacade } from './auth.facade';
import { LoginUseCase } from '../use-cases/login.use-case';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case';
import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import { TokenStorage } from '../../infrastructure/storage/token.storage';
import { firstValueFrom, of } from 'rxjs';

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let mockLoginUseCase: LoginUseCase;
  let mockRefreshTokenUseCase: RefreshTokenUseCase;
  let mockRepository: IAuthRepository;
  let mockTokenStorage: TokenStorage;

  beforeEach(() => {
    mockRepository = {
      login: vi.fn(),
      refreshToken: vi.fn(),
    };

    mockTokenStorage = {
      saveTokens: vi.fn().mockImplementation(() => { }),
      getAccessToken: vi.fn().mockReturnValue(null),
      getRefreshToken: vi.fn().mockReturnValue(null),
      getExpiresIn: vi.fn().mockReturnValue(null),
      getRefreshExpiresIn: vi.fn().mockReturnValue(null),
      getAccessExpiresAt: vi.fn().mockReturnValue(null),
      getRefreshExpiresAt: vi.fn().mockReturnValue(null),
      clearTokens: vi.fn().mockImplementation(() => { }),
      hasTokens: vi.fn().mockReturnValue(false),
    } as unknown as TokenStorage;

    mockLoginUseCase = new LoginUseCase(mockRepository);
    mockRefreshTokenUseCase = new RefreshTokenUseCase(mockRepository);

    facade = new AuthFacade(
      mockLoginUseCase,
      mockRefreshTokenUseCase,
      mockRepository,
      mockTokenStorage as TokenStorage
    );
  });

  describe('isAuthenticated$', () => {
    it('deve emitir false quando não autenticado', async () => {
      // Act
      const isAuth = await firstValueFrom(facade.isAuthenticated$);

      // Assert
      expect(isAuth).toBe(false);
    });
  });

  describe('isAuthenticatedSync', () => {
    it('deve retornar false inicialmente', () => {
      // Act
      const result = facade.isAuthenticatedSync();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('initializeAuthState', () => {
    it('deve fazer logout quando refresh token estiver expirado', () => {
      // Arrange
      vi.spyOn(mockTokenStorage, 'getRefreshExpiresAt').mockReturnValue(Date.now() - 1000);
      vi.spyOn(mockTokenStorage, 'hasTokens').mockReturnValue(true);

      // Act
      facade = new AuthFacade(
        mockLoginUseCase,
        mockRefreshTokenUseCase,
        mockRepository,
        mockTokenStorage as TokenStorage
      );

      // Assert
      expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('deve limpar tokens ao fazer logout', () => {
      // Act
      facade.logout();

      // Assert
      expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
    });

    it('deve setar isAuthenticated para false', async () => {
      // Act
      facade.logout();

      // Assert
      const isAuth = await firstValueFrom(facade.isAuthenticated$);
      expect(isAuth).toBe(false);
    });
  });

  describe('login', () => {
    it('deve autenticar quando login for bem sucedido', async () => {
      // Arrange
      const credentials = { username: 'user', password: 'pass' };
      vi.spyOn(mockLoginUseCase, 'execute').mockReturnValue(
        of(
          { isLoading: true, error: null },
          { isLoading: false, error: null }
        )
      );

      // Act
      facade.login(credentials);

      // Assert
      expect(mockLoginUseCase.execute).toHaveBeenCalledWith(credentials);
      await vi.waitFor(async () => {
        const authState = await firstValueFrom(facade.authState);
        expect(authState.isAuthenticated).toBe(true);
        expect(authState.isLoading).toBe(false);
        expect(authState.error).toBeNull();
      });
      expect(mockTokenStorage.getAccessExpiresAt).toHaveBeenCalled();
    });

    it('deve manter não autenticado quando ocorrer erro', async () => {
      // Arrange
      const credentials = { username: 'user', password: 'wrong' };
      vi.spyOn(mockLoginUseCase, 'execute').mockReturnValue(
        of(
          { isLoading: true, error: null },
          { isLoading: false, error: 'Usuário ou senha incorretos' }
        )
      );

      // Act
      facade.login(credentials);

      // Assert
      await vi.waitFor(async () => {
        const authState = await firstValueFrom(facade.authState);
        expect(authState.isAuthenticated).toBe(false);
        expect(authState.isLoading).toBe(false);
        expect(authState.error).toBe('Usuário ou senha incorretos');
      });
      expect(mockTokenStorage.getAccessExpiresAt).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('deve retornar erro quando refresh token não existir', async () => {
      // Arrange
      vi.spyOn(mockTokenStorage, 'getRefreshToken').mockReturnValue(null);

      // Act
      facade.refreshToken();

      // Assert
      await vi.waitFor(async () => {
        const authState = await firstValueFrom(facade.authState);
        expect(authState.isAuthenticated).toBe(false);
        expect(authState.error).toBe('Token de refresh não encontrado');
      });
    });

    it('deve solicitar refresh token e agendar renovação', async () => {
      // Arrange
      vi.spyOn(mockTokenStorage, 'getRefreshToken').mockReturnValue('refresh-token');
      vi.spyOn(mockRefreshTokenUseCase, 'execute').mockReturnValue(
        of(
          { data: null, isLoading: true, error: null },
          {
            data: {
              access_token: 'access',
              refresh_token: 'refresh',
              expires_in: 3600,
              refresh_expires_in: 7200,
            },
            isLoading: false,
            error: null,
          }
        )
      );

      // Act
      facade.refreshToken();

      // Assert
      expect(mockRefreshTokenUseCase.execute).toHaveBeenCalledWith('refresh-token');
      await vi.waitFor(async () => {
        const authState = await firstValueFrom(facade.authState);
        expect(authState.error).toBeNull();
      });
      expect(mockTokenStorage.getAccessExpiresAt).toHaveBeenCalled();
      expect(mockTokenStorage.clearTokens).not.toHaveBeenCalled();
    });

    it('deve fazer logout quando refresh token falhar', async () => {
      // Arrange
      vi.spyOn(mockTokenStorage, 'getRefreshToken').mockReturnValue('refresh-token');
      vi.spyOn(mockRefreshTokenUseCase, 'execute').mockReturnValue(
        of({ data: null, isLoading: false, error: 'Erro ao renovar token' })
      );

      // Act
      facade.refreshToken();

      // Assert
      await vi.waitFor(async () => {
        const authState = await firstValueFrom(facade.authState);
        expect(authState.isAuthenticated).toBe(false);
      });
      expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
    });
  });
});
