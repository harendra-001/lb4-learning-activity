import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories';
import {post, requestBody} from '@loopback/rest';
import {Credentials, User} from '../models';
import { validateCredentials } from '../services/validator';
import { BcryptHasher } from '../services/hash.password.bcrypt';
import { inject } from '@loopback/core';
import { CredentialsSchema } from './specs/user.controller.spec';
import { MyUserService } from '../services/userAuth-service';
import { JWTService } from '../services/jwt-service';

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

  @post('/users/signup', {
    responses: {
      '200': {
        description: 'User created successfully',
        content: {'application/json': {schema: {'x-ts-type': User}}},
      },
      '400': {
        description: 'Bad Request',
        content: {'application/json': {schema: {type: 'object'}}},
      },
    },
  })

  async signup(@requestBody() userData: User) {
    try {
      let validateData : Credentials = {
        email: userData.email,
        password: userData.password
      }

      validateCredentials(validateData);
      userData.password = await this.hasher.hashPassword(userData.password)
      const savedUser = await this.userRepository.create(userData);
      return {
        id: savedUser.id,
        name: savedUser.firstName,
        email: savedUser.email,
        role: savedUser.role,
      };
    } catch (error) {
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

  @post('/users/login', {
    responses: {
      '200': {
        description: 'Login success',
        content: {'application/json': {schema: {type: 'object', properties: {token: {type: 'string'}}}}},
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
        'application/json': {schema: CredentialsSchema},
      },
    })
    credentials: {email: string; password: string},
  ): Promise<{token: string}>{

    const user = await this.userService.verifyCredentials(credentials);
    console.log(user);

    const userProfile = this.userService.convertToUserProfile(user);
    console.log(userProfile);


    // GEnerate token
    const token = await this.jwtService.generateToken(userProfile)
    return Promise.resolve({token});
  }
}
