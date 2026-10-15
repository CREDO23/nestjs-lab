# Circuit breaker

## Problem

When something a route depends on keeps failing, calling it on every request wastes work and adds load to a service that is already down. A circuit breaker stops calling it for a while after repeated failures, then tries again.

## Approach

- [`src/interceptors/circuit-breaker.ts`](src/interceptors/circuit-breaker.ts): the `CircuitBreaker` class and its three states. Closed: calls go through. Open: calls are rejected without running the handler. Half-open: calls go through as a trial. Three constants set the behaviour: 3 failures open the circuit, it stays open for 60 s, and 3 successes in half-open close it.
- [`src/interceptors/circuit-breaker.interceptor.ts`](src/interceptors/circuit-breaker.interceptor.ts): a Nest interceptor that keeps one `CircuitBreaker` per route handler, in a `WeakMap` keyed by the handler function.
- [`src/app.controller.ts`](src/app.controller.ts): the test route. `GET /` goes through the interceptor, logs `Couldn't getHello` and always throws a 400 `HttpException`.
- [`src/main.ts`](src/main.ts): registers `HttpExceptionFilter` from `@experiments/shared`, so errors come back as JSON with `message`, `timestamp`, `path` and `method`.

## How it went

I wrote the state machine first: the failure handler, then the success handler, then the `CircuitBreaker` class and the interceptor that gives each route handler its own breaker. To check it, I changed `GET /` to always throw a 400, started the app and sent 30 requests in a loop. The server (left) logged `Couldn't getHello` three times, and every response in the loop (right) is the same 400 error:

![Server log with three "Couldn't getHello" lines next to a curl loop where every request returns the same 400 error](results/manual-test-2025-10-15.png)

Later, the e2e test [`test/circuit-breaker.e2e-spec.ts`](test/circuit-breaker.e2e-spec.ts) turned that check into a repeatable one with 5 requests.

## What I learned

- **To the client, an open circuit looks the same as a failure.** While the circuit is open, the breaker re-throws the error that opened it. In the screenshot, every request after the third got the same 400 `Couldn't getHello`, although the handler no longer ran.
- **A bad request is enough to open the circuit.** Every error the handler throws counts as a failure, client errors included: the route throws a 400, and three of them opened the circuit.
- **Only consecutive failures count.** Any success resets the failure count to zero.
- **Half-open lets every request through.** There is no limit on trial requests: each one goes through until 3 succeed or 1 fails.
- **Each route handler gets its own breaker.** The interceptor keys breakers by handler function, so a failing route does not open another route's circuit. The interceptor's unit test checks this.

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

The unit tests drive the state changes with jest fake timers. The e2e test sends 5 requests and checks that the handler ran 3 times.
