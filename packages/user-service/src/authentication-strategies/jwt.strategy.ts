import {AuthenticationStrategy} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile, securityId} from '@loopback/security';
import jwt from 'jsonwebtoken';
import {JWTService} from '../services/jwt-service';

export class JWTAuthenticationStrategy implements AuthenticationStrategy {
  name = 'jwt';

  constructor(
    @inject('services.jwt.service')
    private jwtService: JWTService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token = this.extractCredentials(request);

    try {
      // Verify the token using the JWT service
      const userProfile = await this.jwtService.verifyToken(token);
      
      return {
        name: userProfile.name,
        [securityId]: '2'

      }
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Invalid token: ${error.message}`);
    }
  }

  extractCredentials(request: Request): string {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new HttpErrors.Unauthorized(`Authorization header is missing.`);
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new HttpErrors.Unauthorized(
        `Authorization header is not in the format 'Bearer <token>'.`,
      );
    }

    return token;
  }
}
