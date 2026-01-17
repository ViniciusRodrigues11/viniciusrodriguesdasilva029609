import axios, { type AxiosInstance } from 'axios';
import type { TokenStorage } from '../storage/token.storage';

export class AxiosClient {
  private readonly client: AxiosInstance;
  private readonly tokenStorage?: TokenStorage;

  constructor(baseURL: string = 'https://pet-manager-api.geia.vip', tokenStorage?: TokenStorage) {
    this.tokenStorage = tokenStorage;

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = this.tokenStorage?.getAccessToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });
  }

  get instance(): AxiosInstance {
    return this.client;
  }

  setAccessToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAccessToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }
}
