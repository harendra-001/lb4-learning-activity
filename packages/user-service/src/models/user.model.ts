import {Entity, model, property} from '@loopback/repository';
import { Role } from './role.enum';
import { FormattedDate } from '../decorators/date.decorator';

export type Credentials = {
  email: string;
  password: string;
}

@model({
  settings: {
    indexes: {
      uniqueEmail: {
        keys: {email: 1}, // Define the column to be unique
        options: {unique: true}, // Enforce uniqueness
      },
    },
  },
})

export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  firstName: string;

  @property({
    type: 'string',
    required: true,
  })
  lastName: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,

    jsonSchema:{
      enum: Object.values(Role)
    }

  })
  role: Role;

  @FormattedDate()
  createdOn?: string;

  @FormattedDate()
  modifiedOn?: string;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;


