import {
    inject,
    Provider,
    Interceptor,
    InvocationContext,
    Next,
    ValueOrPromise,
  } from '@loopback/core';
  
  /**
   * Logging Interceptor
   * Logs request and response data for all methods it intercepts.
   */
  export class LoggingInterceptor implements Provider<Interceptor> {
    /**
     * Constructor to inject any required dependencies (optional here).
     */
    constructor() {}
  
    /**
     * The value method returns the interceptor function.
     */
    value(): Interceptor {
      return this.intercept.bind(this);
    }
  
    /**
     * The intercept method defines the logic of the interceptor.
     * @param invocationCtx - The context of the invocation.
     * @param next - The next function in the invocation chain.
     */
    async intercept(
      invocationCtx: InvocationContext,
      next: Next,
    ): Promise<ValueOrPromise<unknown>> {
      console.log(`\n--- Logging Interceptor ---`);
      console.log(`Method: ${invocationCtx.methodName}`);
      console.log(`Arguments: ${JSON.stringify(invocationCtx.args)}`);
      
      const result = await next();
      
      console.log(`Result: ${JSON.stringify(result)}`);
      console.log(`--- End of Logging Interceptor ---\n`);
  
      return result;
    }
  }
  