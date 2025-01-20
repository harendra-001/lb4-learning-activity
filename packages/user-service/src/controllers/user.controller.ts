
import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories';
import {get, post, requestBody, HttpErrors} from '@loopback/rest';
import {Credentials, User} from '../models';
import {validateCredentials} from '../services/validator';
import {BcryptHasher} from '../services/hash.password.bcrypt';
import {inject, intercept} from '@loopback/core';
import {CredentialsSchema} from './specs/user.controller.spec';
import {JWTService} from '../services/jwt-service';
import {
  authenticate,
} from '@loopback/authentication';
import {Roles} from '../decorators/roles.decorator';
import {AUTHORIZATION_INTERCEPTOR_BINDING_KEY} from '../interceptors/authorization.interceptor';
import {UserProfile} from '@loopback/security';
import { MyUserService } from '../services/user-auth-service.ts';
import { Role } from '../models/role.enum';
import { SecurityBindings } from '@loopback/security';

@intercept(AUTHORIZATION_INTERCEPTOR_BINDING_KEY)
export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @inject('service.hasher')
    public hasher: BcryptHasher,

    @inject('services.userAuth.service')
    public userService: MyUserService,

    @inject('services.jwt.service')
    public jwtService: JWTService,
  ) {}

  @post('/users/signup', {
    responses: {
      '200': {
        description: 'User created successfully',
        content: { 'application/json': { schema: {'x-ts-type': User} } },
      },
      '400': {
        description: 'Bad Request',
        content: { 'application/json': { schema: {type: 'object'} } },
      },
    },
  })
  async signup(@requestBody() userData: User) {
    try {
      const validateData: Credentials = {
        email: userData.email,
        password: userData.password,
      };

      validateCredentials(validateData);
      userData.password = await this.hasher.hashPassword(userData.password);
      const savedUser = await this.userRepository.create(userData);
      return {
        id: savedUser.id,
        name: `${savedUser.firstName} ${savedUser.lastName}`,
        email: savedUser.email,
        role: savedUser.role,
      };
    } catch (error: any) {

      // We r checking unique constraint error (assuming PostgreSQL)
      if (error.code === '23505' && error.detail.includes('email')) {
        throw new HttpErrors.BadRequest('Email already exists');
      }

      // Other errors
      throw error;
    }
  }

  @post('/users/login', {
    responses: {
      '200': {
        description: 'Login success',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {type: 'string'},
              },
            },
          },
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
        'application/json': {schema: CredentialsSchema},
      },
    })
    credentials: Credentials,
  ): Promise<{token: string}> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    return {token};
  }

  @get('/users/me', {
    responses: {
      '200': {
        description: 'Current user profile',
        // content: {'application/json': {schema: {'x-ts-type': UserProfile}}},
      },
    },
  })
  @authenticate('jwt')
  @Roles(Role.Admin, Role.SuperAdmin)
  async me(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<UserProfile> {
    return currentUserProfile;
  }

  // @get('/admin/dashboard', {
  //   responses: {
  //     '200': {
  //       description: 'Admin dashboard',
  //       content: {'application/json': {schema: {type: 'object'}}},
  //     },
  //   },
  // })
  // @authenticate('jwt')
  // @Roles(Role.Admin, Role.SuperAdmin)
  // async adminDashboard(
  //   @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  // ): Promise<object> {
  //   // Your admin logic here
  //   return {message: 'Welcome to the Admin Dashboard'};
  // }

  // @get('/subscriber/content', {
  //   responses: {
  //     '200': {
  //       description: 'Subscriber content',
  //       content: {'application/json': {schema: {type: 'object'}}},
  //     },
  //   },
  // })
  //   @authenticate('jwt')
  //   @Roles(Role.Subscriber, Role.Admin, Role.SuperAdmin)
  // async subscriberContent(
  //   @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  // ): Promise<object> {
  //   // subscriber logic here
  //   return {content: 'Exclusive subscriber content'};
  // }
}