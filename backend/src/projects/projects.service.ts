import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { AddProjectMemberDto } from './dto/add-project-member.dto.js';
import { Role, ProjectStatus } from '../generated/prisma/enums.js';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    organizationId: string,
    dto: CreateProjectDto,
  ) {
    // Verify organization exists and user is a member
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const isOwner = organization.ownerId === userId;
    const isMember = organization.members.length > 0;

    if (!isOwner && !isMember) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    // Create project
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        organizationId,
        creatorId: userId,
        status: dto.status || ProjectStatus.ACTIVE,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        members: {
          create: {
            userId,
            role: Role.OWNER,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
    });

    return project;
  }

  async findAllForOrganization(userId: string, organizationId: string) {
    // Verify user is a member of the organization
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const isOwner = organization.ownerId === userId;
    const isMember = organization.members.length > 0;

    if (!isOwner && !isMember) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    return this.prisma.project.findMany({
      where: { organizationId },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Calculate progress
    const tasksByStatus = await this.prisma.task.groupBy({
      by: ['status'],
      where: { projectId },
      _count: true,
    });

    const totalTasks = tasksByStatus.reduce((sum, s) => sum + s._count, 0);
    const doneTasks = tasksByStatus.find((s) => s.status === 'DONE')?._count || 0;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Calculate health score
  let health: 'HEALTHY' | 'AT_RISK' | 'CRITICAL' = 'HEALTHY';
if (progress < 20) health = 'CRITICAL';
else if (progress < 60) health = 'AT_RISK';

    return {
      ...project,
      progress,
      health,
      tasksSummary: tasksByStatus.reduce(
        (acc, s) => {
          acc[s.status] = s._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  async update(projectId: string, dto: UpdateProjectDto) {
    await this.findOne(projectId);

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(projectId: string) {
    await this.findOne(projectId);

    await this.prisma.project.delete({
      where: { id: projectId },
    });

    return { message: 'Project deleted successfully' };
  }

  async addMember(projectId: string, dto: AddProjectMemberDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found. They need to register first.');
    }

    // Check if already a member
    const existingMember = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this project');
    }

    const member = await this.prisma.projectMember.create({
      data: {
        projectId,
        userId: user.id,
        role: dto.role || Role.MEMBER,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return member;
  }

  async removeMember(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.creatorId === userId) {
      throw new ForbiddenException('Cannot remove the project creator');
    }

    await this.prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return { message: 'Member removed successfully' };
  }
}