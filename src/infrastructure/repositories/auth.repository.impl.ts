import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import type { AuthEntity, CredentialsEntity } from '../../domain/entities/auth.entity';
import { AuthApi } from '../api/auth.api';
import { TokenStorage } from '../storage/token.storage';

export class AuthRepositoryImpl implements IAuthRepository {
  readonly authApi: AuthApi;
  readonly tokenStorage: TokenStorage;

  constructor(authApi: AuthApi, tokenStorage: TokenStorage) {
    this.authApi = authApi;
    this.tokenStorage = tokenStorage;
  }


  // Login e persistência de tokens
  async login(credentials: CredentialsEntity): Promise<AuthEntity> {
    const auth = await this.authApi.login(credentials);

    this.tokenStorage.saveTokens(
      auth.access_token,
      auth.refresh_token,
      auth.expires_in
    );

    this.authApi.setAccessToken(auth.access_token);

    return auth;
  }


  async refreshToken(refreshToken: string): Promise<AuthEntity> {
    const auth = await this.authApi.refreshToken(refreshToken);

    this.tokenStorage.saveTokens(
      auth.access_token,
      auth.refresh_token,
      auth.expires_in
    );

    this.authApi.setAccessToken(auth.access_token);

    return auth;
  }

  logout(): void {
    this.tokenStorage.clearTokens();
    this.authApi.clearAccessToken();
  }
}
