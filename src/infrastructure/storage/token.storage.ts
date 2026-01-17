export class TokenStorage {
  private readonly accessTokenKey = 'auth:access_token';
  private readonly refreshTokenKey = 'auth:refresh_token';
  private readonly expiresInKey = 'auth:expires_in';
  private readonly refreshExpiresInKey = 'auth:refresh_expires_in';

  saveTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    refreshExpiresIn: number
  ): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    localStorage.setItem(this.expiresInKey, String(expiresIn));
    localStorage.setItem(this.refreshExpiresInKey, String(refreshExpiresIn));
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getExpiresIn(): number | null {
    const expiresIn = localStorage.getItem(this.expiresInKey);
    return expiresIn ? Number(expiresIn) : null;
  }

  getRefreshExpiresIn(): number | null {
    const refreshExpiresIn = localStorage.getItem(this.refreshExpiresInKey);
    return refreshExpiresIn ? Number(refreshExpiresIn) : null;
  }

  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.expiresInKey);
    localStorage.removeItem(this.refreshExpiresInKey);
  }

  hasTokens(): boolean {
    return this.getAccessToken() !== null && this.getRefreshToken() !== null;
  }
}
