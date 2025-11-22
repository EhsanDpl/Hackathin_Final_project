/**
 * Module for invitation and profile creation
 */

import { Module } from '@nestjs/common';
import { InvitationController } from './invitation.controller';
import { InvitationService } from '../services/invitation.service';
import { RedisService } from '../services/redis.service';
import { MailerSendService } from '../services/mailersend.service';
import { MockServerModule } from '../mock-server/mock-server.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MockServerModule, AuthModule],
  controllers: [InvitationController],
  providers: [
    InvitationService,
    RedisService,
    MailerSendService,
  ],
})
export class InvitationModule {}

