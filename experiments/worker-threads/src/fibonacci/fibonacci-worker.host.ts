import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { join } from 'path';
import { filter, firstValueFrom, fromEvent, map, Observable } from 'rxjs';
import { Worker } from 'worker_threads';

@Injectable()
export class FibonacciWorkerHost
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private worker: Worker;
  private message: Observable<{ id: number; result: number }>;
  onApplicationBootstrap() {
    this.worker = new Worker(join(__dirname, 'fibonacci.worker.ts'));
    this.message = fromEvent(this.worker, 'message') as Observable<{
      id: number;
      result: number;
    }>;
  }
  async onApplicationShutdown() {
    await this.worker.terminate();
  }

  run(n: number) {
    const uniqueId = Date.now();
    this.worker.postMessage({ n, uniqueId });
    return firstValueFrom(
      this.message.pipe(
        filter(({ id }) => id === uniqueId),
        map(({ result }) => result),
      ),
    );
  }
}
