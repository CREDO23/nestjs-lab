# nestjs-lab

Experiments I ran while learning NestJS. I started by building one app, [taskible-api](https://github.com/CREDO23/taskible-api), found that one app couldn't hold everything I wanted to try, and switched to separate experiments. Each one takes one concept, builds the smallest thing that shows it, and records what I found: trade-offs, what broke, what worked.

## Contents

- [Experiments](#experiments)
  - [Circuit breaker](#circuit-breaker)
  - [Configurable module](#configurable-module)
  - [Lazy-loading modules](#lazy-loading-modules)
  - [Worker threads](#worker-threads)
- [Getting started](#getting-started)
- [Repository layout](#repository-layout)

## Experiments

Each experiment's README has the details: the files, how each point was checked, and how to run it.

### [Circuit breaker](experiments/circuit-breaker-pattern)

**The idea.** When a route depends on something that keeps failing, like a database or another service, calling it on every request wastes time and adds load to something already broken. A circuit breaker counts failures. After too many in a row it "opens" and, for a while, rejects calls without running them. Then it lets calls through again to check whether things have recovered, and "closes" once they succeed.

**What I built.** A `CircuitBreaker` class and a Nest interceptor that gives each route its own breaker. It opens after 3 failures in a row, stays open for 60 s, and closes again after 3 successful calls. To test it, the route `GET /` always throws a 400 error.

**What I learned**

- While the circuit was open, the route's code no longer ran, but clients still got the same `400 Couldn't getHello` as before. Nothing in the response said the circuit was open.
- The breaker counts every error, including 400s: three bad requests were enough to open the circuit.

### [Configurable module](experiments/configurable-module)

**The idea.** A reusable Nest module often needs settings from the app that imports it. `ConfigurableModuleBuilder` generates `register()` and `registerAsync()` for passing them, and it has two kinds of settings:

- **options**, which the module's services receive as one options object;
- **extras**, declared with `setExtras`, which are meant to change how the module itself is set up.

**What I built.** `EnvVariablesModule`, with a port, a host and database settings as options. I added `env` (`development`, `production` or `test`) as an extra, so the same module can be configured for each environment.

**What I learned**

- An extra never reaches the options object: `register({ port: 5000, env: 'production' })` gives the services `{ port: 5000 }`. Nest passes `env` only to the function given to `setExtras`, so that function has to pass it on; here it registers `env` as its own provider.

### [Lazy-loading modules](experiments/lazy-loading-modules)

**The idea.** Nest normally loads and creates every module when the app starts. With lazy loading, a module is loaded only the first time it's needed, so the app doesn't pay for it until then.

**What I built.** A `ReportsModule` that `AppModule` doesn't import. The first `GET /reports` loads it with `LazyModuleLoader`, gets `ReportsService` from it, and returns the service's result. The module logs a line when Nest creates it, which shows when it loads.

**What I learned**

- Lazy loading delayed creating `ReportsModule`, but not loading the service's code. The controller has a normal `import { ReportsService }` at the top, because it needs the class to find the service, so `reports.service.ts` is loaded at startup anyway. Only `reports.module.ts` waits for the first request.
- The module is created only once. Every `GET /reports` calls `load()`, but only the first call creates the module; later calls get the same one back.

### [Worker threads](experiments/worker-threads)

**The idea.** Node runs JavaScript on one thread, so a CPU-heavy request makes every other request wait. Worker threads run code on separate threads. A pool like piscina keeps several ready and hands each task to a free one.

**What I built.** A `GET /fibonacci?n=…` endpoint that computes Fibonacci numbers recursively, as a CPU-heavy task. I ran the computation three ways: in the request handler, in one worker thread started with the app, and in a piscina pool.

**What I learned**

- In the request handler, the computation makes `GET /` wait until it finishes. In the pool, `GET /` still answered while `fibonacci(40)` was running.
- With one worker, several requests can be waiting for an answer at the same time, so each request sends an id with its number and waits for the answer with the same id. Otherwise a request can get another request's answer.
- A worker is started from a file path, and Node loads that file itself, outside the TypeScript build. So the path has to name the compiled `fibonacci.worker.js`; my first version used `fibonacci.worker.ts`, which crashes the app right after it starts.

## Getting started

Requires Node 22 and pnpm 10.

```sh
pnpm install            # installs everything and builds shared/
pnpm start:exp <name>   # starts experiments/<name> in watch mode on port 3000 (set PORT to change it)
pnpm -r test            # runs every experiment's tests
pnpm new:exp <name>     # scaffolds a new experiment with the Nest CLI (needs jq)
```

`<name>` is a folder under `experiments/`, for example `pnpm start:exp circuit-breaker-pattern`. Each experiment's README lists the endpoint to call and what to expect.

## Repository layout

```text
experiments/                one NestJS app per experiment
  circuit-breaker-pattern/
  configurable-module/
  lazy-loading-modules/
  worker-threads/
shared/                     @experiments/shared: an HttpExceptionFilter and a request-logging module
scripts/                    the scripts behind pnpm start:exp and pnpm new:exp
```

Each experiment is its own pnpm workspace package, named `experiment--<name>`, built with NestJS 11 and TypeScript and tested with Jest. `pnpm install` builds `shared/`; circuit-breaker-pattern uses its exception filter.
