import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { EmailService } from './email/email.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  getHello(): string {
    return 'Hello World! API is running 🚀';
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('test-email')
  async testEmail() {
    await this.emailService.sendInvitationEmail({
      to: 'samisamfrj2004@gmail.com', // ← إيميلك
      inviterName: 'Bashar Test',
      organizationName: 'Test Organization',
      invitationToken: 'test-token-123',
      role: 'MEMBER',
    });
    return { message: 'Email sent successfully! Check your inbox.' };
  }
}