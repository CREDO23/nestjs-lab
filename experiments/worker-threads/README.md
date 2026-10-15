# Worker threads

## The idea

Node runs JavaScript on one thread, so a CPU-heavy request makes every other request wait. Worker threads run code on separate threads. A pool like piscina keeps several ready and hands each task to a free one.

## What I built

`GET /fibonacci?n=…` computes Fibonacci numbers recursively, as a CPU-heavy task. I ran the computation three ways:

1. In the request handler, on the main thread.
2. In one worker thread started with the app ([`src/fibonacci/fibonacci-worker.host.ts`](src/fibonacci/fibonacci-worker.host.ts)). Each request sends its number with an id and waits for the answer with the same id. This version is still in the code but not used.
3. In a piscina pool ([`src/fibonacci/fibonacci.controller.ts`](src/fibonacci/fibonacci.controller.ts)), the version in use. The pool runs `fibonacci()` from [`src/fibonacci/fibonacci.worker.ts`](src/fibonacci/fibonacci.worker.ts).

## What I learned

- In the request handler, the computation makes `GET /` wait until it finishes. In the pool, `GET /` still answered while `fibonacci(40)` was running. The e2e test ([`test/fibonacci.e2e-spec.ts`](test/fibonacci.e2e-spec.ts)) checks it, and fails when the computation runs on the main thread.
- With one worker, several requests can be waiting for an answer at the same time, so each request sends an id with its number and waits for the answer with the same id. Otherwise a request can get another request's answer. My first version sent the id as `uniqueId` while the worker read `id`, and used `Date.now()`, which two requests in the same millisecond share; it now uses `randomUUID()`.
- A worker is started from a file path, and Node loads that file itself, outside the TypeScript build. So the path has to name the compiled `fibonacci.worker.js`; my first version used `fibonacci.worker.ts`, which crashes the app right after it starts. For the same reason, the e2e test runs against the compiled app in `dist/`.

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
