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

    // Response interceptor - renova token quando expira
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Se recebeu 401 e não é uma retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Se já está renovando, coloca na fila
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
            // Chama o endpoint de refresh
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

            // Salva os novos tokens
            this.tokenStorage?.saveTokens(
              access_token,
              refresh_token,
              expires_in,
              refresh_expires_in
            );

            // Atualiza o token no header da requisição original
            originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

            // Processa a fila de requisições que falharam
            this.processQueue(null);

            // Repete a requisição original
            return this.client(originalRequest);
          } catch (refreshError) {
            // Se o refresh falhar, limpa os tokens e rejeita todas as requisições
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
