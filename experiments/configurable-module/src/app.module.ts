import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvVariablesModule } from './env-variables-module/env-variables.module';

@Module({
  imports: [
    EnvVariablesModule.register({
      path: './env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
