import { Controller, Get, Post, Put, Query, Param, Body, HttpException, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { MockServerService } from './mock-server.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SkillSuggestionService } from '../services/skill-suggestion.service';

@Controller()
export class MockServerController {
  constructor(
    private readonly mockServerService: MockServerService,
    private readonly skillSuggestionService: SkillSuggestionService,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @Post('employees')
  async createEmployee(@Request() req: any, @Body() employeeData: any) {
    try {
      const currentUserRole = req.user.role;
      const requestedRole = employeeData.role;

      // Validate role creation permissions
      if (requestedRole === 'admin') {
        // Only super_admin can create admin
        if (currentUserRole !== 'super_admin') {
          throw new HttpException(
            'Only Super Admin can create Admin accounts',
            HttpStatus.FORBIDDEN,
          );
        }
      } else if (requestedRole === 'mentor') {
        // super_admin and admin can create mentor
        if (currentUserRole !== 'super_admin' && currentUserRole !== 'admin') {
          throw new HttpException(
            'Only Super Admin and Admin can create Mentor accounts',
            HttpStatus.FORBIDDEN,
          );
        }
      } else if (requestedRole === 'learner') {
        // super_admin and admin can create learner
        if (currentUserRole !== 'super_admin' && currentUserRole !== 'admin') {
          throw new HttpException(
            'Only Super Admin and Admin can create Learner accounts',
            HttpStatus.FORBIDDEN,
          );
        }
      } else if (requestedRole === 'super_admin') {
        // Nobody can create super_admin through this endpoint
        throw new HttpException(
          'Cannot create Super Admin accounts through this endpoint',
          HttpStatus.FORBIDDEN,
        );
      }

      // Create employee record with password
      const employee = await this.mockServerService.createEmployee(employeeData);

      return {
        ...employee,
        message: 'Employee created successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get skill suggestions based on position
   * This endpoint is used when creating a learner employee
   */
  @UseGuards(JwtAuthGuard)
  @Get('suggest-skills')
  async suggestSkills(@Query('position') position: string, @Query('role') role?: string) {
    try {
      // Only suggest skills for learners
      if (role && role !== 'learner') {
        return {
          statusCode: HttpStatus.OK,
          message: 'Skill suggestions are only available for learners',
          data: {
            skills: [],
          },
        };
      }

      if (!position || position.trim().length === 0) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Position is required',
          data: {
            skills: [],
          },
        };
      }

      const skills = await this.skillSuggestionService.suggestSkills(position);

      return {
        statusCode: HttpStatus.OK,
        message: 'Skill suggestions retrieved successfully',
        data: {
          skills,
          position,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get skill suggestions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get current user's profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    try {
      const email = req.user.email;
      const profile = await this.mockServerService.getLearnerByEmail(email);
      
      if (!profile) {
        throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
      }

      return profile;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all mentors
   */
  @UseGuards(JwtAuthGuard)
  @Get('mentors')
  async getMentors() {
    try {
      const mentors = await this.mockServerService.getMentors();
      return mentors;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update current user's profile and connect integrations
   */
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req: any, @Body() profileData: any) {
    try {
      const email = req.user.email;
      const updatedProfile = await this.mockServerService.updateProfile(email, profileData);
      
      return {
        ...updatedProfile,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all mock LinkedIn profiles (users can select any ID)
   * Returns all LinkedIn profiles from the bridge table
   */
  @UseGuards(JwtAuthGuard)
  @Get('mock-data/linkedin')
  async getAvailableLinkedInProfiles() {
    try {
      const profiles = await this.mockServerService.getAvailableLinkedInProfiles();
      return {
        statusCode: HttpStatus.OK,
        message: 'LinkedIn profiles retrieved successfully',
        data: profiles,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all mock GitHub profiles (users can select any ID)
   * Returns all GitHub profiles not assigned to a learner
   */
  @UseGuards(JwtAuthGuard)
  @Get('mock-data/github')
  async getAvailableGitHubProfiles() {
    try {
      const profiles = await this.mockServerService.getAvailableGitHubProfiles();
      return {
        statusCode: HttpStatus.OK,
        message: 'GitHub profiles retrieved successfully',
        data: profiles,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all mock Jira data (users can select any ID)
   * Returns all Jira data from the bridge table
   */
  @UseGuards(JwtAuthGuard)
  @Get('mock-data/jira')
  async getAvailableJiraData() {
    try {
      const jiraData = await this.mockServerService.getAvailableJiraData();
      return {
        statusCode: HttpStatus.OK,
        message: 'Jira data retrieved successfully',
        data: jiraData,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all mock GitLab profiles (users can select any ID)
   * Returns all GitLab profiles (using GitHub profiles as mock data for now)
   */
  @UseGuards(JwtAuthGuard)
  @Get('mock-data/gitlab')
  async getAvailableGitLabProfiles() {
    try {
      // Use GitHub profiles as mock GitLab data for now
      const gitlabData = await this.mockServerService.getGitHubProfiles();
      return {
        statusCode: HttpStatus.OK,
        message: 'GitLab profiles retrieved successfully',
        data: Array.isArray(gitlabData) ? gitlabData : [],
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

