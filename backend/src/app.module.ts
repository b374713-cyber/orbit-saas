import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { OrganizationsModule } from './organizations/organizations.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { ChatModule } from './chat/chat.module.js';
import { MilestonesModule } from './milestones/milestones.module.js';
import { EmailModule } from './email/email.module.js';
import { InvitationsModule } from './invitations/invitations.module.js';
import { AiModule } from './ai/ai.module.js';
import { StripeModule } from './stripe/stripe.module.js';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    OrganizationsModule,
    ProjectsModule,
    TasksModule,
    ChatModule,
    MilestonesModule,
    EmailModule,
    InvitationsModule,
    AiModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}