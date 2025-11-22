import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SkillProfileService } from './skill-profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('skill-profile')
export class SkillProfileController {
  constructor(private readonly skillProfileService: SkillProfileService) {}

  @Post('draft')
  @UseGuards(JwtAuthGuard)
  async saveDraft(@Request() req: any, @Body() body: any) {
    try {
      const email = req.user.email;
      const learnerId = await this.skillProfileService.getLearnerIdByEmail(email);
      if (!learnerId) {
        throw new HttpException(
          'Learner not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.skillProfileService.saveDraft(learnerId, body);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to save draft',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateProfile(@Request() req: any, @Body() body: any) {
    try {
      const email = req.user.email;
      const learnerId = await this.skillProfileService.getLearnerIdByEmail(email);
      if (!learnerId) {
        throw new HttpException(
          'Learner not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.skillProfileService.generateProfile(learnerId);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to generate profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    try {
      const email = req.user.email;
      const learnerId = await this.skillProfileService.getLearnerIdByEmail(email);
      if (!learnerId) {
        throw new HttpException(
          'Learner not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      const profile = await this.skillProfileService.getProfile(learnerId);
      if (!profile) {
        throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
      }
      return profile;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to get profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

