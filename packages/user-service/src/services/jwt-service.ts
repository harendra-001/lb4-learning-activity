import {promisify} from 'util';
import jwt from 'jsonwebtoken';
import {HttpErrors} from '@loopback/rest';
import {UserProfile, securityId} from '@loopback/security';
import {inject} from '@loopback/core';

// Cast promisify(jwt.sign) to unknown first, then to the correct type
const signAsync = promisify(jwt.sign) as unknown as (
  payload: string | object | Buffer,
  secretOrPrivateKey: string,
  options?: jwt.SignOptions
) => Promise<string>;

export class JWTService {
  constructor(
    @inject('authentication.jwt.secret')
    private jwtSecret: string,

    @inject('authentication.jwt.expiresIn')
    private jwtExpiresIn: string,
  ) {}

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error while generating token: userProfile is null',
      );
    }

    const payload = {
      name: userProfile.name,
      role: userProfile.role,
      id: userProfile[securityId]
    };

    try {
      const token = await signAsync(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn,
      });
      return token;
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error generating token: ${error.message}`);
    }
  }
}
