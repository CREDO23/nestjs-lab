import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvVariablesModule } from './env-variables-module/env-variables.module';

@Module({
  imports: [
    EnvVariablesModule.register({
      port: 5000,
      host: 'localhost',
      dbHost: 'localhost',
      dbPort: 5432,
      env: 'development',
    }),
    // or EnvVariablesModule.registerAsync({
    //   useFactory: () => ({
    //     port: 5000,
    //     host: 'localhost',
    //     dbHost: 'localhost',
    //     dbPort: 5432,
    //     env: 'test',
    //   }),
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
