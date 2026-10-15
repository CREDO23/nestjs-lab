# Lazy-loading modules

## Problem

Every module the root module imports is loaded and instantiated at startup, even one that is rarely used. Lazy loading defers a module until the first request that needs it.

## Approach

- [`src/app.controller.ts`](src/app.controller.ts): `GET /reports` calls `LazyModuleLoader.load()` with a dynamic `import('./reports/reports.module')`, then gets `ReportsService` from the returned module reference.
- [`src/reports/reports.module.ts`](src/reports/reports.module.ts): `ReportsModule` is not imported by `AppModule`. Its constructor logs `ReportsModule loaded lazily`.
- [`src/reports/reports.service.ts`](src/reports/reports.service.ts): the service the route calls.

## How it went

I added `GET /reports`, which loads `ReportsModule` with `LazyModuleLoader`. At first the route also imported `ReportsService` dynamically. In a cleanup I switched the service to a static import and made `ReportsModule` log `ReportsModule loaded lazily` when Nest creates it.

<!-- TODO(Thierry): was switching to the static import a deliberate trade-off, or just simpler code? -->

## What I learned

- **Lazy loading defers the Nest module, not all of its code.** Since the switch to a static import, `reports.service.js` loads with the controller at startup; only `reports.module.js` waits for the first request. Loading the built controller is enough to see it:

  ```sh
  cd experiments/lazy-loading-modules && pnpm build
  node -e "require('./dist/app.controller'); console.log(Object.keys(require.cache).filter(k => k.includes('/reports/')))"
  ```

  The only file listed is `dist/reports/reports.service.js`.
- **Until the first request, the module isn't part of the app.** `app.get(ReportsService)` throws before the first `GET /reports` and works after it.
- **The module is created once.** Later requests call `load()` again but get the same module reference back, and `ReportsModule loaded lazily` appears only once in the log.

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
