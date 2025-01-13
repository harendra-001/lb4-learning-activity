import { UserService } from "@loopback/authentication";
import { Credentials, User } from "../models";
import { securityId, UserProfile } from "@loopback/security";
import { repository } from "@loopback/repository";
import { UserRepository } from "../repositories";
import { HttpErrors } from "@loopback/rest";
import { inject } from "@loopback/core";
import { BcryptHasher } from "./hash.password.bcrypt";

export class MyUserService implements UserService<User, Credentials> {

  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @inject('service.hasher')
    public hasher: BcryptHasher
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    // Find user by email
    const foundUser = await this.userRepository.findOne({
      where: {
        email: credentials.email
      }
    });

    if (!foundUser) {
      throw new HttpErrors.NotFound(`User not found with email: ${credentials.email}`);
    }

    // Compare passwords
    const passwordMatched = await this.hasher.compparePassword(credentials.password, foundUser.password);
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Password is not valid');
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    let userName = '';

    if (user.firstName) {
      userName = user.firstName;
    }

    if (user.lastName) {
      userName = `${userName} ${user.lastName}`;
    }

    return {
      [securityId]: `${user.id}`,
      name: userName,
      role: user.role,
      id: `${user.id}`,
    };
  }

}