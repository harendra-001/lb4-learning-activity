import {
    inject,
    Provider,
  } from '@loopback/core';
  import {
    InvocationContext,
    Next,
    ValueOrPromise,
    Interceptor,
  } from '@loopback/context';
  import {ROLES_KEY} from '../decorators/roles.decorator';
  import {UserProfile} from '@loopback/security';
  import {HttpErrors} from '@loopback/rest';
  import {MetadataInspector} from '@loopback/metadata';
  import {AuthenticationBindings} from '@loopback/authentication';

  export const AUTHORIZATION_INTERCEPTOR_BINDING_KEY = 'interceptors.authorization';
  
   // AuthorizationInterceptor checks if the current user has the required roles to access the method.
  export class AuthorizationInterceptor implements Provider<Interceptor> {
    constructor(
      @inject.getter(AuthenticationBindings.CURRENT_USER)
      public getCurrentUser: () => ValueOrPromise<UserProfile | undefined>,
    ) {}
    
    // Returns the interceptor function.
    value(): Interceptor {
      return this.intercept.bind(this);
    }
  
    /**
     * Intercepts method invocations to enforce role-based access control.
     * @param invocationCtx The invocation context.
     * @param next The next interceptor in the chain.
     * @returns The result of the method invocation.
     */
    async intercept(
      invocationCtx: InvocationContext,
      next: Next,
    ): Promise<ValueOrPromise<unknown>> {

      // Retrieve the required roles from method metadata using MetadataInspector
      const requiredRoles: string[] | undefined = MetadataInspector.getMethodMetadata<string[]>(
        ROLES_KEY,
        invocationCtx.target,
        invocationCtx.methodName,
      );
  
      if (!requiredRoles || requiredRoles.length === 0) {
        // No roles required, proceed
        return next();
      }
  
      const currentUser: UserProfile | undefined = await this.getCurrentUser();
      if (!currentUser) {
        throw new HttpErrors.Unauthorized('User is not authenticated');
      }
  
      const userRole = currentUser.role;
      if (!userRole) {
        throw new HttpErrors.Forbidden('User does not have any roles assigned');
      }
  
      if (!requiredRoles.includes(userRole)) {
        throw new HttpErrors.Forbidden('User does not have sufficient permissions');
      }
  
      return next();
    }
  }