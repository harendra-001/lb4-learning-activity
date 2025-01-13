import { inject } from '@loopback/core';
import {genSalt, hash, compare} from 'bcryptjs'

interface PasswordHasher<T = string>{
    hashPassword(password : T) : Promise<T>;
    compparePassword(providedPass : T, storedPass : T) : Promise<boolean>
}

export class BcryptHasher implements PasswordHasher<string>{
    async compparePassword(providedPass: string, storedPass: string): Promise<boolean> {
        const passworedMatched = await compare(providedPass, storedPass);
        return passworedMatched;
    }
    
    // Now, use property injection
    @inject('round')
    public readonly round : number;
    async hashPassword(password: string): Promise<string>{
        const salt = await genSalt(this.round);
        return await hash(password, salt);
    }
}