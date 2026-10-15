import { CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { CircuitBreaker } from './circuit-breaker';

const OPEN_TO_HALF_OPEN_TIMEOUT = 60_000;

// Each call fails with a new error, so tests can tell which error the breaker returns.
function failingHandler() {
  let calls = 0;
  return {
    handle: jest.fn(() => {
      calls++;
      return throwError(() => new Error(`failure ${calls}`));
    }),
  } satisfies CallHandler;
}

function succeedingHandler() {
  return { handle: jest.fn(() => of('ok')) } satisfies CallHandler;
}

// The handlers above are synchronous, so the result is known when exec() returns.
function run(breaker: CircuitBreaker, handler: CallHandler): unknown {
  let error: unknown;
  breaker.exec(handler).subscribe({
    error: (err) => {
      error = err;
    },
  });
  return error;
}

function openBreaker(breaker: CircuitBreaker) {
  const handler = failingHandler();
  for (let i = 0; i < 3; i++) run(breaker, handler);
}

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    jest.useFakeTimers();
    breaker = new CircuitBreaker();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('closed', () => {
    it('still calls the handler after 2 failures', () => {
      const handler = failingHandler();
      run(breaker, handler);
      run(breaker, handler);

      run(breaker, handler);

      expect(handler.handle).toHaveBeenCalledTimes(3);
    });

    it('opens after 3 failures: the handler is not called and the last error is returned', () => {
      const handler = failingHandler();
      for (let i = 0; i < 3; i++) run(breaker, handler);

      const error = run(breaker, handler);

      expect(handler.handle).toHaveBeenCalledTimes(3);
      expect(error).toEqual(new Error('failure 3'));
    });
  });

  describe('open', () => {
    it('stays open until 60 s have passed', () => {
      openBreaker(breaker);
      jest.advanceTimersByTime(OPEN_TO_HALF_OPEN_TIMEOUT - 1);
      const handler = succeedingHandler();

      run(breaker, handler);

      expect(handler.handle).not.toHaveBeenCalled();
    });

    it('moves to half-open after 60 s and lets a call through', () => {
      openBreaker(breaker);
      jest.advanceTimersByTime(OPEN_TO_HALF_OPEN_TIMEOUT);
      const handler = succeedingHandler();

      const error = run(breaker, handler);

      expect(handler.handle).toHaveBeenCalledTimes(1);
      expect(error).toBeUndefined();
    });
  });

  describe('half-open', () => {
    beforeEach(() => {
      openBreaker(breaker);
      jest.advanceTimersByTime(OPEN_TO_HALF_OPEN_TIMEOUT);
    });

    it('closes after 3 successes: one failure afterwards does not open it', () => {
      const success = succeedingHandler();
      for (let i = 0; i < 3; i++) run(breaker, success);
      const failure = failingHandler();
      run(breaker, failure);

      run(breaker, failure);

      expect(failure.handle).toHaveBeenCalledTimes(2);
    });

    it('is still half-open after 2 successes: one failure opens it again', () => {
      const success = succeedingHandler();
      for (let i = 0; i < 2; i++) run(breaker, success);
      const failure = failingHandler();
      run(breaker, failure);

      const error = run(breaker, failure);

      expect(failure.handle).toHaveBeenCalledTimes(1);
      expect(error).toEqual(new Error('failure 1'));
    });

    it('opens again after 1 failure and waits another 60 s', () => {
      const failure = failingHandler();
      run(breaker, failure);
      jest.advanceTimersByTime(OPEN_TO_HALF_OPEN_TIMEOUT - 1);

      const error = run(breaker, failure);

      expect(failure.handle).toHaveBeenCalledTimes(1);
      expect(error).toEqual(new Error('failure 1'));
    });
  });
});
