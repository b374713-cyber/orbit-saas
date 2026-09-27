import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class OrganizationMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const organizationId = request.params.organizationId || request.params.id;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!organizationId) {
      throw new ForbiddenException('Organization ID is required');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          where: { userId: user.id },
        },
      },
    });

    if (!organization) {
      throw new ForbiddenException('Organization not found');
    }

    // User is owner
    if (organization.ownerId === user.id) {
      return true;
    }

    // User is member
    if (organization.members.length > 0) {
      return true;
    }

    throw new ForbiddenException('You are not a member of this organization');
  }
}