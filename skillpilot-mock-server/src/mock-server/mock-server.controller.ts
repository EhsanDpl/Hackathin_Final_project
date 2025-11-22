import { Controller, Get, Query, Param, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { MockServerService } from './mock-server.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class MockServerController {
  constructor(private readonly mockServerService: MockServerService) {}

  @Get('healthcheck')
  async healthcheck() {
    return this.mockServerService.healthcheck();
  }

  @UseGuards(JwtAuthGuard)
  @Get('learners')
  async getLearners() {
    try {
      return await this.mockServerService.getLearners();
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('learners/:id')
  async getLearnerById(@Param('id') id: string) {
    try {
      return await this.mockServerService.getLearnerById(parseInt(id));
    } catch (error) {
      if (error.message === 'Learner not found') {
        throw new HttpException('Learner not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('githubProfiles')
  async getGitHubProfiles(@Query('learnerId') learnerId?: string) {
    try {
      return await this.mockServerService.getGitHubProfiles(
        learnerId ? parseInt(learnerId) : undefined,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('linkedinProfiles')
  async getLinkedInProfiles(@Query('learnerId') learnerId?: string) {
    try {
      return await this.mockServerService.getLinkedInProfiles(
        learnerId ? parseInt(learnerId) : undefined,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('skillAssessments')
  async getSkillAssessments(@Query('learnerId') learnerId?: string) {
    try {
      return await this.mockServerService.getSkillAssessments(
        learnerId ? parseInt(learnerId) : undefined,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('learningPaths')
  async getLearningPaths(@Query('learnerId') learnerId?: string) {
    try {
      return await this.mockServerService.getLearningPaths(
        learnerId ? parseInt(learnerId) : undefined,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('dailyMissions')
  async getDailyMissions(@Query('learnerId') learnerId?: string) {
    try {
      return await this.mockServerService.getDailyMissions(
        learnerId ? parseInt(learnerId) : undefined,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('teamsCalendar')
  async getTeamsCalendar(@Query('learnerId') learnerId?: string) {
    try {
      return await this.mockServerService.getTeamsCalendar(
        learnerId ? parseInt(learnerId) : undefined,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('jiraData')
  async getJiraData(@Query('learnerId') learnerId?: string) {
    try {
      return await this.mockServerService.getJiraData(
        learnerId ? parseInt(learnerId) : undefined,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('skillTaxonomy')
  async getSkillTaxonomy() {
    try {
      return await this.mockServerService.getSkillTaxonomy();
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('courses')
  async getCourses() {
    try {
      return await this.mockServerService.getCourses();
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

