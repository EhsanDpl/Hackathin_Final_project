/**
 * Invitation Service for managing employee invitations
 * Handles link generation, Redis storage, and email sending
 */

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { MailerSendService } from './mailersend.service';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationService {
  private readonly logger = new Logger(InvitationService.name);
  private readonly baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  private readonly linkExpirationSeconds = 3600; // 1 hour

  constructor(
    private readonly redisService: RedisService,
    private readonly mailerSendService: MailerSendService,
  ) {}

  /**
   * Generate invitation link and send email
   */
  async createInvitation(
    email: string,
    name: string,
    role: string,
    employeeId?: number,
  ): Promise<{ invitationLink: string; token: string }> {
    try {
      // Generate unique token using crypto
      const token = randomBytes(32).toString('hex');
      
      // Create invitation link
      const invitationLink = `${this.baseUrl}/invite/${token}`;

      // Store invitation data in Redis with 1-hour expiration
      const invitationData = {
        email,
        name,
        role,
        employeeId,
        createdAt: new Date().toISOString(),
      };

      await this.redisService.set(
        `invitation:${token}`,
        JSON.stringify(invitationData),
        this.linkExpirationSeconds,
      );

      // Send invitation email
      await this.mailerSendService.sendInvitationEmail(
        email,
        name,
        invitationLink,
        role,
      );

      this.logger.log(`✅ Invitation created and sent to ${email}`);

      return {
        invitationLink,
        token,
      };
    } catch (error: any) {
      this.logger.error('Error creating invitation:', error);
      throw error;
    }
  }

  /**
   * Verify invitation token and get invitation data
   */
  async verifyInvitation(token: string): Promise<any> {
    try {
      const data = await this.redisService.get(`invitation:${token}`);
      
      if (!data) {
        throw new Error('Invitation link has expired or is invalid');
      }

      const invitationData = JSON.parse(data);
      
      // Check if link is still valid (Redis TTL check)
      const ttl = await this.redisService.getTTL(`invitation:${token}`);
      if (ttl <= 0) {
        throw new Error('Invitation link has expired');
      }

      return invitationData;
    } catch (error: any) {
      this.logger.error('Error verifying invitation:', error);
      throw error;
    }
  }

  /**
   * Delete invitation token after profile creation
   */
  async deleteInvitation(token: string): Promise<void> {
    try {
      await this.redisService.delete(`invitation:${token}`);
      this.logger.log(`✅ Invitation token deleted: ${token}`);
    } catch (error: any) {
      this.logger.error('Error deleting invitation:', error);
      // Don't throw error, just log it
    }
  }
}

