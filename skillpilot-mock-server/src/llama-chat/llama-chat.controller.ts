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
  ForbiddenException,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LlamaChatService } from './llama-chat.service';
import { ChatMessageDto } from './dtos/chat-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MockServerService } from '../mock-server/mock-server.service';

@Controller('api/v1/llama-chat')
export class LlamaChatController {
  constructor(
    private readonly llamaChatService: LlamaChatService,
    private readonly mockServerService: MockServerService,
  ) {}

  /**
   * Chat endpoint - Process a chat message using Llama 3.3 70B model with learner context
   * @param chatMessageDto - DTO containing the user's message and optional chat history
   * @param req - Request object containing authenticated user info
   * @returns Chat response from Llama model with personalized learning recommendations
   */
  @UseGuards(JwtAuthGuard)
  @Post('chat')
  @HttpCode(200)
  async chat(@Body() chatMessageDto: ChatMessageDto, @Request() req: any) {
    // Check if user is a learner
    if (req.user.role !== 'learner') {
      throw new ForbiddenException('Chatbot is only available for learners');
    }

    try {
      // Get learner context
      const email = req.user.email;
      const learner = await this.mockServerService.getLearnerByEmail(email);
      
      if (!learner) {
        throw new Error('Learner not found');
      }

      // Get learner's skills, learning paths, and assessments
      const skills = await this.mockServerService.getSkillAssessments(learner.id);
      const learningPaths = await this.mockServerService.getLearningPaths(learner.id);
      const dailyMissions = await this.mockServerService.getDailyMissions(learner.id);

      // Build learner context
      const learnerContext = {
        name: learner.name,
        email: learner.email,
        role: learner.role,
        department: learner.department,
        location: learner.location,
        currentLevel: learner.currentLevel,
        yearsExperience: learner.yearsExperience,
        skills: skills.map((s: any) => ({
          skill: s.skill,
          currentLevel: s.currentLevel,
          targetLevel: s.targetLevel,
          proficiency: s.proficiency,
        })),
        learningPaths: learningPaths.map((lp: any) => ({
          title: lp.title,
          progress: lp.progress,
          status: lp.status,
        })),
        activeMissions: dailyMissions.filter((m: any) => !m.completed).length,
      };

      return await this.llamaChatService.chat(chatMessageDto, learnerContext);
    } catch (error: any) {
      // If context fetch fails, still allow chat without context
      return await this.llamaChatService.chat(chatMessageDto);
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

