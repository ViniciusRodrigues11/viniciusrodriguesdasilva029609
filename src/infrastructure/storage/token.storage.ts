export class TokenStorage {
  private readonly accessTokenKey = 'auth:access_token';
  private readonly refreshTokenKey = 'auth:refresh_token';
  private readonly accessExpiresAtKey = 'auth:access_expires_at';
  private readonly refreshExpiresAtKey = 'auth:refresh_expires_at';

  saveTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    refreshExpiresIn?: number
  ): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);

    // Calcula timestamps absolutos de expiração (expires_in vem em segundos)
    const now = Date.now();
    const accessExpiresAt = now + expiresIn * 1000;
    localStorage.setItem(this.accessExpiresAtKey, String(accessExpiresAt));

    if (typeof refreshExpiresIn === 'number') {
      const refreshExpiresAt = now + refreshExpiresIn * 1000;
      localStorage.setItem(this.refreshExpiresAtKey, String(refreshExpiresAt));
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getAccessExpiresAt(): number | null {
    const value = localStorage.getItem(this.accessExpiresAtKey);
    return value ? Number(value) : null;
  }

  getRefreshExpiresAt(): number | null {
    const value = localStorage.getItem(this.refreshExpiresAtKey);
    return value ? Number(value) : null;
  }

  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.accessExpiresAtKey);
    localStorage.removeItem(this.refreshExpiresAtKey);
  }

  hasTokens(): boolean {
    return this.getAccessToken() !== null && this.getRefreshToken() !== null;
  }
}
