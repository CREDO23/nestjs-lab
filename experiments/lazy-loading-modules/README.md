# Lazy-loading modules

## Problem

Every module the root module imports is loaded and instantiated at startup, even one that is rarely used. Lazy loading defers a module until the first request that needs it.

## Approach

- `src/app.controller.ts`: `GET /reports` calls `LazyModuleLoader.load()` with a dynamic `import('./reports/reports.module')`, then gets `ReportsService` from the returned module reference.
- `src/reports/reports.module.ts`: `ReportsModule` is not imported by `AppModule`. Its constructor logs `ReportsModule loaded lazily`, which shows when Nest instantiates it.
- `src/reports/reports.service.ts`: the service the route calls.

## What I took away

- `ReportsModule` is not part of the app at startup: `app.get(ReportsService)` throws until the first `GET /reports`.
- The first request loads and instantiates it. Later requests call `load()` again but get the same module reference back, and the constructor does not run again.
- What is deferred is the Nest module and its providers, not all of their code. The controller imports `ReportsService` statically to use it as the lookup token, so `reports.service.ts` is loaded at startup; only `reports.module.ts` is imported on demand. An earlier version imported the service dynamically too.

<!-- TODO(Thierry): was switching to the static import a deliberate trade-off, or just simpler code? -->
<!-- TODO(Thierry): did you measure startup time with and without lazy loading? -->

## How to run

From the repository root:

```sh
pnpm start:exp lazy-loading-modules
```

In another terminal, call the route twice:

```sh
curl localhost:3000/reports
curl localhost:3000/reports
```

Both return `This action returns all reports`. The server logs `ReportsModule loaded lazily` once, on the first request.

Tests:

```sh
pnpm --filter experiment--lazy-loading-modules test
```
