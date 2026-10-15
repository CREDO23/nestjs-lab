# nestjs-lab

Experiments I ran while learning NestJS. I started by building one app, [taskible-api](https://github.com/CREDO23/taskible-api), found that one app couldn't hold everything I wanted to try, and switched to separate experiments. Each one takes one concept, builds the smallest thing that shows it, and records what I found: trade-offs, what broke, what worked.

## How it's organised

- `experiments/<name>/`: one NestJS app per experiment, each a pnpm workspace package named `experiment--<name>`. Its README covers the problem, how the code works, how it went and what I learned; its tests check the pattern.
- `shared/`: the `@experiments/shared` package, with an `HttpExceptionFilter` and a request-logging module. `pnpm install` builds it. circuit-breaker-pattern uses its exception filter.
- `scripts/`: the scripts behind `pnpm start:exp` and `pnpm new:exp`.

## Experiments

Each experiment's README has the rest: how the code works, how it went, and the evidence behind each point.

### [Circuit breaker](experiments/circuit-breaker-pattern)

An interceptor that stops calling a failing route handler after 3 failures and tries again after 60 s.

**What I learned**

- When the circuit was open, the breaker skipped the handler but returned the last error the handler had thrown, so a client couldn't tell a skipped request from a real failure.
- A bad request counts as a failure too: three 400 responses were enough to open the circuit.

### [Configurable module](experiments/configurable-module)

A reusable module built with `ConfigurableModuleBuilder`, which generates `register()` and `registerAsync()` for passing it options.

**What I learned**

- The `env` option I declared with `setExtras` never reached the options the module injects: `register()` strips it, and it only lands on the module definition, where nothing reads it.

### [Lazy-loading modules](experiments/lazy-loading-modules)

`ReportsModule` is loaded with `LazyModuleLoader` on the first `GET /reports` instead of at startup.

**What I learned**

- Lazy-loading the module didn't keep `reports.service.ts` out of startup: the controller imports the service class to look it up, so only the module file waited for the first request.

### [Worker threads](experiments/worker-threads)

A CPU-heavy Fibonacci computation moved off the main thread, first to one worker, then to a piscina pool.

**What I learned**

- With the computation in a piscina pool, the server still answered `GET /` while `fibonacci(40)` was running.
- A worker thread loads its file with plain Node, so it has to point at the compiled `.js` file, not the `.ts` source.

## How to run

Requires Node 22 and pnpm 10.

```sh
pnpm install            # installs everything and builds shared/
pnpm start:exp <name>   # starts experiments/<name> in watch mode on port 3000 (set PORT to change it)
pnpm -r test            # runs every experiment's tests
pnpm new:exp <name>     # scaffolds a new experiment with the Nest CLI (needs jq)
```

Each experiment's README lists the endpoint to call and what to expect.
