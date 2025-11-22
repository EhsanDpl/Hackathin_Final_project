import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LangchainChatModule } from './langchain-chat/langchain-chat.module';
import { MockServerModule } from './mock-server/mock-server.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LangchainChatModule,
    MockServerModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

