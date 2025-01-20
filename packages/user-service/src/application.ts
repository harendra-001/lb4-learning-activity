import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, BindingKey, BindingScope, Provider} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {BcryptHasher} from './services/hash.password.bcrypt';
import {JWTService} from './services/jwt-service';
import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {JWTAuthenticationStrategy} from './authentication-strategies/jwt.strategy';
import {AuthorizationInterceptor, AUTHORIZATION_INTERCEPTOR_BINDING_KEY} from './interceptors/authorization.interceptor';
import * as dotenv from 'dotenv';
import { MyUserService } from './services/user-auth-service.ts';

dotenv.config();

export {ApplicationConfig};

export class UserServiceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Customize OpenAPI spec with security scheme
    this.api({
      openapi: '3.0.0',
      info: {title: 'My API', version: '1.0.0'},
      paths: {},
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    });

    this.sequence(MySequence);

     // Set up default home page
     this.static('/', path.join(__dirname, '../public'));


    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    // Bind services
    this.bind('service.hasher').toClass(BcryptHasher);
    this.bind('services.userAuth.service').toClass(MyUserService);
    this.bind('services.jwt.service').toClass(JWTService);

    // JWT Configuration using environment variables
    this.bind('jwt.secret').to(process.env.JWT_SECRET || 'kdjaskjdlasd');
    this.bind('jwt.expiresIn').to(process.env.JWT_EXPIRES_IN || '1h');

    // Register authentication component
    this.component(AuthenticationComponent);
    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);


    // Bind Authorization Interceptor
    this.bind(AUTHORIZATION_INTERCEPTOR_BINDING_KEY)
      .toProvider(AuthorizationInterceptor)
      .inScope(BindingScope.TRANSIENT);

    // Ensure that boot options are correctly set
    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}