# Configurable module

## The idea

A reusable Nest module often needs settings from the app that imports it. `ConfigurableModuleBuilder` generates `register()` and `registerAsync()` for passing them, and it has two kinds of settings:

- **options**, which the module's services receive as one options object;
- **extras**, declared with `setExtras`, which are meant to change how the module itself is set up.

## What I built

- [`src/env-variables-module/env-variables-module-definition.ts`](src/env-variables-module/env-variables-module-definition.ts): builds the module with `ConfigurableModuleBuilder`. The options are a port, a host and database settings. `env` (`development`, `production` or `test`, default `development`) is an extra, so the same module can be configured for each environment.
- [`src/env-variables-module/env-variables.module.ts`](src/env-variables-module/env-variables.module.ts): `EnvVariablesModule`, which extends the class the builder generates.
- [`src/app.module.ts`](src/app.module.ts): imports the module with `register({ … })`. A `registerAsync()` version is in a comment.

## What I learned

- An extra never reaches the options object: `register({ port: 5000, env: 'production' })` gives the services `{ port: 5000 }`. Nest passes `env` only to the function given to `setExtras`, so that function has to pass it on; here it registers `env` as its own provider, under `ENV_VARIABLES_MODULE_ENV_TOKEN`.
- With `registerAsync()`, `env` has to be passed next to `useFactory`: `registerAsync({ useFactory, env: 'test' })`. If the factory returns `env` instead, it just ends up in the options object, and `env` stays `development`.
- The options type, `{ [index: string]: string | number }`, accepts any key, so a misspelled option like `prot: 5000` still compiles.

The module's tests ([`env-variables.module.spec.ts`](src/env-variables-module/env-variables.module.spec.ts)) check the first two.

## How to run

From the repository root:

```sh
pnpm start:exp configurable-module
```

`curl localhost:3000` returns `Hello World!`. The app has no endpoint that shows the settings, so the tests are where the behaviour is visible:

```sh
pnpm --filter experiment--configurable-module test
```
