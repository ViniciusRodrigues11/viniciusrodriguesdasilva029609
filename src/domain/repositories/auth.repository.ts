import {
  type AuthEntity,
  type CredentialsEntity
} from '../entities/auth.entity';

export interface IAuthRepository {
  login(credentials: CredentialsEntity): Promise<AuthEntity>;
  refreshToken(refreshToken: string): Promise<AuthEntity>;
}
