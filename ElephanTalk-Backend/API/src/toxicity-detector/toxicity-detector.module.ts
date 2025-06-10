import { Module } from '@nestjs/common';
import { ToxicityDetectorService } from './services/toxicity-detector.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ToxicityDetectorService],
  exports: [ToxicityDetectorService],
})
export class ToxicityDetectorModule {}
