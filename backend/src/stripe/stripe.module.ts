import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service.js';
import { StripeController } from './stripe.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}