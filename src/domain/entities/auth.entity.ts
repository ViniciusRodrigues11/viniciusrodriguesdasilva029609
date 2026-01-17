export interface AuthEntity {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
}

export interface CredentialsEntity {
  username: string;
  password: string;
}
