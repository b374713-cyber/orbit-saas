import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2, { message: 'Slug must be at least 2 characters' })
  @MaxLength(50)
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}