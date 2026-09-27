import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Projects E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  let organizationId: string;
  let projectId: string;
  const testEmail = `proj-${Date.now()}@test.com`;
  const testPassword = 'password123';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();

    // Register + create org
    const authResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'Project Test User',
      });

    accessToken = authResponse.body.accessToken;

    const orgResponse = await request(app.getHttpServer())
      .post('/api/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Project Test Org',
        slug: `proj-test-org-${Date.now()}`,
      });

    organizationId = orgResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/organizations/:orgId/projects', () => {
    it('should create a project', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/organizations/${organizationId}/projects`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'E2E Test Project',
          description: 'Created via E2E test',
        })
        .expect(201);

      expect(response.body.name).toBe('E2E Test Project');
      expect(response.body.id).toBeDefined();

      projectId = response.body.id;
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/api/organizations/${organizationId}/projects`)
        .send({
          name: 'Should Fail',
        })
        .expect(401);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return project details with health + progress', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(projectId);
      expect(response.body.progress).toBeDefined();
      expect(response.body.health).toBeDefined();
    });
  });

  describe('PATCH /api/projects/:id', () => {
    it('should update project', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated E2E Project',
        })
        .expect(200);

      expect(response.body.name).toBe('Updated E2E Project');
    });
  });
});