# Lazy-loading modules

## The idea

Nest normally loads and creates every module when the app starts. With lazy loading, a module is loaded only the first time it's needed, so the app doesn't pay for it until then.

## What I built

- [`src/reports/reports.module.ts`](src/reports/reports.module.ts): `ReportsModule`, which `AppModule` doesn't import. Its constructor logs `ReportsModule loaded lazily`, which shows when Nest creates it.
- [`src/app.controller.ts`](src/app.controller.ts): `GET /reports` loads `ReportsModule` with `LazyModuleLoader`, gets `ReportsService` from it, and returns the service's result.

## What I learned

- Lazy loading delayed creating `ReportsModule`, but not loading the service's code. The controller has a normal `import { ReportsService }` at the top, because it needs the class to find the service, so `reports.service.ts` is loaded at startup anyway; only `reports.module.ts` waits for the first request. An earlier version imported the service with `await import(…)` as well. Loading the built controller shows it:

  ```sh
  cd experiments/lazy-loading-modules && pnpm build
  node -e "require('./dist/app.controller'); console.log(Object.keys(require.cache).filter(k => k.includes('/reports/')))"
  ```

  The only file listed is `dist/reports/reports.service.js`.
- Before the first `GET /reports`, the module isn't part of the app: asking Nest for `ReportsService` fails until then.
- The module is created only once. Every `GET /reports` calls `load()`, but only the first call creates the module; later calls get the same one back, and the log line appears once.

The tests ([`src/app.controller.spec.ts`](src/app.controller.spec.ts)) check the last two.

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
