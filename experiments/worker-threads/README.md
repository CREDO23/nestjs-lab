# Worker threads

## Problem

Node runs JavaScript on one thread, so a CPU-heavy request blocks every other request until it finishes. Worker threads move that work off the main thread.

## Approach

`GET /fibonacci?n=<n>` computes a Fibonacci number with the naive recursive algorithm, which takes exponential time, so a large `n` keeps a thread busy. The code keeps two ways of running it in a worker:

- One static worker ([`src/fibonacci/fibonacci-worker.host.ts`](src/fibonacci/fibonacci-worker.host.ts)): a single worker started at application bootstrap and terminated at shutdown. Each request posts `{ n, id }` with a random UUID, and the host waits for the reply with the same `id`. The class is still in the code but not in `FibonacciModule`'s providers, so it doesn't run; the controller and worker code for this version are in comments at the bottom of `fibonacci.controller.ts` and `fibonacci.worker.ts`.
- A piscina pool ([`src/fibonacci/fibonacci.controller.ts`](src/fibonacci/fibonacci.controller.ts), the active version): a `Piscina` pool runs `fibonacci.worker.js`. The comment in the controller gives the reason: several workers can run in parallel, so a second request goes to another worker if the first is busy.

[`src/fibonacci/fibonacci.worker.ts`](src/fibonacci/fibonacci.worker.ts) exports `fibonacci()`. The pool is created with `name: 'fibonacci'`, which tells piscina which exported function to run.

## How it went

I started with the computation inside the request handler, on the main thread. Then I moved it to a single worker started at bootstrap, and had to fix two things: the worker path changed from `fibonacci.worker.ts` to `fibonacci.worker.js`, and the message changed from `{ n, uniqueId }` with a `Date.now()` id to `{ n, id }` with a `randomUUID()`. Last, I replaced the single worker with a piscina pool and kept the single-worker version in comments.

## What I learned

- **While the pool computes, the main thread stays free.** The e2e test starts `fibonacci(40)` and, while it is still running in the pool, `GET /` answers. The same test fails when the computation runs on the main thread instead.
- **A worker thread runs compiled JavaScript.** Node loads the worker file directly, without the TypeScript build, hence the switch from `.ts` to `.js`. Under jest there is no `fibonacci.worker.js` next to the controller, so the e2e test runs against the compiled app in `dist/`.
- **With one worker, each message needs an id.** All requests share one message channel, so the host tags each message and waits for the reply with the same tag. The first version sent the tag as `uniqueId` while the worker read `id`.

## How to run

From the repository root:

```sh
pnpm start:exp worker-threads
```

In another terminal:

```sh
curl 'localhost:3000/fibonacci?n=10'
```

returns `55`. Without `n`, the default is 10.

Tests:

```sh
pnpm --filter experiment--worker-threads test
```

The e2e step builds the app first (`nest build`) and runs against `dist/`.
