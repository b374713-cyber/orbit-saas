import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import { Role, InvitationStatus } from '../generated/prisma/enums.js';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async createInvitation(params: {
    email: string;
    organizationId: string;
    inviterId: string;
    role?: Role;
  }) {
    const { email, organizationId, inviterId, role = Role.MEMBER } = params;

    // Check organization exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if user is already a member
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const existingMember = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMember) {
        throw new ConflictException('User is already a member');
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        email,
        organizationId,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      throw new ConflictException(
        'An invitation has already been sent to this email',
      );
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex');

    // Expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = await this.prisma.invitation.create({
      data: {
        token,
        email,
        organizationId,
        inviterId,
        role,
        expiresAt,
      },
      include: {
        organization: {
          select: { id: true, name: true },
        },
        inviter: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Send email
    try {
      await this.emailService.sendInvitationEmail({
        to: email,
        inviterName: invitation.inviter.name,
        organizationName: invitation.organization.name,
        invitationToken: token,
        role,
      });
    } catch (error) {
      // Log but don't fail - invitation is created
      console.error('Failed to send invitation email:', error);
    }

    return invitation;
  }

  async getInvitationByToken(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
        inviter: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      if (invitation.status === InvitationStatus.PENDING) {
        await this.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.EXPIRED },
        });
      }
      throw new BadRequestException('Invitation has expired');
    }

    return invitation;
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        `Invitation has been ${invitation.status.toLowerCase()}`,
      );
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    // Verify the user's email matches invitation email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email !== invitation.email) {
      throw new BadRequestException(
        'This invitation was sent to a different email address',
      );
    }

    // Check if already member
    const existingMember = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: invitation.organizationId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('You are already a member');
    }

    // Add user as member and mark invitation as accepted
    await this.prisma.$transaction([
      this.prisma.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId,
          role: invitation.role,
        },
      }),
      this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.ACCEPTED },
      }),
    ]);

    return {
      message: 'Invitation accepted successfully',
      organizationId: invitation.organizationId,
    };
  }

  async declineInvitation(token: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        `Invitation has been ${invitation.status.toLowerCase()}`,
      );
    }

    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.DECLINED },
    });

    return { message: 'Invitation declined' };
  }

  async listInvitationsForOrganization(organizationId: string) {
    return this.prisma.invitation.findMany({
      where: { organizationId },
      include: {
        inviter: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listPendingInvitationsForUser(userEmail: string) {
    return this.prisma.invitation.findMany({
      where: {
        email: userEmail,
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
        inviter: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}