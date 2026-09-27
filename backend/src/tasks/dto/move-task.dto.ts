import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { TaskStatus } from '../../generated/prisma/enums.js';

export class MoveTaskDto {
  @IsEnum(TaskStatus, { message: 'Invalid task status' })
  status: TaskStatus;

  @IsOptional()
  @IsInt()
  order?: number;
}