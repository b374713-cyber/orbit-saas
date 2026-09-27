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
import { MilestonesService } from './milestones.service.js';
import { CreateMilestoneDto } from './dto/create-milestone.dto.js';
import { UpdateMilestoneDto } from './dto/update-milestone.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ProjectMemberGuard } from '../projects/guards/project-member.guard.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class MilestonesController {
  constructor(private milestonesService: MilestonesService) {}

  @Post('projects/:projectId/milestones')
  @UseGuards(ProjectMemberGuard)
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateMilestoneDto,
  ) {
    return this.milestonesService.create(projectId, dto);
  }

  @Get('projects/:projectId/milestones')
  @UseGuards(ProjectMemberGuard)
  async findAll(@Param('projectId') projectId: string) {
    return this.milestonesService.findAllForProject(projectId);
  }

  @Get('milestones/:id')
  async findOne(@Param('id') id: string) {
    return this.milestonesService.findOne(id);
  }

  @Patch('milestones/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateMilestoneDto) {
    return this.milestonesService.update(id, dto);
  }

  @Delete('milestones/:id')
  async remove(@Param('id') id: string) {
    return this.milestonesService.remove(id);
  }
}