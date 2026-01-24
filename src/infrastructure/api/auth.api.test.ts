import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthApi } from './auth.api';
import type { AuthEntity, CredentialsEntity } from '../../domain/entities/auth.entity';
import type { AxiosInstance } from 'axios';

describe('AuthApi', () => {
  let authApi: AuthApi;
  let mockHttpClient: AxiosInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHttpClient = {
      post: vi.fn(),
      put: vi.fn(),
    } as unknown as AxiosInstance;
    authApi = new AuthApi(mockHttpClient);
  });

  describe('login', () => {
    it('deve fazer requisição POST para /autenticacao/login com credenciais corretas', async () => {
      // Arrange
      const credentials: CredentialsEntity = {
        username: 'test@email.com',
        password: 'password123',
      };

      const mockResponse: AuthEntity = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        refresh_expires_in: 7200,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await authApi.login(credentials);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/autenticacao/login', {
        username: credentials.username,
        password: credentials.password,
      });
    });

    it('deve lançar erro ao receber resposta 401', async () => {
      // Arrange
      const credentials: CredentialsEntity = {
        username: 'test@email.com',
        password: 'wrong',
      };

      const mockError = {
        response: { status: 401, data: { message: 'Invalid credentials' } },
      };

      vi.mocked(mockHttpClient.post).mockRejectedValue(mockError);

      // Act & Assert
      await expect(authApi.login(credentials)).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('deve fazer requisição PUT para /autenticacao/refresh', async () => {
      // Arrange
      const refreshToken = 'refresh123';
      const mockResponse: AuthEntity = {
        access_token: 'new-token123',
        refresh_token: 'new-refresh123',
        expires_in: 3600,
        refresh_expires_in: 7200,
      };

      vi.mocked(mockHttpClient.put).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await authApi.refreshToken(refreshToken);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/autenticacao/refresh',
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );
    });
  });
});
