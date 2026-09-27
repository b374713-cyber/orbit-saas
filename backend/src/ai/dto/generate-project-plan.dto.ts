import { IsString, MinLength, MaxLength, IsOptional, IsInt, Min, Max } from 'class-validator';

export class GenerateProjectPlanDto {
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  @MaxLength(1000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  duration?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  teamSize?: number;
}