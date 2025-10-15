import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CircuitBreakerInterceptor } from './interceptors/circuit-breaker.interceptor';

@UseInterceptors(CircuitBreakerInterceptor)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    console.log("Couldn't getHello");
    throw new HttpException("Couldn't getHello", HttpStatus.BAD_REQUEST);
  }
}
