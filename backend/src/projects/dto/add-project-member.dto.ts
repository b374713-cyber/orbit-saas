import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../generated/prisma/enums.js';

export class AddProjectMemberDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be OWNER, ADMIN, MEMBER, or VIEWER' })
  role?: Role;
}