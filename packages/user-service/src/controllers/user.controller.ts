import { repository } from '@loopback/repository';
import { UserRepository } from '../repositories';
import { get, post, requestBody } from '@loopback/rest';
import { Credentials, User } from '../models';
import { validateCredentials } from '../services/validator';
import { BcryptHasher } from '../services/hash.password.bcrypt';
import { inject } from '@loopback/core';
import { CredentialsSchema } from './specs/user.controller.spec';
import { MyUserService } from '../services/userAuth-service';
import { JWTService } from '../services/jwt-service';
import { securityId, UserProfile } from '@loopback/security';
import { authenticate } from '@loopback/authentication';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @inject('service.hasher')
    public hasher: BcryptHasher,

    @inject('services.userAuth.service')
    public userService: MyUserService,

    @inject('services.jwt.service')
    public jwtService: JWTService
  ) {}

  /**
   * User signup endpoint.
   * @param userData The user data for signup.
   * @returns The created user's public information.
   */
  @post('/users/signup', {
    responses: {
      '200': {
        description: 'User created successfully',
        content: { 'application/json': { schema: { 'x-ts-type': User } } },
      },
      '400': {
        description: 'Bad Request',
        content: { 'application/json': { schema: { type: 'object' } } },
      },
    },
  })
  async signup(@requestBody() userData: User) {
    try {
      const validateData: Credentials = {
        email: userData.email,
        password: userData.password
      };

      validateCredentials(validateData);
      userData.password = await this.hasher.hashPassword(userData.password);
      const savedUser = await this.userRepository.create(userData);
      return {
        id: savedUser.id,
        name: savedUser.firstName,
        email: savedUser.email,
        role: savedUser.role,
      };
    } catch (error: any) {
      // Checking unique constraint error
      if (error.code === '23505' && error.detail.includes('email')) {
        throw {
          statusCode: 400,
          message: 'Email already exists',
          details: error.detail,
        };
      }

      // Other errors
      throw error;
    }
  }

  /**
   * User login endpoint.
   * @param credentials The user's login credentials.
   * @returns A JWT token upon successful authentication.
   */
  @post('/users/login', {
    responses: {
      '200': {
        description: 'Login success',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: { type: 'string' }
              }
            }
          }
        },
      },
      '401': {
        description: 'Invalid credentials',
      },
    },
  })
  async login(
    @requestBody({
      description: 'Login credentials',
      required: true,
      content: {
        'application/json': { schema: CredentialsSchema },
      },
    })
    credentials: { email: string; password: string },
  ): Promise<{ token: string }> {

    const user = await this.userService.verifyCredentials(credentials);
    console.log('Authenticated User:', user);

    const userProfile = this.userService.convertToUserProfile(user);
    console.log('User Profile:', userProfile);

    // Generate token
    const token = await this.jwtService.generateToken(userProfile);
    return { token };
  }

  @get('/users/me')
  @authenticate('jwt')
  async me(): Promise<UserProfile> {
    console.log("Accessing protected route: /users/me");

    return Promise.resolve({
      [securityId]: '1',
      name: 'Sample User',
      role: 'user',
      id: '1',
    });
  }
}