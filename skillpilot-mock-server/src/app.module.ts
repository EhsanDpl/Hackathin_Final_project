import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LangchainChatModule } from './langchain-chat/langchain-chat.module';
import { MockServerModule } from './mock-server/mock-server.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LangchainChatModule,
    MockServerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

