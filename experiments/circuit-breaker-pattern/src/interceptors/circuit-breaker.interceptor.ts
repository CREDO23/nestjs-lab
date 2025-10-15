import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CircuitBreaker } from './circuit-breaker.';

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private circuitBreakersRegistry = new WeakMap<Function, CircuitBreaker>();

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const targetHandler = context.getHandler();

    let circuitBreaker: CircuitBreaker;

    if (this.circuitBreakersRegistry.has(targetHandler)) {
      circuitBreaker = this.circuitBreakersRegistry.get(
        targetHandler,
      ) as CircuitBreaker;
    } else {
      circuitBreaker = new CircuitBreaker();
      this.circuitBreakersRegistry.set(targetHandler, circuitBreaker);
    }

    return circuitBreaker.exec(next);
  }
}
