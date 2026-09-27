import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for Stripe webhook signature verification
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // ============================================
  // Swagger Setup
  // ============================================
  const config = new DocumentBuilder()
    .setTitle('ORBIT API')
    .setDescription(
      `
      ## AI-Powered Team & Project Operations Platform
      
      ### Features
      - 🔐 JWT Authentication
      - 🏢 Multi-tenant Organizations
      - 📁 Projects & Tasks (Kanban)
      - 🎯 Milestones & Roadmap
      - 🔗 Task Dependencies
      - 💬 Real-time Chat (WebSocket)
      - 🤖 AI Features (Groq)
      - 📧 Email Invitations
      - 💳 Stripe Subscriptions
      
      ### Authentication
      1. Register: \`POST /api/auth/register\`
      2. Login: \`POST /api/auth/login\`
      3. Copy \`accessToken\` from response
      4. Click "Authorize" button (top-right)
      5. Enter: \`Bearer YOUR_TOKEN\`
      `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', 'Authentication & JWT')
    .addTag('Organizations', 'Organization management')
    .addTag('Projects', 'Project management')
    .addTag('Tasks', 'Task management')
    .addTag('Milestones', 'Milestones & Roadmap')
    .addTag('Chat', 'Real-time messaging')
    .addTag('Invitations', 'Email invitations')
    .addTag('AI', 'AI-powered features')
    .addTag('Stripe', 'Subscriptions & Billing')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'ORBIT API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });

  // ============================================
  // Start Server
  // ============================================
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Backend is running on: http://localhost:${port}/api`);
  console.log(`📚 API Docs: http://localhost:${port}/api/docs`);
}
bootstrap();