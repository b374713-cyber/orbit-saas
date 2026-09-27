import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ProjectMemberGuard } from '../projects/guards/project-member.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('projects/:projectId/messages')
@UseGuards(JwtAuthGuard, ProjectMemberGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  async getMessages(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getMessages(projectId, user.id, limit ? +limit : 50);
  }

  @Post()
  async sendMessage(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
    @Body('content') content: string,
  ) {
    return this.chatService.createMessage(projectId, user.id, content);
  }
}