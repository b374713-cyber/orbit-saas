import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service.js';
import { OrganizationsController } from './organizations.controller.js';
import { RolesGuard } from './guards/roles.guard.js';
import { OrganizationMemberGuard } from './guards/organization-member.guard.js';
import { AuthModule } from '../auth/auth.module.js';
import { InvitationsModule } from '../invitations/invitations.module.js';
@Module({
  imports: [AuthModule,InvitationsModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, RolesGuard, OrganizationMemberGuard],
  exports: [OrganizationsService],
  
})
export class OrganizationsModule {}