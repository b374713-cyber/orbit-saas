import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { AiService } from './ai.service.js';
import { GenerateProjectPlanDto } from './dto/generate-project-plan.dto.js';
import { GenerateTaskBreakdownDto } from './dto/generate-task-breakdown.dto.js';
import { CreateProjectFromAiDto } from './dto/create-project-from-ai.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private aiService: AiService,
    private prisma: PrismaService,
  ) {}

  @Post('generate-project-plan')
  @HttpCode(HttpStatus.OK)
  async generateProjectPlan(@Body() dto: GenerateProjectPlanDto) {
    return this.aiService.generateProjectPlan(dto);
  }

  @Post('generate-task-breakdown')
  @HttpCode(HttpStatus.OK)
  async generateTaskBreakdown(@Body() dto: GenerateTaskBreakdownDto) {
    return this.aiService.generateTaskBreakdown(dto);
  }

  @Post('create-project')
  @HttpCode(HttpStatus.CREATED)
  async createProjectFromPlan(
    @CurrentUser() user: any,
    @Body() dto: CreateProjectFromAiDto & { organizationId: string },
  ) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: dto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: dto.organizationId,
          userId: user.id,
        },
      },
    });

    const isOwner = organization.ownerId === user.id;

    if (!membership && !isOwner) {
      throw new NotFoundException('You are not a member of this organization');
    }

    return this.aiService.createProjectFromPlan({
      organizationId: dto.organizationId,
      userId: user.id,
      projectName: dto.projectName,
      description: dto.description,
      milestones: dto.milestones,
      startDate: dto.startDate,
      prisma: this.prisma,
    });
  }

  @Post('analyze-project-risk')
  @HttpCode(HttpStatus.OK)
  async analyzeProjectRisk(
    @CurrentUser() user: any,
    @Body() dto: { projectId: string },
  ) {
    const { projectId } = dto;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          include: {
            assignee: { select: { id: true, name: true } },
            dependencies: {
              include: {
                dependsOnTask: { select: { status: true } },
              },
            },
          },
        },
        milestones: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const totalTasks = project.tasks.length;
    const doneTasks = project.tasks.filter((t) => t.status === 'DONE').length;
    const overdueTasks = project.tasks.filter(
      (t) =>
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE',
    ).length;
    const blockedTasks = project.tasks.filter((t) =>
      t.dependencies.some((d) => d.dependsOnTask.status !== 'DONE'),
    ).length;

    const progress =
      totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    const workloadMap = new Map<
      string,
      { name: string; activeTasks: number }
    >();
    project.tasks
      .filter((t) => t.status !== 'DONE' && t.assignee)
      .forEach((t) => {
        const existing = workloadMap.get(t.assignee!.id) || {
          name: t.assignee!.name,
          activeTasks: 0,
        };
        existing.activeTasks++;
        workloadMap.set(t.assignee!.id, existing);
      });

    const teamWorkload = Array.from(workloadMap.values());

    const daysRemaining = project.endDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(project.endDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 30;

    return this.aiService.analyzeProjectRisk({
      projectName: project.name,
      progress,
      totalTasks,
      doneTasks,
      overdueTasks,
      blockedTasks,
      teamWorkload,
      daysRemaining,
    });
  }

  // ← جديد: AI Project Summary
  @Post('summarize-project')
  @HttpCode(HttpStatus.OK)
  async summarizeProject(
    @CurrentUser() user: any,
    @Body() dto: { projectId: string },
  ) {
    const { projectId } = dto;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          include: {
            assignee: { select: { name: true } },
            activities: {
              include: {
                user: { select: { name: true } },
              },
              orderBy: { createdAt: 'desc' },
              take: 3,
            },
          },
        },
        milestones: {
          include: {
            tasks: { select: { status: true } },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const totalTasks = project.tasks.length;
    const doneTasks = project.tasks.filter((t) => t.status === 'DONE').length;
    const inProgressTasks = project.tasks.filter(
      (t) => t.status === 'IN_PROGRESS',
    ).length;

    const progress =
      totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    const milestones = project.milestones.map((m) => {
      const milestoneTasks = m.tasks.length;
      const milestoneDone = m.tasks.filter((t) => t.status === 'DONE').length;
      const milestoneProgress =
        milestoneTasks > 0
          ? Math.round((milestoneDone / milestoneTasks) * 100)
          : 0;

      return {
        title: m.title,
        status: m.status,
        progress: milestoneProgress,
      };
    });

    const recentActivity = project.tasks
      .flatMap((t) => t.activities)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10)
      .map((a) => ({
        action: a.action,
        user: a.user.name,
      }));

    return this.aiService.generateProjectSummary({
      projectName: project.name,
      description: project.description || undefined,
      progress,
      totalTasks,
      doneTasks,
      inProgressTasks,
      milestones,
      recentActivity,
    });
  }
}