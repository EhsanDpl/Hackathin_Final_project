import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ContentGeneratorService } from './content-generator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('content-generator')
export class ContentGeneratorController {
  constructor(
    private readonly contentGeneratorService: ContentGeneratorService,
  ) {}

  @Get('skills-gap')
  @UseGuards(JwtAuthGuard)
  async getSkillsGap(@Request() req: any) {
    try {
      const email = req.user.email;
      const learnerId =
        await this.contentGeneratorService.getLearnerIdByEmail(email);
      if (!learnerId) {
        throw new HttpException(
          'Learner not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      const skillsGap = await this.contentGeneratorService.getSkillsGap(
        learnerId,
      );
      return skillsGap || { gap: null, description: null };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to get skills gap',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('suggestions')
  @UseGuards(JwtAuthGuard)
  async getSuggestions(@Request() req: any) {
    try {
      const email = req.user.email;
      const learnerId =
        await this.contentGeneratorService.getLearnerIdByEmail(email);
      if (!learnerId) {
        throw new HttpException(
          'Learner not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.contentGeneratorService.getSmartSuggestions(learnerId);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to get suggestions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateContent(@Request() req: any, @Body() body: any) {
    try {
      const email = req.user.email;
      const learnerId =
        await this.contentGeneratorService.getLearnerIdByEmail(email);
      if (!learnerId) {
        throw new HttpException(
          'Learner not found',
          HttpStatus.BAD_REQUEST,
        );
      }

      const { contentType, topic, difficulty, duration } = body;

      if (!contentType || !topic) {
        throw new HttpException(
          'Content type and topic are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.contentGeneratorService.generateContent(
        learnerId,
        contentType,
        topic,
        difficulty || 'Intermediate',
        duration || '15 minutes',
      );
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to generate content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('content/:id')
  @UseGuards(JwtAuthGuard)
  async getContent(@Request() req: any, @Param('id') id: string) {
    try {
      const email = req.user.email;
      const learnerId =
        await this.contentGeneratorService.getLearnerIdByEmail(email);
      if (!learnerId) {
        throw new HttpException(
          'Learner not found',
          HttpStatus.BAD_REQUEST,
        );
      }

      const content = await this.contentGeneratorService.getContentById(
        parseInt(id, 10),
        learnerId,
      );

      if (!content) {
        throw new HttpException('Content not found', HttpStatus.NOT_FOUND);
      }

      return content;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to get content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('save-result')
  @UseGuards(JwtAuthGuard)
  async saveResult(@Request() req: any, @Body() body: any) {
    try {
      const email = req.user.email;
      const learnerId =
        await this.contentGeneratorService.getLearnerIdByEmail(email);
      if (!learnerId) {
        throw new HttpException(
          'Learner not found',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.contentGeneratorService.saveResult(learnerId, body);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to save result',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('employee-quiz-status')
  @UseGuards(JwtAuthGuard)
  async getEmployeeQuizStatus(@Request() req: any) {
    try {
      // Check if user is admin/manager
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        throw new HttpException(
          'Unauthorized - Admin access required',
          HttpStatus.FORBIDDEN,
        );
      }

      return await this.contentGeneratorService.getEmployeeQuizStatus();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to get employee quiz status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

