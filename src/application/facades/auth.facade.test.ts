import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthFacade } from './auth.facade';
import { LoginUseCase } from '../use-cases/login.use-case';
import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import { TokenStorage } from '../../infrastructure/storage/token.storage';
import { firstValueFrom } from 'rxjs';

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let mockLoginUseCase: LoginUseCase;
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
      clearTokens: vi.fn().mockImplementation(() => { }),
      hasTokens: vi.fn().mockReturnValue(false),
    } as unknown as TokenStorage;

    mockLoginUseCase = new LoginUseCase(mockRepository);

    facade = new AuthFacade(
      mockLoginUseCase,
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

  describe('authState', () => {
    it('deve emitir estado inicial correto', async () => {
      // Act
      const state = await firstValueFrom(facade.authState);

      // Assert
      expect(state).toEqual({
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    });
  });

  describe('error$', () => {
    it('deve emitir null inicialmente', async () => {
      // Act
      const error = await firstValueFrom(facade.error$);

      // Assert
      expect(error).toBeNull();
    });
  });

  describe('isLoading$', () => {
    it('deve emitir false inicialmente', async () => {
      // Act
      const isLoading = await firstValueFrom(facade.isLoading$);

      // Assert
      expect(isLoading).toBe(false);
    });
  });
});
