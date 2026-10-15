# Configurable module

## Problem

A reusable module often needs options from the app that imports it, either as plain values or built asynchronously, for example from a config service. Nest's `ConfigurableModuleBuilder` generates the `register()` and `registerAsync()` code for this.

## Approach

- `src/env-variables-module/env-variables-module-definition.ts`: builds the module with `ConfigurableModuleBuilder` and exports the generated base class, the options token (`ENV_VARIABLES_MODULE_OPTIONS_TOKEN`) and the option types. It also declares an `env` extra (`'development' | 'production' | 'test'`, default `'development'`) with a transform that spreads the extras onto the module definition.
- `src/env-variables-module/env-variables.module.ts`: `EnvVariablesModule` extends the generated class and overrides `register()` and `registerAsync()`, with a `// custom logic` placeholder before calling `super`.
- `src/app.module.ts`: imports the module with `register()` and static values. A `registerAsync()` version is left in a comment.

## What I took away

- The builder generates both `register()` and `registerAsync()`, and both provide the options under the same token.
- The `env` extra never reaches the injected options. The transform puts it on the dynamic module definition, and `register()` removes it from the options it provides. Nothing in the code reads it from the definition.
- With `registerAsync()`, `env` reaches the options only if the factory returns it, as a plain option. The module definition still carries the default `'development'`.
- The options are typed as an index signature, `{ [index: string]: string | number }`, so any key is accepted. It started as `string` and was widened to fit numbers such as ports.

<!-- TODO(Thierry): what did you want `env` to control? Extras are usually read in the transform to change the module definition (for example `isGlobal` becoming `global: true`). -->

## How to run

From the repository root:

```sh
pnpm start:exp configurable-module
```

`curl localhost:3000` returns `Hello World!`. The app has no endpoint that shows the options, so the tests are where the behaviour is visible:

```sh
pnpm --filter experiment--configurable-module test
```
