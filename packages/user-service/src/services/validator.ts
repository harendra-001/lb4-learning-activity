import isEmail from 'isemail'; 
import { Credentials } from '../models/user.model';
import { HttpErrors } from '@loopback/rest';

export function validateCredentials(credentials: Credentials) {
    if (!isEmail.validate(credentials.email)) {
        throw new HttpErrors.UnprocessableEntity('Invalid Email');
    }

    if (credentials.password.length < 4) {
        throw new HttpErrors.UnprocessableEntity('Password length should be greater than 4');
    }
}
