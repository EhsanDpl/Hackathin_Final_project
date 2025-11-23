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
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LlamaChatService } from './llama-chat.service';
import { ChatMessageDto } from './dtos/chat-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
   * Career Coach chat endpoint - Process a chat message with career-focused context
   * Uses learner context and rule engine to provide personalized, context-bound responses
   * @param chatMessageDto - DTO containing the user's message and optional chat history
   * @param req - Request object containing authenticated user information
   * @returns Chat response from Llama model with career coaching focus
   */
  @Post('career-coach')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async careerCoach(@Request() req: any, @Body() chatMessageDto: ChatMessageDto) {
    try {
      const email = req.user.email;
      const learnerId = await this.llamaChatService.getLearnerIdByEmail(email);
      if (!learnerId) {
        throw new HttpException(
          'Learner not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.llamaChatService.careerCoach(learnerId, chatMessageDto);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to process career coach message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

