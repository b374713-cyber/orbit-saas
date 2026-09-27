import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async isProjectMember(projectId: string, userId: string): Promise<boolean> {
    // Check if user is a project member
    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (projectMember) return true;

    // Check if user is organization member
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) return false;

    const orgMember = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.organizationId,
          userId,
        },
      },
    });

    if (orgMember) return true;

    // Check if user is organization owner
    const organization = await this.prisma.organization.findUnique({
      where: { id: project.organizationId },
    });

    return organization?.ownerId === userId;
  }

  async createMessage(projectId: string, userId: string, content: string) {
    if (!content || content.trim().length === 0) {
      throw new ForbiddenException('Message cannot be empty');
    }

    return this.prisma.message.create({
      data: {
        projectId,
        userId,
        content: content.trim(),
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
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getMessages(projectId: string, userId: string, limit = 50) {
    // Verify membership
    const isMember = await this.isProjectMember(projectId, userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this project');
    }

    return this.prisma.message.findMany({
      where: { projectId },
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
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}