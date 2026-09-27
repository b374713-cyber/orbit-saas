import { IsString } from 'class-validator';

export class CreatePortalDto {
  @IsString()
  organizationId: string;
}