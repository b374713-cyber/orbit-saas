import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class GenerateTaskBreakdownDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  taskTitle: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  taskDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  projectContext?: string;
}