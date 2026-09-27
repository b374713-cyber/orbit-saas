import { IsEnum, IsString } from 'class-validator';

export enum SubscriptionPlan {
  PRO = 'PRO',
  BUSINESS = 'BUSINESS',
}

export class CreateCheckoutDto {
  @IsString()
  organizationId: string;

  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;
}