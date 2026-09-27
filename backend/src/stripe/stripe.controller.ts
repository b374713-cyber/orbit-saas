import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { StripeService } from './stripe.service.js';
import { CreateCheckoutDto } from './dto/create-checkout.dto.js';
import { CreatePortalDto } from './dto/create-portal.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  // ============================================
  // Create Checkout Session
  // ============================================
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createCheckout(
    @CurrentUser() user: any,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.stripeService.createCheckoutSession(user.id, dto);
  }

  // ============================================
  // Verify Checkout Session
  // ============================================
  @Post('verify-checkout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyCheckout(
    @CurrentUser() user: any,
    @Body('sessionId') sessionId: string,
  ) {
    return this.stripeService.verifyCheckoutSession(sessionId, user.id);
  }

  // ============================================
  // Create Portal Session
  // ============================================
  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createPortal(
    @CurrentUser() user: any,
    @Body() dto: CreatePortalDto,
  ) {
    return this.stripeService.createPortalSession(
      user.id,
      dto.organizationId,
    );
  }

  // ============================================
  // Cancel Subscription (at period end)
  // ============================================
  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(
    @CurrentUser() user: any,
    @Body('organizationId') organizationId: string,
  ) {
    return this.stripeService.cancelSubscription(user.id, organizationId);
  }

  // ============================================
  // Get Subscription
  // ============================================
  @Get('subscription/:organizationId')
  @UseGuards(JwtAuthGuard)
  async getSubscription(@Param('organizationId') organizationId: string) {
    return this.stripeService.getSubscription(organizationId);
  }

  // ============================================
  // Get Invoices (Payment History)
  // ============================================
  @Get('invoices/:organizationId')
  @UseGuards(JwtAuthGuard)
  async getInvoices(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
  ) {
    return this.stripeService.getInvoices(user.id, organizationId);
  }

  // ============================================
  // Webhook (public — no auth)
  // ============================================
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody) {
      throw new Error('Raw body required for webhook verification');
    }

    return this.stripeService.handleWebhook(signature, req.rawBody);
  }
}