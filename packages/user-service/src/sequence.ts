
import {
    AuthenticateFn,
    AuthenticationBindings,
  } from '@loopback/authentication';
  import {
    FindRoute,
    InvokeMethod,
    ParseParams,
    Reject,
    RequestContext,
    RestBindings,
    Send,
    SequenceHandler,
  } from '@loopback/rest';
  import {inject} from '@loopback/core';
  
  const SequenceActions = RestBindings.SequenceActions;
  
  export class MySequence implements SequenceHandler {
    constructor(
      @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
      @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
      @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
      @inject(SequenceActions.SEND) public send: Send,
      @inject(SequenceActions.REJECT) public reject: Reject,
  
      @inject(AuthenticationBindings.AUTH_ACTION)
      public authenticateRequest: AuthenticateFn,
    ) {}
  
    /**
     * Handles incoming requests by authenticating and invoking the appropriate controller method.
     * @param context The request context.
     */
    async handle(context: RequestContext): Promise<void> {
      try {
        const {request, response} = context;
        const route = this.findRoute(request);
  
        // Authenticate the request
        await this.authenticateRequest(request);
  
        const args = await this.parseParams(request, route);
        const result = await this.invoke(route, args);
        this.send(response, result);
      } catch (err) {
        this.reject(context, err);
      }
    }
  }
  