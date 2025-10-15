import { CallHandler } from '@nestjs/common';
import { tap } from 'rxjs';

const SUCCESS_THRESHOLD = 3; // the number of successful requests needed to close the circuit
const FAILURE_THRESHOLD = 3; // the number of failed requests needed to open the circuit
const OPEN_TO_HALF_OPEN_TIMEOUT = 60000; // the timeout in milliseconds needed to move from open to half-open state

enum CIRCUIT_BREAKER_STATE {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open',
}

export class CircuitBreakerInterceptor {
  private state: CIRCUIT_BREAKER_STATE = CIRCUIT_BREAKER_STATE.CLOSED;
  private successCount = 0;
  private failureCount = 0;
  private lastError?: Error;
  private nextAttempt: number;

  exec(next: CallHandler) {
    return next.handle().pipe(
      tap({
        next: () => this.handleSuccess(),
        error: (err) => this.handleFailure(err),
      }),
    );
  }

  private handleSuccess() {
    this.failureCount = 0;

    if (this.state === CIRCUIT_BREAKER_STATE.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= SUCCESS_THRESHOLD) {
        this.state = CIRCUIT_BREAKER_STATE.CLOSED;
        this.successCount = 0;
      }
    }
  }

  private handleFailure(err: Error) {
    this.failureCount++;

    if (
      this.failureCount >= FAILURE_THRESHOLD ||
      this.state === CIRCUIT_BREAKER_STATE.HALF_OPEN
    ) {
      this.state = CIRCUIT_BREAKER_STATE.OPEN;
      this.lastError = err;
      this.nextAttempt = Date.now() + OPEN_TO_HALF_OPEN_TIMEOUT;
    }
  }
}
