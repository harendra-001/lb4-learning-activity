import {UserService} from '@loopback/authentication';
import {UserProfile, securityId} from '@loopback/security';
import {Credentials, User} from '../models';
import {UserRepository} from '../repositories';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {PasswordHasher} from './hash.password.bcrypt';

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('service.hasher')
    public hasher: PasswordHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    if (!credentials.email || !credentials.password) {
      throw new HttpErrors.BadRequest('Missing email or password');
    }

    const foundUser = await this.userRepository.findOne({
      where: {email: credentials.email},
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized('Invalid email or password');
    }

    const passwordMatched = await this.hasher.comparePassword(
      credentials.password,
      foundUser.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Invalid email or password');
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: user.id!.toString(),
      name: `${user.firstName} ${user.lastName}`,
      id: user.id,
      role: user.role,
    };
  }
}