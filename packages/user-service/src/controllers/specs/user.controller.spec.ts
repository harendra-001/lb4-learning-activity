import {SchemaObject} from '@loopback/rest';

export const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'The email address of the user',
    },
    password: {
      type: 'string',
      minLength: 4,
      description: 'The password of the user (minimum 8 characters)',
    },
  },
  additionalProperties: false, 
};
