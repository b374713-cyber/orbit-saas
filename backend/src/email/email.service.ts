import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_APP_PASSWORD'),
      },
    });
  }

  async sendInvitationEmail(params: {
    to: string;
    inviterName: string;
    organizationName: string;
    invitationToken: string;
    role: string;
  }) {
    const { to, inviterName, organizationName, invitationToken, role } =
      params;

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:3000';
    const invitationUrl = `${frontendUrl}/invite/${invitationToken}`;

    const html = this.getInvitationTemplate({
      inviterName,
      organizationName,
      invitationUrl,
      role,
    });

    try {
      await this.transporter.sendMail({
        from: `"ORBIT" <${this.configService.get<string>('GMAIL_USER')}>`,
        to,
        subject: `${inviterName} invited you to join ${organizationName} on ORBIT`,
        html,
      });

      this.logger.log(`✅ Invitation email sent to ${to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  private getInvitationTemplate(params: {
    inviterName: string;
    organizationName: string;
    invitationUrl: string;
    role: string;
  }) {
    const { inviterName, organizationName, invitationUrl, role } = params;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to ORBIT</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 40px 40px 60px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 1px;">
                ORBIT
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Team & Project Operations Platform
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 24px; font-weight: 600;">
                You've been invited! 🎉
              </h2>
              
              <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">
                <strong style="color: #0f172a;">${inviterName}</strong> has invited you to join
                <strong style="color: #0f172a;">${organizationName}</strong> on ORBIT.
              </p>
              
              <p style="margin: 0 0 8px; color: #475569; font-size: 16px; line-height: 1.6;">
                Your role will be:
              </p>
              
              <div style="display: inline-block; padding: 6px 16px; background-color: #eff6ff; color: #1d4ed8; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 24px;">
                ${role}
              </div>
              
              <p style="margin: 0 0 32px; color: #475569; font-size: 16px; line-height: 1.6;">
                Click the button below to accept the invitation and start collaborating with your team.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center">
                    <a href="${invitationUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 32px 0 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                Or copy this link into your browser:
              </p>
              <p style="margin: 8px 0 0; color: #3b82f6; font-size: 13px; word-break: break-all;">
                ${invitationUrl}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.6;">
                This invitation was sent by ORBIT on behalf of ${inviterName}.
                <br>
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
        </table>
      </body>
</html>
    `;
  }
}