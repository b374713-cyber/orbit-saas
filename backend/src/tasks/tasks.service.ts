import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { MoveTaskDto } from './dto/move-task.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { AddDependencyDto } from './dto/add-dependency.dto.js';
import { TaskStatus, TaskPriority } from '../generated/prisma/enums.js';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, userId: string, dto: CreateTaskDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: { where: { userId } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (dto.assigneeId) {
      const assigneeMember = await this.prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: dto.assigneeId,
          },
        },
      });

      if (!assigneeMember) {
        throw new ForbiddenException('Assignee is not a member of this project');
      }
    }

    if (dto.milestoneId) {
      const milestone = await this.prisma.milestone.findUnique({
        where: { id: dto.milestoneId },
      });

      if (!milestone || milestone.projectId !== projectId) {
        throw new ForbiddenException('Milestone does not belong to this project');
      }
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId,
        creatorId: userId,
        assigneeId: dto.assigneeId,
        milestoneId: dto.milestoneId,
        status: dto.status || TaskStatus.TODO,
        priority: dto.priority || TaskPriority.MEDIUM,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        order: dto.order ?? 0,
      },
      include: {
        creator: {
          select: { id: true, email: true, name: true, avatarUrl: true },
        },
        assignee: {
          select: { id: true, email: true, name: true, avatarUrl: true },
        },
        milestone: {
          select: { id: true, title: true, status: true },
        },
        _count: {
          select: { comments: true, files: true },
        },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        taskId: task.id,
        action: 'TASK_CREATED',
        metadata: { taskTitle: task.title },
      },
    });

    return task;
  }

  async findAllForProject(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: { where: { userId } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.members.length === 0) {
      throw new ForbiddenException('You are not a member of this project');
    }

    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      include: {
        creator: {
          select: { id: true, email: true, name: true, avatarUrl: true },
        },
        assignee: {
          select: { id: true, email: true, name: true, avatarUrl: true },
        },
        milestone: {
          select: { id: true, title: true, status: true },
        },
        labels: true,
        _count: {
          select: { comments: true, files: true },
        },
      },
      orderBy: [{ status: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });

    const kanban = {
      BACKLOG: tasks.filter((t) => t.status === TaskStatus.BACKLOG),
      TODO: tasks.filter((t) => t.status === TaskStatus.TODO),
      IN_PROGRESS: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS),
      REVIEW: tasks.filter((t) => t.status === TaskStatus.REVIEW),
      DONE: tasks.filter((t) => t.status === TaskStatus.DONE),
    };

    return {
      tasks,
      kanban,
      total: tasks.length,
    };
  }

  async findOne(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { id: true, name: true, organizationId: true },
        },
        creator: {
          select: { id: true, email: true, name: true, avatarUrl: true },
        },
        assignee: {
          select: { id: true, email: true, name: true, avatarUrl: true },
        },
        milestone: {
          select: { id: true, title: true, status: true, dueDate: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, email: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        labels: true,
        files: true,
        activities: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        dependencies: {
          include: {
            dependsOnTask: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                assignee: {
                  select: { id: true, name: true, avatarUrl: true },
                },
              },
            },
          },
        },
        dependents: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(taskId: string, userId: string, dto: UpdateTaskDto) {
    await this.findOne(taskId);

    if (dto.assigneeId) {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
      });

      const assigneeMember = await this.prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: task!.projectId,
            userId: dto.assigneeId,
          },
        },
      });

      if (!assigneeMember) {
        throw new ForbiddenException('Assignee is not a member of this project');
      }
    }

    if (dto.milestoneId) {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
      });

      const milestone = await this.prisma.milestone.findUnique({
        where: { id: dto.milestoneId },
      });

      if (!milestone || milestone.projectId !== task!.projectId) {
        throw new ForbiddenException('Milestone does not belong to this project');
      }
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: {
        creator: {
          select: { id: true, email: true, name: true, avatarUrl: true },
        },
        assignee: {
          select: { id: true, email: true, name: true, avatarUrl: true },
        },
        milestone: {
          select: { id: true, title: true, status: true },
        },
        labels: true,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        taskId,
        action: 'TASK_UPDATED',
        metadata: { changes: Object.keys(dto) },
      },
    });

    return updated;
  }

  async move(taskId: string, userId: string, dto: MoveTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: dto.status,
        order: dto.order ?? task.order,
      },
      include: {
        creator: {
          select: { id: true, email: true, name: true, avatarUrl: true },
        },
        assignee: {
          select: { id: true, email: true, name: true, avatarUrl: true },
        },
        milestone: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        taskId,
        action: 'TASK_MOVED',
        metadata: {
          from: task.status,
          to: dto.status,
        },
      },
    });

    return updated;
  }

  async remove(taskId: string, userId: string) {
    await this.findOne(taskId);

    await this.prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Task deleted successfully' };
  }

  // ============================================
  // Comments
  // ============================================

  async addComment(taskId: string, userId: string, dto: CreateCommentDto) {
    await this.findOne(taskId);

    const comment = await this.prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content: dto.content,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, avatarUrl: true },
        },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        taskId,
        action: 'COMMENT_ADDED',
        metadata: { commentId: comment.id },
      },
    });

    return comment;
  }

  async getComments(taskId: string) {
    await this.findOne(taskId);

    return this.prisma.taskComment.findMany({
      where: { taskId },
      include: {
        user: {
          select: { id: true, email: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================
  // Dependencies
  // ============================================

  async addDependency(taskId: string, userId: string, dto: AddDependencyDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) throw new NotFoundException('Task not found');

    const dependsOnTask = await this.prisma.task.findUnique({
      where: { id: dto.dependsOnTaskId },
    });

    if (!dependsOnTask) {
      throw new NotFoundException('Dependency task not found');
    }

    if (task.projectId !== dependsOnTask.projectId) {
      throw new ForbiddenException('Tasks must be in the same project');
    }

    if (taskId === dto.dependsOnTaskId) {
      throw new ForbiddenException('Task cannot depend on itself');
    }

    const existing = await this.prisma.taskDependency.findFirst({
      where: {
        taskId: dto.dependsOnTaskId,
        dependsOnTaskId: taskId,
      },
    });

    if (existing) {
      throw new ForbiddenException('Circular dependency detected');
    }

    await this.prisma.taskDependency.create({
      data: {
        taskId,
        dependsOnTaskId: dto.dependsOnTaskId,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        taskId,
        action: 'DEPENDENCY_ADDED',
        metadata: { dependsOnTaskId: dto.dependsOnTaskId },
      },
    });

    return this.findOne(taskId);
  }

  async removeDependency(taskId: string, dependsOnTaskId: string) {
    await this.prisma.taskDependency.deleteMany({
      where: {
        taskId,
        dependsOnTaskId,
      },
    });

    return this.findOne(taskId);
  }

  async getDependencies(taskId: string) {
    const dependencies = await this.prisma.taskDependency.findMany({
      where: { taskId },
      include: {
        dependsOnTask: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assignee: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    const dependents = await this.prisma.taskDependency.findMany({
      where: { dependsOnTaskId: taskId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    const isBlocked = dependencies.some(
      (d) => d.dependsOnTask.status !== 'DONE',
    );

    return {
      dependencies: dependencies.map((d) => d.dependsOnTask),
      dependents: dependents.map((d) => d.task),
      isBlocked,
    };
  }
}