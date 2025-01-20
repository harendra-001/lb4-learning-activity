import {
    AuthenticationStrategy
  } from '@loopback/authentication';
  import {Request} from '@loopback/rest';
  import {inject} from '@loopback/core';
  import {JWTService} from '../services/jwt-service';
  import {HttpErrors} from '@loopback/rest';
import { UserProfile } from '@loopback/security';
  
  export class JWTAuthenticationStrategy implements AuthenticationStrategy {
    name = 'jwt';
  
    constructor(
      @inject('services.jwt.service')
      public jwtService: JWTService,
    ) {}
  
    async authenticate(request: Request): Promise<UserProfile | undefined> {
      const token: string = this.extractCredentials(request);
      const userProfile: UserProfile = await this.jwtService.verifyToken(token);
      return userProfile;
    }
  
    extractCredentials(request: Request): string {
      if (!request.headers.authorization) {
        throw new HttpErrors.Unauthorized(`Authorization header not found.`);
      }
  
      const authHeaderValue = request.headers.authorization;
  
      if (!authHeaderValue.startsWith('Bearer ')) {
        throw new HttpErrors.Unauthorized(
          `Authorization header is not of type 'Bearer'.`,
        );
      }
  
      // Split string into 'Bearer' and the token
      const parts = authHeaderValue.split(' ');
      if (parts.length !== 2) {
        throw new HttpErrors.Unauthorized(
          `Authorization header has too many parts. It should follow the pattern: 'Bearer <token>'`,
        );
      }
  
      const token = parts[1];
  
      return token;
    }
  }