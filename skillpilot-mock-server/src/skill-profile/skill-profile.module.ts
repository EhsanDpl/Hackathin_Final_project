import { Module } from '@nestjs/common';
import { SkillProfileController } from './skill-profile.controller';
import { SkillProfileService } from './skill-profile.service';

@Module({
  controllers: [SkillProfileController],
  providers: [SkillProfileService],
  exports: [SkillProfileService],
})
export class SkillProfileModule {}

