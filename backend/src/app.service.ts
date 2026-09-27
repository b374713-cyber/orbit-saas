import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHealth() {
    const userCount = await this.prisma.user.count();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      users: userCount,
    };
  }
}