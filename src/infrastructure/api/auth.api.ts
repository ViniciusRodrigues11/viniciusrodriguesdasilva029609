import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { AuthEntity, CredentialsEntity } from '../../domain/entities/auth.entity';

export class AuthApi {
  private readonly api: AxiosInstance;

  constructor(baseURL: string = 'https://pet-manager-api.geia.vip') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async login(credentials: CredentialsEntity): Promise<AuthEntity> {
    const response = await this.api.post<AuthEntity>('/autenticacao/login', {
      username: credentials.username,
      password: credentials.password,
    });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthEntity> {
    const response = await this.api.put<AuthEntity>(
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

  setAccessToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAccessToken(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }

  getClient(): AxiosInstance {
    return this.api;
  }
}
