export class CreateTaskDto {
    title: string;
    description?: string;
    projectId: number;
    assigneeId?: number;
    dueDate?: string;
    priority?: string; // 'low' | 'medium' | 'high'
}
