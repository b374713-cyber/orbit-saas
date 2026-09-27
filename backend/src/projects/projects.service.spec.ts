import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: any;

  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test description',
    organizationId: 'org-1',
    creatorId: 'user-1',
    status: 'ACTIVE',
    startDate: null,
    endDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      project: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      projectMember: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      organization: {
        findUnique: vi.fn(),
      },
      task: {
        groupBy: vi.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  describe('create', () => {
    it('should create a project successfully', async () => {
      prisma.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        ownerId: 'user-1',
        members: [],
      });
      prisma.project.create.mockResolvedValue(mockProject);

      const result = await service.create('user-1', 'org-1', {
        name: 'Test Project',
        description: 'Test description',
      });

      expect(result).toEqual(mockProject);
      expect(prisma.project.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if organization does not exist', async () => {
      prisma.organization.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-1', 'invalid-org', {
          name: 'Test Project',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a member', async () => {
      prisma.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        ownerId: 'different-user',
        members: [],
      });

      await expect(
        service.create('user-1', 'org-1', {
          name: 'Test Project',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllForOrganization', () => {
    it('should return all projects in organization', async () => {
      prisma.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        ownerId: 'user-1',
        members: [],
      });
      prisma.project.findMany.mockResolvedValue([mockProject]);

      const result = await service.findAllForOrganization('user-1', 'org-1');

      expect(result).toEqual([mockProject]);
    });
  });

  describe('findOne', () => {
    it('should return project with calculated progress', async () => {
      prisma.project.findUnique.mockResolvedValue({
        ...mockProject,
        tasks: [],
        milestones: [],
        members: [],
      });
      prisma.task.groupBy.mockResolvedValue([
        { status: 'DONE', _count: 2 },
        { status: 'TODO', _count: 3 },
      ]);

      const result = await service.findOne('project-1');

      expect(result.progress).toBe(40);
      expect(result.health).toBeDefined();
    });

    it('should throw NotFoundException if project not found', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});