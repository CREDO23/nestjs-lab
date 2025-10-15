import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingModule } from '@experiments/shared';
import { FibonacciController } from './fibonacci.controller';

@Module({
  imports: [LoggingModule],
  controllers: [AppController, FibonacciController],
  providers: [AppService],
})
export class AppModule {}
