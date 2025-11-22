/**
 * Module for Llama Chat functionality.
 * 
 * This module provides chat services using the Llama 3.3 70B Versatile model
 * through Groq API. It's separate from the Langchain chat module.
 */

import { Module } from '@nestjs/common';
import { LlamaChatController } from './llama-chat.controller';
import { LlamaChatService } from './llama-chat.service';

@Module({
  controllers: [LlamaChatController],
  providers: [LlamaChatService],
  exports: [LlamaChatService],
})
export class LlamaChatModule {}

