import { Module } from '@nestjs/common';
import { ContentGeneratorController } from './content-generator.controller';
import { ContentGeneratorService } from './content-generator.service';

@Module({
  controllers: [ContentGeneratorController],
  providers: [ContentGeneratorService],
  exports: [ContentGeneratorService],
})
export class ContentGeneratorModule {}

