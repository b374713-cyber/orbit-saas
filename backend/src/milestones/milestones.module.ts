import { Module } from '@nestjs/common';
import { MilestonesService } from './milestones.service.js';
import { MilestonesController } from './milestones.controller.js';
import { ProjectMemberGuard } from '../projects/guards/project-member.guard.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [MilestonesController],
  providers: [MilestonesService, ProjectMemberGuard],
  exports: [MilestonesService],
})
export class MilestonesModule {}