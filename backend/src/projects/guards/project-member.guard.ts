import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const projectId = request.params.id || request.params.projectId;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!projectId) {
      throw new ForbiddenException('Project ID is required');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId: user.id },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user is a member of the project
    if (project.members.length > 0) {
      return true;
    }

    // Check if user is a member of the organization that owns the project
    const orgMembership = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.organizationId,
          userId: user.id,
        },
      },
    });

    if (orgMembership) {
      return true;
    }

    // Check if user is organization owner
    const organization = await this.prisma.organization.findUnique({
      where: { id: project.organizationId },
    });

    if (organization?.ownerId === user.id) {
      return true;
    }

    throw new ForbiddenException('You are not a member of this project');
  }
}