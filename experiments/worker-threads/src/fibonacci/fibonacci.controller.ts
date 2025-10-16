import { Controller, Get, Query } from '@nestjs/common';

@Controller('fibonacci')
export class FibonacciController {
  @Get()
  fibonacci(@Query('n') n: number = 10): number {
    if (n < 2) {
      return n;
    }

    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}
