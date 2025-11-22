import { Module } from '@nestjs/common';
import { MockServerController } from './mock-server.controller';
import { MockServerService } from './mock-server.service';
import { RedisService } from '../services/redis.service';
import { MailerSendService } from '../services/mailersend.service';
import { InvitationService } from '../services/invitation.service';
import { SkillSuggestionService } from '../services/skill-suggestion.service';

@Module({
  controllers: [MockServerController],
  providers: [
    MockServerService,
    RedisService,
    MailerSendService,
    InvitationService,
    SkillSuggestionService,
  ],
  exports: [MockServerService],
})
export class MockServerModule {}

