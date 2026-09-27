import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { TasksController } from './tasks.controller.js';
import { ProjectMemberGuard } from '../projects/guards/project-member.guard.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [TasksController],
  providers: [TasksService, ProjectMemberGuard],
  exports: [TasksService],
})
export class TasksModule {}