import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskPriority } from '../../generated/prisma/enums.js';

class AiTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedHours?: number;
}

class AiMilestoneDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiTaskDto)
  tasks: AiTaskDto[];
}

export class CreateProjectFromAiDto {
  @IsString()
  organizationId: string;

  @IsString()
  projectName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiMilestoneDto)
  milestones: AiMilestoneDto[];

  @IsOptional()
  @IsString()
  startDate?: string;
}