import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMilestoneDto } from './dto/create-milestone.dto.js';
import { UpdateMilestoneDto } from './dto/update-milestone.dto.js';
import { MilestoneStatus } from '../generated/prisma/enums.js';

@Injectable()
export class MilestonesService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, dto: CreateMilestoneDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.milestone.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        status: dto.status || MilestoneStatus.PENDING,
        order: dto.order ?? 0,
      },
      include: {
        _count: { select: { tasks: true } },
      },
    });
  }

  async findAllForProject(projectId: string) {
    const milestones = await this.prisma.milestone.findMany({
      where: { projectId },
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          select: { id: true, status: true },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    // Calculate progress for each milestone
    return milestones.map((m) => {
      const totalTasks = m.tasks.length;
      const doneTasks = m.tasks.filter((t) => t.status === 'DONE').length;
      const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      return {
        ...m,
        tasks: undefined,
        progress,
        tasksCount: totalTasks,
        doneTasksCount: doneTasks,
      };
    });
  }

  async findOne(id: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!milestone) throw new NotFoundException('Milestone not found');
    return milestone;
  }

  async update(id: string, dto: UpdateMilestoneDto) {
    await this.findOne(id);

    return this.prisma.milestone.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.milestone.delete({ where: { id } });
    return { message: 'Milestone deleted successfully' };
  }
}