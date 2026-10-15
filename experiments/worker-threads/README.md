# Worker threads

## Problem

Node runs JavaScript on one thread, so a CPU-heavy request blocks every other request until it finishes. Worker threads move that work off the main thread.

## Approach

`GET /fibonacci?n=<n>` computes a Fibonacci number with the naive recursive algorithm, which takes exponential time, so a large `n` keeps a thread busy. The code keeps two ways of running it in a worker:

- One static worker (`src/fibonacci/fibonacci-worker.host.ts`): a single worker started at application bootstrap and terminated at shutdown. Each request posts `{ n, id }` with a random UUID, and the host waits for the reply with the same `id`. The controller and worker code for this version are kept in comments at the bottom of `fibonacci.controller.ts` and `fibonacci.worker.ts`.
- A piscina pool (`src/fibonacci/fibonacci.controller.ts`, the active version): a `Piscina` pool runs `fibonacci.worker.js`. The comment in the controller gives the reason: several workers can run in parallel, so a second request goes to another worker if the first is busy.

`src/fibonacci/fibonacci.worker.ts` exports the function piscina calls, with `module.exports = (n) => fibonacci(n)`.

## What I took away

- The computation moved in three steps: first in the request handler itself, then in one static worker, then in a piscina pool.
- A worker thread loads its file with Node directly, so it needs the compiled `.js` file. The first static worker pointed at `fibonacci.worker.ts` and had to be changed to `.js`. For the same reason the e2e test runs against the compiled app in `dist/`: under jest there is no `fibonacci.worker.js` next to the controller.
- With one worker, all requests share one message channel, so each message carries an id to match the reply. The first version sent `{ n, uniqueId }` while the worker read `id`, and used `Date.now()` as the id; it was changed to `{ n, id }` with `randomUUID()`.
- `module.exports = ...` in the worker file replaces the named `export function fibonacci`, so importing `fibonacci` from that file gives `undefined`. A test marked `it.failing` records this.
- `app.close()` does not stop the piscina pool, because the pool is a plain field on the controller. The e2e test calls `destroy()` on it; without that, jest never exits.
- `FibonacciWorkerHost` is still registered in `FibonacciModule`, so the app still starts a worker thread from `fibonacci.worker.js` at bootstrap, although the controller no longer uses it.

<!-- TODO(Thierry): did you compare response times, or check that other routes stayed responsive while a large n was computed? -->
<!-- TODO(Thierry): why was Date.now() replaced as the message id: two requests in the same millisecond getting the same id? -->

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
