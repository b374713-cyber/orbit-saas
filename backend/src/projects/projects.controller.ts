import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { AddProjectMemberDto } from './dto/add-project-member.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ProjectMemberGuard } from './guards/project-member.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  // ============================================
  // Project Routes (nested under organization)
  // ============================================

  @Post('organizations/:organizationId/projects')
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(user.id, organizationId, dto);
  }

  @Get('organizations/:organizationId/projects')
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
  ) {
    return this.projectsService.findAllForOrganization(user.id, organizationId);
  }

  // ============================================
  // Project Routes (standalone)
  // ============================================

  @Get('projects/:id')
  @UseGuards(ProjectMemberGuard)
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch('projects/:id')
  @UseGuards(ProjectMemberGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  @Delete('projects/:id')
  @UseGuards(ProjectMemberGuard)
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  // ============================================
  // Project Members
  // ============================================

  @Post('projects/:id/members')
  @UseGuards(ProjectMemberGuard)
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddProjectMemberDto,
  ) {
    return this.projectsService.addMember(id, dto);
  }

  @Delete('projects/:id/members/:userId')
  @UseGuards(ProjectMemberGuard)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.projectsService.removeMember(id, userId);
  }
}