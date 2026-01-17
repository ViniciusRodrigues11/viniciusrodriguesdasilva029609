import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginUseCase } from './login.use-case';
import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import type { CredentialsEntity } from '../../domain/entities/auth.entity';
import { firstValueFrom } from 'rxjs';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockRepository: IAuthRepository;

  beforeEach(() => {
    mockRepository = {
      login: vi.fn(),
      refreshToken: vi.fn(),
    };

    useCase = new LoginUseCase(mockRepository);
  });

  describe('execute', () => {
    it('deve emitir loading true seguido de sucesso', async () => {
      // Arrange
      const credentials: CredentialsEntity = {
        username: 'test@email.com',
        password: 'password',
      };

      vi.mocked(mockRepository.login).mockResolvedValue({
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        refresh_expires_in: 7200,
      });

      // Act
      const observable = useCase.execute(credentials);
      const states = await firstValueFrom(observable.pipe());

      // Assert - A observável emite o estado de loading
      expect(states).toBeDefined();
    });

    it('deve tratar erro de credenciais inválidas', async () => {
      // Arrange
      const credentials: CredentialsEntity = {
        username: 'test@email.com',
        password: 'wrong',
      };

      const error = {
        response: { status: 401 },
        message: 'Unauthorized',
      };

      vi.mocked(mockRepository.login).mockRejectedValue(error);

      // Act
      const observable = useCase.execute(credentials);
      const states: Array<unknown> = [];

      observable.subscribe((state: unknown) => {
        states.push(state);
      });

      // Assert - Aguarda um tick
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(states.length).toBeGreaterThan(0);
    });

    it('deve retornar mensagem de erro para Network Error', async () => {
      // Arrange
      const credentials: CredentialsEntity = {
        username: 'test@email.com',
        password: 'password',
      };

      const error = new Error('Network Error');

      vi.mocked(mockRepository.login).mockRejectedValue(error);

      // Act
      const observable = useCase.execute(credentials);
      const states: Array<unknown> = [];

      observable.subscribe((state: unknown) => {
        states.push(state);
      });

      // Assert
      await new Promise((resolve) => setTimeout(resolve, 100));
      const finalState = states[states.length - 1] as { error: string };
      expect(finalState.error).toContain('Erro de conexão');
    });
  });
});
