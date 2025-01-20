
import {TokenService} from '@loopback/authentication';
import {inject, injectable, BindingScope} from '@loopback/core';
import * as jwt from 'jsonwebtoken';
import {HttpErrors} from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';

@injectable({scope: BindingScope.TRANSIENT})
export class JWTService implements TokenService {
  constructor(
    @inject('jwt.secret') private jwtSecret: string,
    @inject('jwt.expiresIn') private jwtExpiresIn: string,
  ) {
    if (!this.jwtSecret) {
      throw new Error('JWT secret is not defined');
    }
    if (!this.jwtExpiresIn) {
      throw new Error('JWT expiresIn is not defined');
    }
  }

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new Error('Error generating token: userProfile is null');
    }

    return new Promise<string>((resolve, reject) => {
      jwt.sign(
        userProfile,
        this.jwtSecret,
        {
          expiresIn: this.jwtExpiresIn,
        },
        (err, token) => {
          if (err) {
            reject(err);
          } else {
            resolve(token!); 
          }
        },
      );
    });
  }

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized('Error verifying token: token is null');
    }

    let decodedToken: any;
    try {
      decodedToken = await new Promise<object>((resolve, reject) => {
        jwt.verify(token, this.jwtSecret, (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded as object);
          }
        });
      });
    } catch (error: any) {
      throw new HttpErrors.Unauthorized(`Error verifying token: ${error.message}`);
    }

    if (!decodedToken['id'] || !decodedToken['name'] || !decodedToken['role']) {
      throw new HttpErrors.Unauthorized('Invalid token payload');
    }

    const userProfile: UserProfile = {
      [securityId]: decodedToken['id'].toString(),
      name: `${decodedToken['name']}`,
      id: decodedToken['id'],
      role: decodedToken['role'],
    };

    return userProfile;
  }
}