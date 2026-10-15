import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { CircuitBreakerInterceptor } from './circuit-breaker.interceptor';

// The interceptor only reads the route handler from the context.
function contextFor(routeHandler: () => unknown) {
  return { getHandler: () => routeHandler } as unknown as ExecutionContext;
}

function run(
  interceptor: CircuitBreakerInterceptor,
  context: ExecutionContext,
  next: CallHandler,
) {
  interceptor.intercept(context, next).subscribe({ error: () => undefined });
}

describe('CircuitBreakerInterceptor', () => {
  it('keeps one breaker per route handler: a failing route does not open another route', () => {
    const interceptor = new CircuitBreakerInterceptor();
    const failingRoute = contextFor(() => 'failing route');
    const healthyRoute = contextFor(() => 'healthy route');
    const failing = { handle: jest.fn(() => throwError(() => new Error())) };
    const healthy = { handle: jest.fn(() => of('ok')) };

    for (let i = 0; i < 4; i++) run(interceptor, failingRoute, failing);
    run(interceptor, healthyRoute, healthy);

    expect(failing.handle).toHaveBeenCalledTimes(3);
    expect(healthy.handle).toHaveBeenCalledTimes(1);
  });
});
