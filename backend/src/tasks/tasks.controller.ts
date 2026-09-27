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
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { MoveTaskDto } from './dto/move-task.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { AddDependencyDto } from './dto/add-dependency.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ProjectMemberGuard } from '../projects/guards/project-member.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  // ============================================
  // Nested under project
  // ============================================

  @Post('projects/:projectId/tasks')
  @UseGuards(ProjectMemberGuard)
  async create(
    @CurrentUser() user: any,
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(projectId, user.id, dto);
  }

  @Get('projects/:projectId/tasks')
  @UseGuards(ProjectMemberGuard)
  async findAll(
    @CurrentUser() user: any,
    @Param('projectId') projectId: string,
  ) {
    return this.tasksService.findAllForProject(projectId, user.id);
  }

  // ============================================
  // Standalone
  // ============================================

  @Get('tasks/:id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch('tasks/:id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, user.id, dto);
  }

  @Patch('tasks/:id/status')
  async move(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.move(id, user.id, dto);
  }

  @Delete('tasks/:id')
  async remove(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.tasksService.remove(id, user.id);
  }

  // ============================================
  // Comments
  // ============================================

  @Post('tasks/:id/comments')
  async addComment(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.tasksService.addComment(id, user.id, dto);
  }

  @Get('tasks/:id/comments')
  async getComments(@Param('id') id: string) {
    return this.tasksService.getComments(id);
  }

  // ============================================
  // Dependencies
  // ============================================

  @Post('tasks/:id/dependencies')
  async addDependency(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: AddDependencyDto,
  ) {
    return this.tasksService.addDependency(id, user.id, dto);
  }

  @Delete('tasks/:id/dependencies/:dependsOnTaskId')
  async removeDependency(
    @Param('id') id: string,
    @Param('dependsOnTaskId') dependsOnTaskId: string,
  ) {
    return this.tasksService.removeDependency(id, dependsOnTaskId);
  }

  @Get('tasks/:id/dependencies')
  async getDependencies(@Param('id') id: string) {
    return this.tasksService.getDependencies(id);
  }
}