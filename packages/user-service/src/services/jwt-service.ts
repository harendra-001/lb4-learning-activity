import jwt from 'jsonwebtoken';
import { HttpErrors } from '@loopback/rest';
import { UserProfile, securityId } from '@loopback/security';
import { inject } from '@loopback/core';

export interface TokenPayload {
  name: string;
}

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

    try {
      // const payload: UserProfile = {
      //   // id: userProfile.id as string,
      //   name: userProfile.name as string,
      //   role: userProfile.role as string,
      //   [securityId]: `${userProfile.id}`
      // };
      

      const payload: TokenPayload = {
        // id: userProfile.id as string,
        name: userProfile.name as string,
      };

      const token = jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn,
      });
      return token;
    } catch (error: any) {
      throw new HttpErrors.Unauthorized(`Error generating token: ${error.message}`);
    }
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      console.log("Verifying Token:", token);
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      console.log("dasdf" + decoded);

      // const userProfile: UserProfile = {
      //   [securityId]: decoded.id,
      //   name: decoded.name,
      //   role: decoded.role,
      // };

      const userProfile: TokenPayload = {
        name: decoded.name,
      };

      return userProfile;
    } catch (error: any) {
      throw new HttpErrors.Unauthorized(`Error verifying token: ${error.message}`);
    }
  }
}