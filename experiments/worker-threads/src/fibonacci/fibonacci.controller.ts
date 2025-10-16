import { Controller, Get, Query } from '@nestjs/common';
import { FibonacciWorkerHost } from './fibonacci-worker.host';

@Controller('fibonacci')
export class FibonacciController {
  constructor(private readonly fibonacciWorkerHost: FibonacciWorkerHost) {}
  @Get()
  fibonacci(@Query('n') n: number = 10) {
    return this.fibonacciWorkerHost.run(n);
  }
}
