import { Controller, Get, OnModuleDestroy, Query } from '@nestjs/common';
import { join } from 'path';
import Picsina from 'piscina';

/**
 * Using piscina for poll of workers, i.e. we can have multiple workers running in parallel
 * First, query will be handled by one worker, second by another if the first is busy, etc.
 */

@Controller('fibonacci')
export class FibonacciController implements OnModuleDestroy {
  fibonacciWorker = new Picsina({
    filename: join(__dirname, 'fibonacci.worker.js'),
  });
  @Get()
  fibonacci(@Query('n') n: number = 10) {
    return this.fibonacciWorker.run(n);
  }

  // The pool's threads keep the process alive until it is destroyed.
  async onModuleDestroy() {
    await this.fibonacciWorker.destroy();
  }
}

/**
 * Bellow is for static worker
 * (to use it, also add FibonacciWorkerHost to FibonacciModule's providers)
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
