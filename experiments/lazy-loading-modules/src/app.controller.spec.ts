import { INestApplication } from '@nestjs/common';
import { LazyModuleLoader } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './app.module';
import { ReportsService } from './reports/reports.service';

describe('AppController lazy loading ReportsModule', () => {
  let app: INestApplication<App>;
  let log: jest.SpyInstance;

  // ReportsModule's constructor logs this line each time Nest instantiates it.
  const timesReportsModuleLoaded = () =>
    log.mock.calls.filter(
      ([message]) => message === 'ReportsModule loaded lazily',
    ).length;

  beforeEach(async () => {
    log = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    log.mockRestore();
    await app.close();
  });

  it('does not load ReportsModule at startup', () => {
    expect(timesReportsModuleLoaded()).toBe(0);
    expect(() => app.get(ReportsService)).toThrow();
  });

  it('loads ReportsModule on the first GET /reports', async () => {
    await request(app.getHttpServer())
      .get('/reports')
      .expect(200)
      .expect('This action returns all reports');

    expect(timesReportsModuleLoaded()).toBe(1);
    expect(app.get(ReportsService)).toBeInstanceOf(ReportsService);
  });

  it('reuses the loaded module on the second GET /reports', async () => {
    const load = jest.spyOn(app.get(LazyModuleLoader), 'load');

    await request(app.getHttpServer()).get('/reports').expect(200);
    await request(app.getHttpServer()).get('/reports').expect(200);

    expect(timesReportsModuleLoaded()).toBe(1);
    const [firstRef, secondRef] = await Promise.all(
      load.mock.results.map(({ value }) => value as Promise<unknown>),
    );
    expect(load).toHaveBeenCalledTimes(2);
    expect(secondRef).toBe(firstRef);
  });
});
