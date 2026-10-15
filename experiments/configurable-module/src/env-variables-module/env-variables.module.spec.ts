import { Test } from '@nestjs/testing';
import { EnvVariablesModule } from './env-variables.module';
import { ENV_VARIABLES_MODULE_OPTIONS_TOKEN } from './env-variables-module-definition';

const options = {
  port: 5000,
  host: 'localhost',
  dbHost: 'localhost',
  dbPort: 5432,
};

async function injectedOptions(
  dynamicModule: ReturnType<typeof EnvVariablesModule.register>,
): Promise<unknown> {
  const moduleRef = await Test.createTestingModule({
    imports: [dynamicModule],
  }).compile();
  return moduleRef.get(ENV_VARIABLES_MODULE_OPTIONS_TOKEN);
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
    it('defaults to "development" on the module definition', () => {
      expect(EnvVariablesModule.register(options)).toHaveProperty(
        'env',
        'development',
      );
    });

    it('is set on the module definition when passed to register()', () => {
      const dynamicModule = EnvVariablesModule.register({
        ...options,
        env: 'production',
      });

      expect(dynamicModule).toHaveProperty('env', 'production');
    });

    it('is removed from the options that register() injects', async () => {
      const dynamicModule = EnvVariablesModule.register({
        ...options,
        env: 'production',
      });

      expect(await injectedOptions(dynamicModule)).not.toHaveProperty('env');
    });

    it('is injected as a plain option when a registerAsync() factory returns it, while the module definition keeps the default', async () => {
      const dynamicModule = EnvVariablesModule.registerAsync({
        useFactory: () => ({ ...options, env: 'test' }),
      });

      expect(await injectedOptions(dynamicModule)).toHaveProperty(
        'env',
        'test',
      );
      expect(dynamicModule).toHaveProperty('env', 'development');
    });
  });
});
