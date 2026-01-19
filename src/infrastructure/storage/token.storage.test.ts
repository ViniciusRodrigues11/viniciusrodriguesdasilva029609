import { describe, it, expect, beforeEach } from 'vitest';
import { TokenStorage } from './token.storage';

describe('TokenStorage', () => {
  let storage: TokenStorage;

  beforeEach(() => {
    // Limpa localStorage antes de cada teste
    localStorage.clear();
    storage = new TokenStorage();
  });

  describe('saveTokens', () => {
    it('deve salvar tokens no localStorage', () => {
      // Arrange
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-456';
      const expiresIn = 3600000; // 1h em milissegundos

      // Act
      storage.saveTokens(accessToken, refreshToken, expiresIn);

      // Assert
      expect(storage.getAccessToken()).toBe(accessToken);
      expect(storage.getRefreshToken()).toBe(refreshToken);
      expect(storage.getAccessExpiresAt()).toBeGreaterThan(Date.now());
    });
  });

  describe('getAccessToken', () => {
    it('deve retornar o token de acesso salvo', () => {
      // Arrange
      const token = 'access-token-123';
      storage.saveTokens(token, 'refresh', 3600000);

      // Act
      const result = storage.getAccessToken();

      // Assert
      expect(result).toBe(token);
    });

    it('deve retornar null se não há token', () => {
      // Act
      const result = storage.getAccessToken();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('deve retornar o token de atualização salvo', () => {
      // Arrange
      const token = 'refresh-token-456';
      storage.saveTokens('access', token, 3600000);

      // Act
      const result = storage.getRefreshToken();

      // Assert
      expect(result).toBe(token);
    });
  });

  describe('clearTokens', () => {
    it('deve limpar todos os tokens', () => {
      // Arrange
      storage.saveTokens('access', 'refresh', 3600000);

      // Act
      storage.clearTokens();

      // Assert
      expect(storage.getAccessToken()).toBeNull();
      expect(storage.getRefreshToken()).toBeNull();
      expect(storage.getAccessExpiresAt()).toBeNull();
    });
  });

  describe('hasTokens', () => {
    it('deve retornar true se há tokens salvos', () => {
      // Arrange
      storage.saveTokens('access', 'refresh', 3600000);

      // Act
      const result = storage.hasTokens();

      // Assert
      expect(result).toBe(true);
    });

    it('deve retornar false se não há tokens', () => {
      // Act
      const result = storage.hasTokens();

      // Assert
      expect(result).toBe(false);
    });
  });
});
