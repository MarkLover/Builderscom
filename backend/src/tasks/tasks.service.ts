import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, dto: CreateTaskDto) {
        return this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                projectId: dto.projectId,
                assigneeId: dto.assigneeId,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                priority: dto.priority || 'medium',
                userId,
            },
            include: {
                project: true,
                assignee: true,
            }
        });
    }

    async findAll(userId: number) {
        return this.prisma.task.findMany({
            where: { userId },
            include: {
                project: true,
                assignee: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: number, userId: number) {
        return this.prisma.task.findFirst({
            where: { id, userId },
            include: {
                project: true,
                assignee: true,
            }
        });
    }

    async update(id: number, userId: number, dto: UpdateTaskDto) {
        const task = await this.prisma.task.findFirst({
            where: { id, userId }
        });
        if (!task) throw new Error('Task not found');

        const updateData: any = { ...dto };
        if (dto.dueDate) {
            updateData.dueDate = new Date(dto.dueDate);
        }

        return this.prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                project: true,
                assignee: true,
            }
        });
    }

    async remove(id: number, userId: number) {
        const task = await this.prisma.task.findFirst({
            where: { id, userId }
        });
        if (!task) throw new Error('Task not found');

        return this.prisma.task.delete({
            where: { id }
        });
    }
}
