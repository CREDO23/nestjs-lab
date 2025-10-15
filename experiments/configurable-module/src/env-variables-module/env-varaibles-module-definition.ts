import { ConfigurableModuleBuilder } from '@nestjs/common';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: ENV_VARIABLES_MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE: ENV_VARIABLES_MODULE_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: ENV_VARIABLES_MODULE_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<{
  [index: string]: string | number;
}>()
  .setExtras<{
    env?: 'development' | 'production' | 'test';
  }>(
    {
      env: 'development',
    },
    (definition, extracts) => {
      return {
        ...definition,
        ...extracts,
      };
    },
  )
  .build();
