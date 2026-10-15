import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { HttpExceptionFilter } from '@experiments/shared';
import { AppModule } from './../src/app.module';

describe('Circuit breaker on GET / (e2e)', () => {
  let app: INestApplication<App>;
  let log: jest.SpyInstance;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    // The handler logs "Couldn't getHello" each time it runs.
    log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    log.mockRestore();
    await app.close();
  });

  it('runs the handler only 3 times for 5 requests, and every request gets the error', async () => {
    for (let i = 0; i < 5; i++) {
      const response = await request(app.getHttpServer()).get('/').expect(400);
      expect(response.body).toMatchObject({ message: "Couldn't getHello" });
    }

    const handlerRuns = log.mock.calls.filter(
      ([message]) => message === "Couldn't getHello",
    );
    expect(handlerRuns).toHaveLength(3);
  });
});
