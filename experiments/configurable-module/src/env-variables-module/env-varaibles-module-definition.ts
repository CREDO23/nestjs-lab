import { ConfigurableModuleBuilder } from '@nestjs/common';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: ENV_VARIABLES_MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<{
  [index: string]: string;
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
