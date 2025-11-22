/**
 * Service for handling Llama Chat operations using Groq API.
 * 
 * This service provides chat functionality using the Llama 3.3 70B Versatile model
 * through Groq's API. It's a separate service from the Langchain chat service.
 * 
 * @class LlamaChatService
 */

import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ChatMessageDto } from './dtos/chat-message.dto';
import customMessage from 'src/utils/responses/customMessage.response';
import { MESSAGES } from 'src/utils/constants/messages.constants';
import Groq from 'groq-sdk';

@Injectable()
export class LlamaChatService {
  private readonly logger = new Logger(LlamaChatService.name);
  private groq: Groq | null = null;
  private readonly model = 'llama-3.3-70b-versatile';

  constructor() {
    // Initialize Groq client if API key is available
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groq = new Groq({
        apiKey: apiKey,
      });
      this.logger.log('✅ Groq client initialized with Llama 3.3 70B model');
    } else {
      this.logger.warn('⚠️  GROQ_API_KEY not found. Llama chat service will not be available.');
    }
  }

  /**
   * Process a chat message using Llama 3.3 70B Versatile model
   * @param chatMessageDto - DTO containing the user's message and optional chat history
   * @returns Response from the Llama model
   */
  async chat(chatMessageDto: ChatMessageDto) {
    try {
      if (!this.groq) {
        throw new HttpException(
          'AI service not configured. Please set GROQ_API_KEY environment variable.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const { message, history = [] } = chatMessageDto;

      // Format messages for Groq API
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide clear, concise, and helpful responses.',
        },
        ...history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: message,
        },
      ];

      const completion = await this.groq.chat.completions.create({
        messages: messages as any,
        model: this.model,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const response = completion.choices[0]?.message?.content || 'No response generated';

      this.logger.log(`✅ Chat response generated for message: ${message.substring(0, 50)}...`);

      return customMessage(HttpStatus.OK, MESSAGES.SUCCESS, {
        response,
        model: this.model,
      });
    } catch (error: any) {
      this.logger.error('Error in Llama chat:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to process chat message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Process a career coach chat message using Llama 3.3 70B Versatile model
   * @param chatMessageDto - DTO containing the user's message and optional chat history
   * @returns Response from the Llama model with career coaching focus
   */
  async careerCoach(chatMessageDto: ChatMessageDto) {
    try {
      if (!this.groq) {
        throw new HttpException(
          'AI service not configured. Please set GROQ_API_KEY environment variable.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const { message, history = [] } = chatMessageDto;

      // Format messages for Groq API with career coach system prompt
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        {
          role: 'system',
          content: `You are an AI Career Coach for SkillPilot AI, an intelligent learning platform. Your role is to help learners with:
- Technical questions about their learning modules and courses
- Guidance on their personalized learning path
- Career advice and skill recommendations
- Understanding complex technical concepts
- Planning their professional development journey

Provide clear, practical, and encouraging responses. Be supportive and help learners understand how to apply their learning to real-world scenarios. When discussing technical topics, explain concepts clearly and provide examples when helpful.`,
        },
        ...history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: message,
        },
      ];

      const completion = await this.groq.chat.completions.create({
        messages: messages as any,
        model: this.model,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const response = completion.choices[0]?.message?.content || 'No response generated';

      this.logger.log(`✅ Career coach response generated for message: ${message.substring(0, 50)}...`);

      return customMessage(HttpStatus.OK, MESSAGES.SUCCESS, {
        response,
        model: this.model,
      });
    } catch (error: any) {
      this.logger.error('Error in Career Coach chat:', error);
      
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
   * Check if the Llama chat service is configured and available
   * @returns Service health status
   */
  async healthCheck() {
    const isConfigured = !!this.groq;
    
    return {
      status: isConfigured ? 'OK' : 'NOT_CONFIGURED',
      service: 'Llama Chat Service',
      model: this.model,
      configured: isConfigured,
      message: isConfigured 
        ? 'Llama chat service is ready' 
        : 'GROQ_API_KEY environment variable is not set',
    };
  }
}

