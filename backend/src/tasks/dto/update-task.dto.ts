import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    status?: string; // 'draft' | 'todo' | 'in_progress' | 'completed' | 'cancelled'
}
