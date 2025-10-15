import { Inject, Module } from '@nestjs/common';
import {
  ConfigurableModuleClass,
  ENV_VARIABLES_MODULE_OPTIONS_TOKEN,
} from './env-varaibles-module-definition';

@Module({})
export class EnvVariablesModule extends ConfigurableModuleClass {
  constructor(@Inject(ENV_VARIABLES_MODULE_OPTIONS_TOKEN) private options) {
    super();
    console.log(this.options);
  }
}
