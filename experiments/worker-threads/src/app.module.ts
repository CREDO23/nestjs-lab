import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingModule } from '@experiments/shared';
import { FibonacciController } from './fibonacci/fibonacci.controller';
import { FibonacciModule } from './fibonacci/fibonacci.module';

@Module({
  imports: [LoggingModule, FibonacciModule],
  controllers: [AppController, FibonacciController],
  providers: [AppService],
})
export class AppModule {}
