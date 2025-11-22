import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LearningPathService } from './learning-path.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('learning-path')
export class LearningPathController {
  constructor(private readonly learningPathService: LearningPathService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createLearningPath(@Request() req: any, @Body() body: any) {
    try {
      const email = req.user.email;
      const learnerId = await this.learningPathService.getLearnerIdByEmail(email);
      if (!learnerId) {
        throw new HttpException(
          'Learner not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.learningPathService.createLearningPath(
        learnerId,
        body.skillProfileId,
      );
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to create learning path',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getLearningPath(@Request() req: any) {
    try {
      const email = req.user.email;
      const learnerId = await this.learningPathService.getLearnerIdByEmail(email);
      if (!learnerId) {
        throw new HttpException(
          'Learner not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      const learningPath = await this.learningPathService.getLearningPath(learnerId);
      if (!learningPath) {
        throw new HttpException('Learning path not found', HttpStatus.NOT_FOUND);
      }
      return learningPath;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to get learning path',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async updateLearningPath(@Request() req: any, @Body() body: any) {
    try {
      const email = req.user.email;
      const learnerId = await this.learningPathService.getLearnerIdByEmail(email);
      if (!learnerId) {
        throw new HttpException(
          'Learner not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.learningPathService.updateLearningPath(learnerId, body);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to update learning path',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

