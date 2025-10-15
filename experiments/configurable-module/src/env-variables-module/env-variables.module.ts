import { Inject, Module } from '@nestjs/common';
import {
  ConfigurableModuleClass,
  ENV_VARIABLES_MODULE_ASYNC_OPTIONS_TYPE,
  ENV_VARIABLES_MODULE_OPTIONS_TYPE,
  ENV_VARIABLES_MODULE_OPTIONS_TOKEN,
} from './env-varaibles-module-definition';

@Module({})
export class EnvVariablesModule extends ConfigurableModuleClass {
  constructor(@Inject(ENV_VARIABLES_MODULE_OPTIONS_TOKEN) private options) {
    super();
  }

  static register(options: typeof ENV_VARIABLES_MODULE_OPTIONS_TYPE) {
    // custom logic
    return super.register(options);
  }

  static registerAsync(
    options: typeof ENV_VARIABLES_MODULE_ASYNC_OPTIONS_TYPE,
  ) {
    // custom logic
    return super.registerAsync(options);
  }
}
