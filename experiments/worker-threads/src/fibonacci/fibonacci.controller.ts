import { Controller, Get, Query } from '@nestjs/common';
import { join } from 'path';
import Picsina from 'piscina';

/**
 * Using piscina for poll of workers, i.e. we can have multiple workers running in parallel
 * First, query will be handled by one worker, second by another if the first is busy, etc.
 */

@Controller('fibonacci')
export class FibonacciController {
  fibonacciWorker = new Picsina({
    filename: join(__dirname, 'fibonacci.worker.js'),
  });
  @Get()
  fibonacci(@Query('n') n: number = 10) {
    return this.fibonacciWorker.run(n);
  }
}

/**
 * Bellow is for static worker
 */
// import { FibonacciWorkerHost } from './fibonacci-worker.host';

// @Controller('fibonacci')
// export class FibonacciController {
//   constructor(private readonly fibonacciWorkerHost: FibonacciWorkerHost) {}
//   @Get()
//   fibonacci(@Query('n') n: number = 10) {
//     return this.fibonacciWorkerHost.run(n);
//   }
// }
