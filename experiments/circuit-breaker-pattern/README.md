# Circuit breaker

## Problem

When something a route depends on keeps failing, calling it on every request wastes work and adds load to a service that is already down. A circuit breaker stops calling it for a while after repeated failures, then tries again.

## Approach

- `src/interceptors/circuit-breaker.ts`: the `CircuitBreaker` class and its three states. Closed: calls go through. Open: calls are rejected without running the handler. Half-open: calls go through as a trial. Three constants set the behaviour: 3 failures open the circuit, it stays open for 60 s, and 3 successes in half-open close it.
- `src/interceptors/circuit-breaker.interceptor.ts`: a Nest interceptor that keeps one `CircuitBreaker` per route handler, in a `WeakMap` keyed by the handler function.
- `src/app.controller.ts`: the test route. `GET /` goes through the interceptor, logs `Couldn't getHello` and always throws a 400 `HttpException`.
- `src/main.ts`: registers `HttpExceptionFilter` from `@experiments/shared`, so errors come back as JSON with `message`, `timestamp`, `path` and `method`.

## What I took away

- Every error the handler throws counts as a failure, client errors included. The test route throws a 400, and that is enough to open the circuit.
- While the circuit is open, the breaker re-throws the error that opened it. A client gets the same 400 `Couldn't getHello` whether the handler ran or not; nothing in the response says the circuit is open.
- Any success resets the failure count, so only consecutive failures open the circuit.
- Half-open does not limit how many requests go through: each one is a trial until 3 succeed or 1 fails.
- The state lives in memory in the interceptor, one breaker per route handler. A failing route does not open another route's circuit.

<!-- TODO(Thierry): should 4xx errors count as failures, or only failures of the dependency (5xx, timeouts)? -->
<!-- TODO(Thierry): would a dedicated "circuit open" error (for example a 503) have helped clients more than re-throwing the last error? -->

## How to run

From the repository root:

```sh
pnpm start:exp circuit-breaker-pattern
```

In another terminal:

```sh
for i in 1 2 3 4 5; do curl -s localhost:3000; echo; done
```

All five responses are the same 400 JSON error, but the server logs `Couldn't getHello` only three times: after the third failure the circuit opens and the handler is no longer called. After 60 s the next request reaches the handler again.

Tests:

```sh
pnpm --filter experiment--circuit-breaker-pattern test
```

The unit tests drive the state changes with jest fake timers. The e2e test (`test/circuit-breaker.e2e-spec.ts`) sends 5 requests and checks that the handler ran 3 times.
