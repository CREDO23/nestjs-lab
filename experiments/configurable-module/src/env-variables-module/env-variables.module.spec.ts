import { DynamicModule } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EnvVariablesModule } from './env-variables.module';
import {
  ENV_VARIABLES_MODULE_ENV_TOKEN,
  ENV_VARIABLES_MODULE_OPTIONS_TOKEN,
} from './env-variables-module-definition';

const options = {
  port: 5000,
  host: 'localhost',
  dbHost: 'localhost',
  dbPort: 5432,
};

async function injectedOptions(dynamicModule: DynamicModule): Promise<unknown> {
  const moduleRef = await Test.createTestingModule({
    imports: [dynamicModule],
  }).compile();
  return moduleRef.get(ENV_VARIABLES_MODULE_OPTIONS_TOKEN);
}

// A provider in the importing module injects the env token, which only works
// if EnvVariablesModule exports it.
async function injectedEnv(dynamicModule: DynamicModule): Promise<unknown> {
  const moduleRef = await Test.createTestingModule({
    imports: [dynamicModule],
    providers: [
      {
        provide: 'ENV_CONSUMER',
        useFactory: (env: unknown) => env,
        inject: [ENV_VARIABLES_MODULE_ENV_TOKEN],
      },
    ],
  }).compile();
  return moduleRef.get('ENV_CONSUMER');
}

describe('EnvVariablesModule', () => {
  it('register() provides the options under ENV_VARIABLES_MODULE_OPTIONS_TOKEN', async () => {
    expect(await injectedOptions(EnvVariablesModule.register(options))).toEqual(
      options,
    );
  });

  it('registerAsync() provides the factory result under the same token', async () => {
    const dynamicModule = EnvVariablesModule.registerAsync({
      useFactory: () => options,
    });

    expect(await injectedOptions(dynamicModule)).toEqual(options);
  });

  describe('the env extra', () => {
    it('defaults to "development" and can be injected outside the module', async () => {
      expect(await injectedEnv(EnvVariablesModule.register(options))).toBe(
        'development',
      );
    });

    it('takes the value passed to register()', async () => {
      const dynamicModule = EnvVariablesModule.register({
        ...options,
        env: 'production',
      });

      expect(await injectedEnv(dynamicModule)).toBe('production');
    });

    it('is still removed from the options that register() injects', async () => {
      const dynamicModule = EnvVariablesModule.register({
        ...options,
        env: 'production',
      });

      expect(await injectedOptions(dynamicModule)).not.toHaveProperty('env');
    });

    it('is passed to registerAsync() next to useFactory', async () => {
      const dynamicModule = EnvVariablesModule.registerAsync({
        useFactory: () => options,
        env: 'test',
      });

      expect(await injectedEnv(dynamicModule)).toBe('test');
    });

    it('is only a plain option when a registerAsync() factory returns it', async () => {
      const dynamicModule = EnvVariablesModule.registerAsync({
        useFactory: () => ({ ...options, env: 'test' }),
      });

      expect(await injectedOptions(dynamicModule)).toHaveProperty(
        'env',
        'test',
      );
      expect(await injectedEnv(dynamicModule)).toBe('development');
    });
  });
});
