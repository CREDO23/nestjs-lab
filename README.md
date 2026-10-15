# nestjs-lab

Experiments I ran while learning NestJS. I started by building one app, [taskible-api](https://github.com/CREDO23/taskible-api), found that one app couldn't hold everything I wanted to try, and switched to separate experiments. Each one takes one concept, builds the smallest thing that shows it, and records what I found: trade-offs, what broke, what worked.

## How it's organised

- `experiments/<name>/`: one NestJS app per experiment, each a pnpm workspace package named `experiment--<name>`, with its own README and tests.
- `shared/`: the `@experiments/shared` package, with an `HttpExceptionFilter` and a request-logging module. `pnpm install` builds it. circuit-breaker-pattern uses its exception filter.
- `scripts/`: the scripts behind `pnpm start:exp` and `pnpm new:exp`.

## Experiments

| Experiment | What it shows |
| --- | --- |
| [circuit-breaker-pattern](experiments/circuit-breaker-pattern) | An interceptor that stops calling a failing route handler after 3 failures and tries again after 60 s. |
| [configurable-module](experiments/configurable-module) | A dynamic module built with `ConfigurableModuleBuilder`: `register()`, `registerAsync()` and an extra option. |
| [lazy-loading-modules](experiments/lazy-loading-modules) | Loading a module on the first request with `LazyModuleLoader` instead of at startup. |
| [worker-threads](experiments/worker-threads) | Moving CPU-heavy work off the main thread, with one worker and with a piscina pool. |

## How to run

Requires Node 22 and pnpm 10.

```sh
pnpm install            # installs everything and builds shared/
pnpm start:exp <name>   # starts experiments/<name> in watch mode on port 3000 (set PORT to change it)
pnpm -r test            # runs every experiment's tests
pnpm new:exp <name>     # scaffolds a new experiment with the Nest CLI (needs jq)
```

Each experiment's README lists the endpoint to call and what to expect.
