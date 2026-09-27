import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { UpdateOrganizationDto } from './dto/update-organization.dto.js';
import { InviteMemberDto } from './dto/invite-member.dto.js';
import { Role } from '../generated/prisma/enums.js';
import { InvitationsService } from '../invitations/invitations.service.js';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private invitationsService: InvitationsService,
  ) {}

  async create(userId: string, dto: CreateOrganizationDto) {
    // Check slug uniqueness
    const existing = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Organization slug already exists');
    }

    // Create organization with owner as member
    const organization = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: Role.OWNER,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
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
      },
    });

    return organization;
  }

  async findAllForUser(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: { userId },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
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
            members: true,
            projects: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOne(id); // Verify exists

    return this.prisma.organization.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.organization.delete({
      where: { id },
    });

    return { message: 'Organization deleted successfully' };
  }

  async inviteMember(
    organizationId: string,
    dto: InviteMemberDto,
    invitedBy: string,
  ) {
    // Use the new InvitationsService
    return this.invitationsService.createInvitation({
      email: dto.email,
      organizationId,
      inviterId: invitedBy,
      role: dto.role,
    });
  }

  async removeMember(organizationId: string, userId: string) {
    const organization = await this.findOne(organizationId);

    if (organization.ownerId === userId) {
      throw new ForbiddenException('Cannot remove the owner');
    }

    await this.prisma.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    return { message: 'Member removed successfully' };
  }

  async updateMemberRole(
    organizationId: string,
    userId: string,
    role: Role,
  ) {
    const organization = await this.findOne(organizationId);

    if (organization.ownerId === userId) {
      throw new ForbiddenException('Cannot change owner role');
    }

    const member = await this.prisma.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return member;
  }
}