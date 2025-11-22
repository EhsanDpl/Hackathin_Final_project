import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LangchainChatModule } from './langchain-chat/langchain-chat.module';
import { MockServerModule } from './mock-server/mock-server.module';
import { AuthModule } from './auth/auth.module';
import { LlamaChatModule } from './llama-chat/llama-chat.module';
import { InvitationModule } from './invitation/invitation.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LangchainChatModule,
    MockServerModule,
    AuthModule,
    LlamaChatModule,
    InvitationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

