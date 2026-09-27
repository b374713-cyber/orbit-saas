import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service.js';
import { Plan, SubscriptionStatus } from '../generated/prisma/enums.js';
import { CreateCheckoutDto, SubscriptionPlan } from './dto/create-checkout.dto.js';

// ============================================
// Explicit return types (so TS doesn't leak Stripe internals)
// ============================================
export interface CancelSubscriptionResult {
  success: boolean;
  message: string;
}

export interface InvoiceItem {
  id: string;
  amount: number;
  currency: string;
  status: string | null;
  date: string;
  pdfUrl: string | null;
  hostedUrl: string | null;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY')!,
      {
        // @ts-ignore - Stripe types updated; use current API version
        apiVersion: '2025-12-15.clover',
      },
    );
  }

  // ============================================
  // Create Checkout Session
  // ============================================
  async createCheckoutSession(userId: string, dto: CreateCheckoutDto) {
    const { organizationId, plan } = dto;

    // Verify organization exists and user is owner/admin
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: { where: { userId } },
        subscription: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check user is owner or admin
    const isOwner = organization.ownerId === userId;
    const memberRole = organization.members[0]?.role;
    const isAdmin = memberRole === 'ADMIN' || memberRole === 'OWNER';

    if (!isOwner && !isAdmin) {
      throw new BadRequestException(
        'Only owners and admins can manage subscriptions',
      );
    }

    // Get price ID based on plan
    const priceId =
      plan === SubscriptionPlan.PRO
        ? this.configService.get<string>('STRIPE_PRO_PRICE_ID')
        : this.configService.get<string>('STRIPE_BUSINESS_PRICE_ID');

    if (!priceId) {
      throw new BadRequestException('Invalid plan');
    }

    // Get or create Stripe customer
    let customerId = organization.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        name: organization.name,
        metadata: {
          organizationId: organization.id,
          slug: organization.slug,
        },
      });
      customerId = customer.id;

      // Create subscription record
      await this.prisma.subscription.upsert({
        where: { organizationId },
        create: {
          organizationId,
          stripeCustomerId: customerId,
          plan: Plan.FREE,
          status: SubscriptionStatus.ACTIVE,
        },
        update: {
          stripeCustomerId: customerId,
        },
      });
    }

    const appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        organizationId,
        plan,
        userId,
      },
      subscription_data: {
        metadata: {
          organizationId,
          plan,
        },
      },
    });

    return { url: session.url, sessionId: session.id };
  }

  // ============================================
  // Create Customer Portal Session
  // ============================================
  async createPortalSession(userId: string, organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: { where: { userId } },
        subscription: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const isOwner = organization.ownerId === userId;
    const memberRole = organization.members[0]?.role;
    const isAdmin = memberRole === 'ADMIN' || memberRole === 'OWNER';

    if (!isOwner && !isAdmin) {
      throw new BadRequestException(
        'Only owners and admins can manage subscriptions',
      );
    }

    if (!organization.subscription?.stripeCustomerId) {
      throw new BadRequestException(
        'No subscription found. Please upgrade first.',
      );
    }

    const appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';

    const session = await this.stripe.billingPortal.sessions.create({
      customer: organization.subscription.stripeCustomerId,
      return_url: `${appUrl}/billing`,
    });

    return { url: session.url };
  }

  // ============================================
  // Get Subscription
  // ============================================
  async getSubscription(organizationId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
    });

    // Return FREE plan if no subscription
    if (!subscription) {
      return {
        plan: Plan.FREE,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }

    return subscription;
  }

  // ============================================
  // Webhook Handler
  // ============================================
  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`✅ Webhook received: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
          );
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
          );
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice,
          );
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(
            event.data.object as Stripe.Invoice,
          );
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error: any) {
      this.logger.error(`Error handling webhook: ${error.message}`);
      throw error;
    }
  }

  // ============================================
  // Webhook Handlers
  // ============================================
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const organizationId = session.metadata?.organizationId;
    const plan = session.metadata?.plan as 'PRO' | 'BUSINESS';

    if (!organizationId || !plan) {
      this.logger.error('Missing metadata in checkout session');
      return;
    }

    await this.prisma.subscription.update({
      where: { organizationId },
      data: {
        plan: plan as Plan,
        status: SubscriptionStatus.ACTIVE,
        stripeSubscriptionId: session.subscription as string,
      },
    });

    this.logger.log(
      `✅ Subscription activated for org ${organizationId}: ${plan}`,
    );
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const organizationId = subscription.metadata?.organizationId;

    if (!organizationId) {
      this.logger.error('Missing organizationId in subscription metadata');
      return;
    }

    const plan = this.getPlanFromPriceId(
      subscription.items.data[0]?.price.id,
    );

    const periodStart = (subscription as any).current_period_start;
    const periodEnd = (subscription as any).current_period_end;

    await this.prisma.subscription.update({
      where: { organizationId },
      data: {
        plan,
        status: this.mapStripeStatus(subscription.status),
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
        currentPeriodStart: periodStart
          ? new Date(periodStart * 1000)
          : null,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });

    this.logger.log(
      `✅ Subscription updated for org ${organizationId}: ${plan}`,
    );
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const organizationId = subscription.metadata?.organizationId;

    if (!organizationId) {
      this.logger.error('Missing organizationId in subscription metadata');
      return;
    }

    await this.prisma.subscription.update({
      where: { organizationId },
      data: {
        plan: Plan.FREE,
        status: SubscriptionStatus.CANCELED,
        stripeSubscriptionId: null,
        stripePriceId: null,
        cancelAtPeriodEnd: false,
      },
    });

    this.logger.log(
      `✅ Subscription canceled for org ${organizationId}, downgraded to FREE`,
    );
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    this.logger.log(`✅ Invoice paid: ${invoice.id}`);
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;

    if (!customerId) return;

    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!subscription) return;

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.PAST_DUE },
    });

    this.logger.warn(`⚠️ Payment failed for org ${subscription.organizationId}`);
  }

  // ============================================
  // Helpers
  // ============================================
  private getPlanFromPriceId(priceId: string | undefined): Plan {
    if (!priceId) return Plan.FREE;

    const proPriceId = this.configService.get<string>('STRIPE_PRO_PRICE_ID');
    const businessPriceId = this.configService.get<string>(
      'STRIPE_BUSINESS_PRICE_ID',
    );

    if (priceId === proPriceId) return Plan.PRO;
    if (priceId === businessPriceId) return Plan.BUSINESS;
    return Plan.FREE;
  }

  private mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    switch (status) {
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'canceled':
        return SubscriptionStatus.CANCELED;
      case 'incomplete':
      case 'incomplete_expired':
        return SubscriptionStatus.INCOMPLETE;
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }

  async verifyCheckoutSession(sessionId: string, userId: string) {
    // 1. Get session from Stripe
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      throw new NotFoundException('Checkout session not found');
    }

    // 2. Check session is paid
    if (session.payment_status !== 'paid') {
      throw new BadRequestException('Session not paid yet');
    }

    // 3. Get organizationId from metadata
    const organizationId = session.metadata?.organizationId;
    const plan = session.metadata?.plan as 'PRO' | 'BUSINESS';

    if (!organizationId || !plan) {
      throw new BadRequestException('Invalid session metadata');
    }

    // 4. Verify user is owner of org
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || organization.ownerId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    // 5. Get subscription ID
    const stripeSubscriptionId = session.subscription as string;

    if (!stripeSubscriptionId) {
      throw new BadRequestException('No subscription in session');
    }

    // 6. Retrieve subscription details
    const stripeSubscription = await this.stripe.subscriptions.retrieve(
      stripeSubscriptionId,
    );

    // 7. Extract period dates SAFELY (from item in new SDK)
    const subItem = stripeSubscription.items.data[0] as any;
    const periodStart = subItem?.current_period_start;
    const periodEnd = subItem?.current_period_end;

    const currentPeriodStart = periodStart
      ? new Date(periodStart * 1000)
      : new Date();
    const currentPeriodEnd = periodEnd
      ? new Date(periodEnd * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    // 8. Update DB
    const updatedSubscription = await this.prisma.subscription.upsert({
      where: { organizationId },
      create: {
        organizationId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId,
        stripePriceId: subItem?.price?.id,
        plan: plan as Plan,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart,
        currentPeriodEnd,
      },
      update: {
        stripeSubscriptionId,
        stripePriceId: subItem?.price?.id,
        plan: plan as Plan,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart,
        currentPeriodEnd,
      },
    });

    this.logger.log(`✅ Subscription verified and activated: ${plan}`);

    return {
      success: true,
      plan: updatedSubscription.plan,
      status: updatedSubscription.status,
      subscription: updatedSubscription,
    };
  }

  // ============================================
  // Cancel Subscription
  // ============================================
  async cancelSubscription(
    userId: string,
    organizationId: string,
  ): Promise<CancelSubscriptionResult> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    });

    if (!organization || organization.ownerId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    if (!organization.subscription?.stripeSubscriptionId) {
      throw new BadRequestException('No active subscription');
    }

    await this.stripe.subscriptions.update(
      organization.subscription.stripeSubscriptionId,
      { cancel_at_period_end: true },
    );

    await this.prisma.subscription.update({
      where: { organizationId },
      data: { cancelAtPeriodEnd: true },
    });

    return { success: true, message: 'Subscription will cancel at period end' };
  }

  // ============================================
  // Get Invoices (Payment History)
  // ============================================
  async getInvoices(
    userId: string,
    organizationId: string,
  ): Promise<InvoiceItem[]> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    });

    if (!organization || organization.ownerId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    if (!organization.subscription?.stripeCustomerId) {
      return [];
    }

    const invoices = await this.stripe.invoices.list({
      customer: organization.subscription.stripeCustomerId,
      limit: 20,
    });

    return invoices.data.map((inv): InvoiceItem => ({
      id: inv.id,
      amount: (inv.total ?? 0) / 100,
      currency: inv.currency,
      status: inv.status,
      date: new Date(inv.created * 1000).toISOString(),
      pdfUrl: inv.invoice_pdf ?? null,
      hostedUrl: inv.hosted_invoice_url ?? null,
    }));
  }
}