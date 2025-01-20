import {inject, injectable, BindingScope} from '@loopback/core';
import {genSalt, hash, compare} from 'bcryptjs';

export interface PasswordHasher<T = string> {
  hashPassword(password: T): Promise<T>;
  comparePassword(providedPass: T, storedPass: T): Promise<boolean>;
}

@injectable({scope: BindingScope.TRANSIENT})
export class BcryptHasher implements PasswordHasher<string> {
  constructor(
    public readonly rounds: number = 10,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(this.rounds);
    return await hash(password, salt);
  }

  async comparePassword(providedPass: string, storedPass: string): Promise<boolean> {
    const passwordMatched = await compare(providedPass, storedPass);
    return passwordMatched;
  }
}