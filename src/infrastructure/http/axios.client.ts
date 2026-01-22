import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { TokenStorage } from '../storage/token.storage';
import type { AuthEntity } from '../../domain/entities/auth.entity';

export class AxiosClient {
  private readonly client: AxiosInstance;
  private readonly tokenStorage?: TokenStorage;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor(baseURL: string = 'https://pet-manager-api.geia.vip', tokenStorage?: TokenStorage) {
    this.tokenStorage = tokenStorage;

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use((config) => {
      const token = this.tokenStorage?.getAccessToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          const refreshToken = this.tokenStorage?.getRefreshToken();

          if (!refreshToken) {
            this.isRefreshing = false;
            return Promise.reject(error);
          }

          try {
            const response = await axios.put<AuthEntity>(
              `${this.client.defaults.baseURL}/autenticacao/refresh`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${refreshToken}`,
                },
              }
            );

            const { access_token, refresh_token, expires_in, refresh_expires_in } = response.data;

            this.tokenStorage?.saveTokens(
              access_token,
              refresh_token,
              expires_in,
              refresh_expires_in
            );

            originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

            this.processQueue(null);

            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.tokenStorage?.clearTokens();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: unknown): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });

    this.failedQueue = [];
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
