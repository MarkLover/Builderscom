import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, createProjectDto: CreateProjectDto) {
        return this.prisma.project.create({
            data: {
                ...createProjectDto,
                userId,
            },
        });
    }

    async findAll(userId: number) {
        return this.prisma.project.findMany({
            where: { userId },
            include: {
                stages: {
                    include: {
                        transactions: true
                    }
                },
                transactions: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: number, userId: number) {
        return this.prisma.project.findFirst({
            where: { id, userId },
            include: {
                stages: {
                    include: {
                        transactions: true
                    }
                },
                transactions: true,
                employees: true,
                tasks: true
            }
        });
    }

    async update(id: number, userId: number, data: any) {
        const project = await this.prisma.project.findFirst({
            where: { id, userId }
        });

        if (!project) {
            throw new Error('Project not found or access denied');
        }

        return this.prisma.project.update({
            where: { id },
            data,
        });
    }

    async createStage(projectId: number, userId: number, dto: any) {
        const project = await this.prisma.project.findFirst({ where: { id: projectId, userId } });
        if (!project) throw new Error('Project not found');

        return this.prisma.stage.create({
            data: {
                title: dto.title,
                budget: dto.budget || 0,
                projectId
            }
        });
    }

    async createTransaction(projectId: number, userId: number, dto: any) {
        const project = await this.prisma.project.findFirst({ where: { id: projectId, userId } });
        if (!project) throw new Error('Project not found');

        return this.prisma.transaction.create({
            data: {
                type: dto.type,
                amount: +dto.amount,
                category: dto.category || 'other',
                description: dto.description,
                date: dto.date ? new Date(dto.date) : new Date(),
                projectId,
                stageId: dto.stageId ? +dto.stageId : null,
                receipt: dto.receipt
            }
        });
    }

    async updateTransaction(transactionId: number, userId: number, dto: any) {
        // Get transaction with project to verify ownership
        const transaction = await this.prisma.transaction.findFirst({
            where: { id: transactionId },
            include: { project: true }
        });

        if (!transaction || transaction.project.userId !== userId) {
            throw new Error('Transaction not found or access denied');
        }

        const updateData: any = {};
        if (dto.type) updateData.type = dto.type;
        if (dto.amount !== undefined) updateData.amount = +dto.amount;
        if (dto.category) updateData.category = dto.category;
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.date) updateData.date = new Date(dto.date);

        return this.prisma.transaction.update({
            where: { id: transactionId },
            data: updateData
        });
    }

    async deleteTransaction(transactionId: number, userId: number) {
        // Get transaction with project to verify ownership
        const transaction = await this.prisma.transaction.findFirst({
            where: { id: transactionId },
            include: { project: true }
        });

        if (!transaction || transaction.project.userId !== userId) {
            throw new Error('Transaction not found or access denied');
        }

        return this.prisma.transaction.delete({
            where: { id: transactionId }
        });
    }
}

