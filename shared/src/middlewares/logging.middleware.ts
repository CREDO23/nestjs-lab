import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LogginMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    console.time(`Request time`);

    res.on('finish', () => {
      console.log(`${req.method} ${req.url} ${res.statusCode}`);
      console.timeEnd(`Request time`);
    });

    next();
  }
}