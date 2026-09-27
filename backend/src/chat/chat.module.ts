import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service.js';
import { ChatController } from './chat.controller.js';
import { ChatGateway } from './chat.gateway.js';
import { AuthModule } from '../auth/auth.module.js';
import { ProjectMemberGuard } from '../projects/guards/project-member.guard.js';

@Module({
  imports: [
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
      }),
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ProjectMemberGuard],
  exports: [ChatService],
})
export class ChatModule {}