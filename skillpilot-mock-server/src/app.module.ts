import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LangchainChatModule } from './langchain-chat/langchain-chat.module';
import { MockServerModule } from './mock-server/mock-server.module';
import { AuthModule } from './auth/auth.module';
import { LlamaChatModule } from './llama-chat/llama-chat.module';
import { InvitationModule } from './invitation/invitation.module';
import { SkillProfileModule } from './skill-profile/skill-profile.module';
import { LearningPathModule } from './learning-path/learning-path.module';
import { ContentGeneratorModule } from './content-generator/content-generator.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LangchainChatModule,
    MockServerModule,
    AuthModule,
    LlamaChatModule,
    InvitationModule,
    SkillProfileModule,
    LearningPathModule,
    ContentGeneratorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

