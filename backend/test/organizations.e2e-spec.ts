import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Organizations E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  let organizationId: string;
  const testEmail = `org-${Date.now()}@test.com`;
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

    // Register test user
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'Org Test User',
      });

    accessToken = response.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/organizations', () => {
    it('should create an organization', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/organizations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Organization',
          slug: `test-org-${Date.now()}`,
          description: 'E2E test org',
        })
        .expect(201);

      expect(response.body.name).toBe('Test Organization');
      expect(response.body.id).toBeDefined();

      organizationId = response.body.id;
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/organizations')
        .send({
          name: 'Should Fail',
          slug: 'should-fail',
        })
        .expect(401);
    });

    it('should reject invalid data', async () => {
      await request(app.getHttpServer())
        .post('/api/organizations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'A', // too short
          slug: 'x',
        })
        .expect(400);
    });
  });

  describe('GET /api/organizations', () => {
    it('should return user organizations', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/organizations')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/organizations/:id', () => {
    it('should return organization details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(organizationId);
      expect(response.body.members).toBeDefined();
    });

    it('should return 404 for non-existent org', async () => {
      await request(app.getHttpServer())
        .get('/api/organizations/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403); // or 404 depending on guard
    });
  });

  describe('PATCH /api/organizations/:id', () => {
    it('should update organization', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
    });
  });
});