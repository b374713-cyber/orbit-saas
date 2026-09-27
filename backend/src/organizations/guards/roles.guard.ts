import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../generated/prisma/enums.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const organizationId = request.params.organizationId || request.params.id;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!organizationId) {
      throw new ForbiddenException('Organization ID is required');
    }

    // Check if user is a member of the organization
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.id,
        },
      },
    });

    // Also check if user is the owner
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (organization?.ownerId === user.id) {
      return true;
    }

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    // Check role
    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException(
        `You need one of these roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}