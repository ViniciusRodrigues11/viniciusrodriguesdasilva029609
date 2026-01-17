import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthApi } from './auth.api';
import type { AuthEntity, CredentialsEntity } from '../../domain/entities/auth.entity';
import axios from 'axios';

/**
 * Mock do axios
 */
vi.mock('axios');

describe('AuthApi', () => {
  let authApi: AuthApi;
  const mockAxios = vi.mocked(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    authApi = new AuthApi('https://api.test.com');
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

      mockAxios.create = vi.fn().mockReturnValue({
        post: vi.fn().mockResolvedValue({ data: mockResponse }),
        put: vi.fn(),
        defaults: { headers: { common: {} } },
      });

      authApi = new AuthApi('https://api.test.com');

      // Act
      const result = await authApi.login(credentials);

      // Assert
      expect(result).toEqual(mockResponse);
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

      mockAxios.create = vi.fn().mockReturnValue({
        post: vi.fn().mockRejectedValue(mockError),
        put: vi.fn(),
        defaults: { headers: { common: {} } },
      });

      authApi = new AuthApi('https://api.test.com');

      // Act & Assert
      await expect(authApi.login(credentials)).rejects.toThrow();
    });
  });

  describe('setAccessToken', () => {
    it('deve setar o token no header Authorization', () => {
      // Arrange
      const token = 'test-token-123';
      mockAxios.create = vi.fn().mockReturnValue({
        defaults: { headers: { common: {} } },
        post: vi.fn(),
        put: vi.fn(),
      });

      authApi = new AuthApi('https://api.test.com');

      // Act
      authApi.setAccessToken(token);

      // Assert
      expect(authApi.getClient().defaults.headers.common['Authorization']).toBe(
        `Bearer ${token}`
      );
    });
  });

  describe('clearAccessToken', () => {
    it('deve remover o token do header Authorization', () => {
      // Arrange
      mockAxios.create = vi.fn().mockReturnValue({
        defaults: { headers: { common: { Authorization: 'Bearer token' } } },
        post: vi.fn(),
        put: vi.fn(),
      });

      authApi = new AuthApi('https://api.test.com');
      authApi.setAccessToken('token123');

      // Act
      authApi.clearAccessToken();

      // Assert
      expect(authApi.getClient().defaults.headers.common['Authorization']).toBeUndefined();
    });
  });
});
