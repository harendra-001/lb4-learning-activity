import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import { BcryptHasher } from './services/hash.password.bcrypt';
import { MyUserService } from './services/userAuth-service';
import { JWTService } from './services/jwt-service';
import { AuthenticationComponent, registerAuthenticationStrategy } from '@loopback/authentication';
import { JWTAuthenticationStrategy } from './authentication-strategies/jwt.strategy';
// import { JWTService } from './services/jwt-service';

export {ApplicationConfig};

export class UserServiceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

     // Add OpenAPI security specification
    this.api({
      openapi: '3.0.0',
      info: {title: 'MyApp API', version: '1.0.0'},
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
      security: [{bearerAuth: []}], // Apply bearerAuth globally
    });


    // Add authentication component
    this.component(AuthenticationComponent);

    // Register JWT authentication strategy
    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);

    // Set up bindings
    this.setupBinding();

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

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
  setupBinding(): void {
    this.bind('service.hasher').toClass(BcryptHasher);
    this.bind('round').to(10);
    this.bind('services.userAuth.service').toClass(MyUserService);
    this.bind('services.jwt.service').toClass(JWTService);
    this.bind('authentication.jwt.secret').to('adfasdkfjadjfald');
    this.bind('authentication.jwt.expiresIn').to('1h');
  }
}
