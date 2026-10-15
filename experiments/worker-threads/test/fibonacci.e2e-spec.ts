import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import type { AppModule as SourceAppModule } from '../src/app.module';
import type { FibonacciController as SourceFibonacciController } from '../src/fibonacci/fibonacci.controller';

// piscina loads fibonacci.worker.js in a worker thread, outside jest's
// TypeScript transform, so this test runs the compiled app from dist/
// (test:e2e builds it first).
/* eslint-disable @typescript-eslint/no-require-imports */
const { AppModule } = require('../dist/app.module') as {
  AppModule: typeof SourceAppModule;
};
const { FibonacciController } =
  require('../dist/fibonacci/fibonacci.controller') as {
    FibonacciController: typeof SourceFibonacciController;
  };
/* eslint-enable @typescript-eslint/no-require-imports */

describe('GET /fibonacci (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    // app.close() does not stop the pool's threads, and they keep jest running.
    await app.get(FibonacciController).fibonacciWorker.destroy();
  });

  it('returns 55 for n=10, computed by the piscina pool', async () => {
    const pool = app.get(FibonacciController).fibonacciWorker;
    const completedBefore = pool.completed;

    await request(app.getHttpServer())
      .get('/fibonacci?n=10')
      .expect(200)
      .expect('55');

    expect(pool.completed).toBe(completedBefore + 1);
  });
});
