/**
 * Controller for Llama Chat operations.
 * 
 * Handles HTTP requests for chat interactions using the Llama 3.3 70B Versatile model.
 * This is a separate service from the Langchain chat service.
 * 
 * @class LlamaChatController
 */

import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
} from '@nestjs/common';
import { LlamaChatService } from './llama-chat.service';
import { ChatMessageDto } from './dtos/chat-message.dto';

@Controller('api/v1/llama-chat')
export class LlamaChatController {
  constructor(private readonly llamaChatService: LlamaChatService) {}

  /**
   * Chat endpoint - Process a chat message using Llama 3.3 70B model
   * @param chatMessageDto - DTO containing the user's message and optional chat history
   * @returns Chat response from Llama model
   */
  @Post('chat')
  @HttpCode(200)
  async chat(@Body() chatMessageDto: ChatMessageDto) {
    return await this.llamaChatService.chat(chatMessageDto);
  }

  /**
   * Health check endpoint - Check if Llama chat service is configured
   * @returns Service health status
   */
  @Get('health')
  async healthCheck() {
    return await this.llamaChatService.healthCheck();
  }
}

