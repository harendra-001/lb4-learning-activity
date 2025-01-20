
import {Credentials} from '../models';
import {HttpErrors} from '@loopback/rest';

export function validateCredentials(credentials: Credentials) {
  if (!credentials.email) {
    throw new HttpErrors.BadRequest('Email is required');
  }

  if (!credentials.password) {
    throw new HttpErrors.BadRequest('Password is required');
  }

  // We can add more validations as needed, e.g., email format, password strength
}