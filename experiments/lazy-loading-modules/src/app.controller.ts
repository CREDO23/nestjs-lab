import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { LazyModuleLoader } from '@nestjs/core';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private lazyModuleLoader: LazyModuleLoader,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('reports')
  async getReports(): Promise<string> {
    const reportModuleRef = await this.lazyModuleLoader.load(() =>
      import('./reports/reports.module').then((mod) => mod.ReportsModule),
    );

    const { ReportsService } = await import('./reports/reports.service');

    const reportService = reportModuleRef.get(ReportsService);
    return reportService.getReports();
  }
}
