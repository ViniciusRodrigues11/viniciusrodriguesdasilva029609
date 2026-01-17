export class TokenStorage {
  private readonly accessTokenKey = 'auth:access_token';
  private readonly refreshTokenKey = 'auth:refresh_token';
  private readonly expiresInKey = 'auth:expires_in';

  saveTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    localStorage.setItem(this.expiresInKey, String(expiresIn));
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

  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.expiresInKey);
  }

  hasTokens(): boolean {
    return this.getAccessToken() !== null && this.getRefreshToken() !== null;
  }
}
