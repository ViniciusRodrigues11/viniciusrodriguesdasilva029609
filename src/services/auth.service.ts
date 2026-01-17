import { AuthApi } from '../infrastructure/api/auth.api';
import { TokenStorage } from '../infrastructure/storage/token.storage';
import { AuthRepositoryImpl } from '../infrastructure/repositories/auth.repository.impl';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { AuthFacade } from '../application/facades/auth.facade';

// Inicializa cada dependência apenas uma vez
const authApi = new AuthApi();
const tokenStorage = new TokenStorage();
const authRepository = new AuthRepositoryImpl(authApi, tokenStorage);
const loginUseCase = new LoginUseCase(authRepository);

export const authFacade = new AuthFacade(
  loginUseCase,
  authRepository,
  tokenStorage
);
