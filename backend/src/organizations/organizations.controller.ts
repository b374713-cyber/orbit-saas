import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { UpdateOrganizationDto } from './dto/update-organization.dto.js';
import { InviteMemberDto } from './dto/invite-member.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { OrganizationMemberGuard } from './guards/organization-member.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Role } from '../generated/prisma/enums.js';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.organizationsService.findAllForUser(user.id);
  }

  @Get(':id')
  @UseGuards(OrganizationMemberGuard)
  async findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles(Role.OWNER)
  async remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }

  @Post(':id/invite')
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async inviteMember(
    @Param('id') id: string,
    @Body() dto: InviteMemberDto,
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.inviteMember(id, dto, user.id);
  }

  @Delete(':id/members/:userId')
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.organizationsService.removeMember(id, userId);
  }

  @Patch(':id/members/:userId')
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles(Role.OWNER)
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body('role') role: Role,
  ) {
    return this.organizationsService.updateMemberRole(id, userId, role);
  }
}