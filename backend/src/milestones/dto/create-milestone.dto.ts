import { IsString, MinLength, MaxLength, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { MilestoneStatus } from '../../generated/prisma/enums.js';

export class CreateMilestoneDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(MilestoneStatus)
  status?: MilestoneStatus;

  @IsOptional()
  order?: number;
}