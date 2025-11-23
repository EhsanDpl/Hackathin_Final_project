import { Module } from '@nestjs/common';
import { ContentGeneratorController } from './content-generator.controller';
import { ContentGeneratorService } from './content-generator.service';
import { LearningPathModule } from '../learning-path/learning-path.module';

@Module({
  imports: [LearningPathModule],
  controllers: [ContentGeneratorController],
  providers: [ContentGeneratorService],
  exports: [ContentGeneratorService],
})
export class ContentGeneratorModule {}

