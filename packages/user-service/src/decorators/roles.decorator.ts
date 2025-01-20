import {MethodDecoratorFactory} from '@loopback/metadata';
import {Role} from '../models/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => MethodDecoratorFactory.createDecorator<string[]>(
  ROLES_KEY,
  roles,
);