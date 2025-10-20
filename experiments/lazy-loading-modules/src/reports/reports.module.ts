import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Module({
  providers: [ReportsService],
})
export class ReportsModule {
  constructor() {
    console.log('ReportsModule loaded lazily');
  }
}
