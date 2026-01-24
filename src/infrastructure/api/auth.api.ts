import type { AxiosInstance } from 'axios';
import type { AuthEntity, CredentialsEntity } from '../../domain/entities/auth.entity';

export class AuthApi {
  constructor(private readonly httpClient: AxiosInstance) { }

  setAccessToken(token: string): void {
    this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAccessToken(): void {
    delete this.httpClient.defaults.headers.common['Authorization'];
  }

  async login(credentials: CredentialsEntity): Promise<AuthEntity> {
    const response = await this.httpClient.post<AuthEntity>('/autenticacao/login', {
      username: credentials.username,
      password: credentials.password,
    });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthEntity> {
    const response = await this.httpClient.put<AuthEntity>(
      '/autenticacao/refresh',
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    return response.data;
  }
}
