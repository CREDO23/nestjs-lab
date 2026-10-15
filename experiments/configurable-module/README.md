# Configurable module

## Problem

A reusable module often needs options from the app that imports it, either as plain values or built asynchronously, for example from a config service. Nest's `ConfigurableModuleBuilder` generates the `register()` and `registerAsync()` code for this.

## Approach

- [`src/env-variables-module/env-variables-module-definition.ts`](src/env-variables-module/env-variables-module-definition.ts): builds the module with `ConfigurableModuleBuilder` and exports the generated base class, the options token (`ENV_VARIABLES_MODULE_OPTIONS_TOKEN`) and the option types. It also declares an `env` extra (`'development' | 'production' | 'test'`, default `'development'`) with a transform that adds `env` as its own exported provider, under `ENV_VARIABLES_MODULE_ENV_TOKEN`.
- [`src/env-variables-module/env-variables.module.ts`](src/env-variables-module/env-variables.module.ts): `EnvVariablesModule` extends the generated class and overrides `register()` and `registerAsync()`, with a `// custom logic` placeholder before calling `super`.
- [`src/app.module.ts`](src/app.module.ts): imports the module with `register()` and static values. A `registerAsync()` version is left in a comment.

## How it went

My first version had a single `path` option, the `env` extra, and a module constructor that logged the options it received. Then I switched to `port`, `host`, `dbHost` and `dbPort`, widened the option type from `string` to `string | number` so the ports could be numbers, removed the log, and added the `register()` and `registerAsync()` overrides.

## What I learned

- **`env` is not in the options object.** Injecting `ENV_VARIABLES_MODULE_OPTIONS_TOKEN` gives `{ port, host, dbHost, dbPort }`, without `env`: `register()` removes everything declared with `setExtras`. So the module provides `env` separately, under `ENV_VARIABLES_MODULE_ENV_TOKEN`.
- **With `registerAsync()`, `env` has to be passed next to `useFactory`.** `registerAsync({ useFactory, env: 'test' })` sets `env` to `'test'`. If the factory returns `env: 'test'` instead, it just ends up in the options object, and `env` stays `'development'`.
- **`register()` and `registerAsync()` come for free and share one token.** Both provide the options under `ENV_VARIABLES_MODULE_OPTIONS_TOKEN`.
- **The index-signature type accepts any key.** `{ [index: string]: string | number }` lets any option name through, misspelled ones included.

## How to run

From the repository root:

```sh
pnpm start:exp configurable-module
```

`curl localhost:3000` returns `Hello World!`. The app has no endpoint that shows the options, so the tests are where the behaviour is visible:

```sh
pnpm --filter experiment--configurable-module test
```
