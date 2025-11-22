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
   * Process a chat message using Llama 3.3 70B Versatile model with learner context
   * @param chatMessageDto - DTO containing the user's message and optional chat history
   * @param learnerContext - Optional learner context (profile, skills, learning paths)
   * @returns Response from the Llama model with personalized learning recommendations
   */
  async chat(chatMessageDto: ChatMessageDto, learnerContext?: any) {
    try {
      if (!this.groq) {
        throw new HttpException(
          'AI service not configured. Please set GROQ_API_KEY environment variable.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const { message, history = [] } = chatMessageDto;

      // Build system prompt with learner context
      let systemPrompt = 'You are an AI career coach and learning advisor for SkillPilot. Your role is to help users solve problems and provide personalized learning recommendations based on their profile, skills, and career goals.';
      
      if (learnerContext) {
        systemPrompt += `\n\nUser Context:
- Name: ${learnerContext.name}
- Role: ${learnerContext.role || 'Not specified'}
- Department: ${learnerContext.department || 'Not specified'}
- Current Level: ${learnerContext.currentLevel || 'Not specified'}
- Years of Experience: ${learnerContext.yearsExperience || 'Not specified'}
- Location: ${learnerContext.location || 'Not specified'}`;

        if (learnerContext.skills && learnerContext.skills.length > 0) {
          systemPrompt += `\n\nCurrent Skills:`;
          learnerContext.skills.forEach((skill: any) => {
            systemPrompt += `\n- ${skill.skill}: ${skill.currentLevel || 'Not assessed'} (Proficiency: ${skill.proficiency || 0}%)`;
            if (skill.targetLevel) {
              systemPrompt += ` → Target: ${skill.targetLevel}`;
            }
          });
        }

        if (learnerContext.learningPaths && learnerContext.learningPaths.length > 0) {
          systemPrompt += `\n\nActive Learning Paths:`;
          learnerContext.learningPaths.forEach((path: any) => {
            systemPrompt += `\n- ${path.title}: ${path.progress || 0}% complete (Status: ${path.status || 'active'})`;
          });
        }

        if (learnerContext.activeMissions > 0) {
          systemPrompt += `\n\nActive Daily Missions: ${learnerContext.activeMissions}`;
        }

        systemPrompt += `\n\nBased on this context, provide personalized learning recommendations, skill development advice, and solutions to help the user achieve their career goals. Focus on practical, actionable advice tailored to their current level and role.`;
      } else {
        systemPrompt += ' Provide helpful learning recommendations and career advice.';
      }

      // Format messages for Groq API
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        {
          role: 'system',
          content: systemPrompt,
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
      this.logger.log(`📝 AI Response: ${response.substring(0, 200)}...`);

      return customMessage(HttpStatus.OK, MESSAGES.SUCCESS, {
        response,
        model: this.model,
        hasContext: !!learnerContext,
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

