import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('invitations')
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  // Public - no auth needed
  @Get(':token')
  async getInvitation(@Param('token') token: string) {
    return this.invitationsService.getInvitationByToken(token);
  }

  // Protected - needs auth
  @Post(':token/accept')
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(
    @Param('token') token: string,
    @CurrentUser() user: any,
  ) {
    return this.invitationsService.acceptInvitation(token, user.id);
  }

  @Post(':token/decline')
  @UseGuards(JwtAuthGuard)
  async declineInvitation(
    @Param('token') token: string,
    @CurrentUser() user: any,
  ) {
    return this.invitationsService.declineInvitation(token, user.id);
  }

  // My pending invitations
  @Get('me/pending')
  @UseGuards(JwtAuthGuard)
  async getMyPendingInvitations(@CurrentUser() user: any) {
    return this.invitationsService.listPendingInvitationsForUser(user.email);
  }
}