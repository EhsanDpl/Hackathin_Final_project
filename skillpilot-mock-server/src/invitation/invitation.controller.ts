/**
 * Controller for handling invitation and profile creation
 */

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InvitationService } from '../services/invitation.service';
import { MockServerService } from '../mock-server/mock-server.service';
import { AuthService } from '../auth/auth.service';

@Controller('api/v1/invitation')
export class InvitationController {
  constructor(
    private readonly invitationService: InvitationService,
    private readonly mockServerService: MockServerService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Verify invitation token and return invitation data
   */
  @Get('verify/:token')
  async verifyInvitation(@Param('token') token: string) {
    try {
      const invitationData = await this.invitationService.verifyInvitation(token);
      return {
        statusCode: HttpStatus.OK,
        message: 'Invitation is valid',
        data: {
          email: invitationData.email,
          name: invitationData.name,
          role: invitationData.role,
          token,
        },
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Invalid or expired invitation',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Create user profile from invitation
   */
  @Post('create-profile')
  async createProfile(@Body() profileData: any) {
    try {
      const { token, password, phone, location, skills } = profileData;

      // Verify invitation token
      const invitationData = await this.invitationService.verifyInvitation(token);

      // Update employee/learner record
      const updatedUser = await this.mockServerService.activateUserProfile(
        invitationData.email,
        {
          password,
          phone,
          location,
          skills,
        },
      );

      // Create user account in users table if password provided
      if (password) {
        await this.authService.createUser({
          email: invitationData.email,
          password,
          role: invitationData.role === 'admin' ? 'admin' : 'learner',
        });
      }

      // Delete invitation token from Redis
      await this.invitationService.deleteInvitation(token);

      return {
        statusCode: HttpStatus.OK,
        message: 'Profile created successfully',
        data: {
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          growthPlanStatus: updatedUser.growthPlanStatus,
        },
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

