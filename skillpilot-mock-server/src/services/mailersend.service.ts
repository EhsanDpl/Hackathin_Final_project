/**
 * MailerSend Service for sending emails
 * Uses MailerSend API to send invitation emails
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MailerSendService {
  private readonly logger = new Logger(MailerSendService.name);
  private readonly apiToken: string;
  private readonly apiUrl = 'https://api.mailersend.com/v1';
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor() {
    this.apiToken = process.env.MAILERSEND_API_TOKEN || '';
    this.fromEmail = process.env.MAILERSEND_FROM_EMAIL || '';
    this.fromName = process.env.MAILERSEND_FROM_NAME || 'SkillPilot AI';
    
    if (!this.apiToken) {
      this.logger.warn('⚠️  MAILERSEND_API_TOKEN not found. Email service will not be available.');
    } else if (!this.fromEmail) {
      this.logger.warn('⚠️  MAILERSEND_FROM_EMAIL not found. Please set a verified email domain in MailerSend.');
    } else {
      this.logger.log(`✅ MailerSend service initialized with from email: ${this.fromEmail}`);
    }
  }

  /**
   * Send invitation email with profile creation link
   */
  async sendInvitationEmail(
    toEmail: string,
    toName: string,
    invitationLink: string,
    role: string,
  ): Promise<void> {
    if (!this.apiToken) {
      this.logger.warn('⚠️  Email service not configured. Skipping email send.');
      return; // Don't throw error, just skip
    }

    if (!this.fromEmail) {
      this.logger.warn('⚠️  Email sender not configured. Skipping email send.');
      return; // Don't throw error, just skip
    }

    try {
      const emailContent = this.getInvitationEmailTemplate(toName, invitationLink, role);

      // MailerSend API format
      const response = await axios.post(
        `${this.apiUrl}/email`,
        {
          from: {
            email: this.fromEmail,
            name: this.fromName,
          },
          to: [
            {
              email: toEmail,
              name: toName,
            },
          ],
          subject: `Welcome to SkillPilot AI - Complete Your Profile`,
          html: emailContent.html,
          text: emailContent.text,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`✅ Invitation email sent to ${toEmail}`);
    } catch (error: any) {
      this.logger.error('Error sending invitation email:', error.response?.data || error.message);
      
      // Don't throw error - just log it and continue
      // This allows the application to work even if email service fails
      if (error.response?.data?.message?.includes('domain must be verified')) {
        this.logger.warn(`⚠️  MailerSend domain not verified. Email not sent to ${toEmail}. Please verify domain in MailerSend dashboard.`);
        return; // Return silently - don't break the flow
      }
      
      // For other errors, also don't throw - just log
      this.logger.warn(`⚠️  Failed to send email to ${toEmail}, but continuing without email.`);
      return;
    }
  }

  /**
   * Generate email template for invitation
   */
  private getInvitationEmailTemplate(name: string, link: string, role: string): { html: string; text: string } {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SkillPilot AI</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>You have been invited to join SkillPilot AI as a <strong>${role}</strong>.</p>
            <p>Please click the button below to complete your profile and get started:</p>
            <p style="text-align: center;">
              <a href="${link}" class="button">Complete Your Profile</a>
            </p>
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 1 hour. Please complete your profile as soon as possible.
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${link}</p>
            <p>Best regards,<br>SkillPilot AI Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome to SkillPilot AI

Hello ${name},

You have been invited to join SkillPilot AI as a ${role}.

Please click the link below to complete your profile and get started:
${link}

⚠️ Important: This link will expire in 1 hour. Please complete your profile as soon as possible.

Best regards,
SkillPilot AI Team
    `;

    return { html, text };
  }
}

