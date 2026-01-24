import { AxiosClient } from '../infrastructure/http/axios.client';
import { TokenStorage } from '../infrastructure/storage/token.storage';
import { AuthApi } from '../infrastructure/api/auth.api';
import { AuthRepositoryImpl } from '../infrastructure/repositories/auth.repository.impl';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { AuthFacade } from '../application/facades/auth.facade';

// Inicializa cada dependência apenas uma vez
const tokenStorage = new TokenStorage();
const axiosClient = new AxiosClient(undefined, tokenStorage);
const authApi = new AuthApi(axiosClient.instance);
const authRepository = new AuthRepositoryImpl(authApi, tokenStorage);
const loginUseCase = new LoginUseCase(authRepository);
const refreshTokenUseCase = new RefreshTokenUseCase(authRepository);

export const authFacade = new AuthFacade(
  loginUseCase,
  refreshTokenUseCase,
  authRepository,
  tokenStorage
);
