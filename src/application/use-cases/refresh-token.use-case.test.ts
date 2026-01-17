import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import type { AuthEntity } from '../../domain/entities/auth.entity';
import { firstValueFrom, lastValueFrom, take, toArray } from 'rxjs';

const mockAuthEntity: AuthEntity = {
  access_token: 'new_access_token',
  refresh_token: 'new_refresh_token',
  expires_in: 300,
  refresh_expires_in: 1800,
};

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let mockAuthRepository: IAuthRepository;

  beforeEach(() => {
    mockAuthRepository = {
      login: vi.fn(),
      refreshToken: vi.fn(),
    };
    useCase = new RefreshTokenUseCase(mockAuthRepository);
  });

  it('should set loading state immediately when executing', async () => {
    vi.mocked(mockAuthRepository.refreshToken).mockResolvedValue(mockAuthEntity);

    const observable = useCase.execute('old_refresh_token');
    const firstState = await firstValueFrom(observable);

    expect(firstState.isLoading).toBe(true);
    expect(firstState.error).toBeNull();
    expect(firstState.data).toBeNull();
  });

  it('should refresh token successfully and return auth data', async () => {
    vi.mocked(mockAuthRepository.refreshToken).mockResolvedValue(mockAuthEntity);

    const observable = useCase.execute('old_refresh_token');

    // Pega os primeiros 2 estados emitidos
    const states = await firstValueFrom(observable.pipe(take(2), toArray()));

    // Primeiro estado: loading
    expect(states[0]).toEqual({
      data: null,
      isLoading: true,
      error: null,
    });

    // Aguarda a Promise resolver
    await vi.waitFor(() => {
      expect(mockAuthRepository.refreshToken).toHaveBeenCalledWith('old_refresh_token');
    });

    // Segundo estado: sucesso
    const finalState = await lastValueFrom(observable.pipe(take(1)));
    expect(finalState).toEqual({
      data: mockAuthEntity,
      isLoading: false,
      error: null,
    });
  });

  it('should handle refresh token error and set error state', async () => {
    const error = new Error('Token expirado');
    vi.mocked(mockAuthRepository.refreshToken).mockRejectedValue(error);

    const observable = useCase.execute('invalid_token');

    // Aguarda a Promise rejeitar
    await vi.waitFor(() => {
      expect(mockAuthRepository.refreshToken).toHaveBeenCalledWith('invalid_token');
    });

    // Aguarda um pouco para garantir que o estado foi atualizado
    await new Promise(resolve => setTimeout(resolve, 10));

    const finalState = await lastValueFrom(observable.pipe(take(1)));

    expect(finalState).toEqual({
      data: null,
      isLoading: false,
      error: 'Token expirado',
    });
  });

  it('should handle error without message', async () => {
    vi.mocked(mockAuthRepository.refreshToken).mockRejectedValue({});

    const observable = useCase.execute('invalid_token');

    await vi.waitFor(() => {
      expect(mockAuthRepository.refreshToken).toHaveBeenCalled();
    });

    // Aguarda um pouco para garantir que o estado foi atualizado
    await new Promise(resolve => setTimeout(resolve, 10));

    const finalState = await lastValueFrom(observable.pipe(take(1)));

    expect(finalState.error).toBe('Erro ao renovar token');
    expect(finalState.isLoading).toBe(false);
    expect(finalState.data).toBeNull();
  });

  it('should call repository with correct refresh token', async () => {
    vi.mocked(mockAuthRepository.refreshToken).mockResolvedValue(mockAuthEntity);
    const refreshToken = 'my_refresh_token_123';

    useCase.execute(refreshToken);

    await vi.waitFor(() => {
      expect(mockAuthRepository.refreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockAuthRepository.refreshToken).toHaveBeenCalledTimes(1);
    });
  });
});
