import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { CreateCategoryPaymentDto } from './dto/create-category-payment.dto';

@Injectable()
export class ExpenseCategoriesService {
    constructor(private prisma: PrismaService) { }

    async getAll(userId: number) {
        return this.prisma.expenseCategory.findMany({
            where: { userId },
            include: { payments: { orderBy: { date: 'desc' } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async create(userId: number, dto: CreateExpenseCategoryDto) {
        return this.prisma.expenseCategory.create({
            data: {
                ...dto,
                amount: dto.amount || 0,
                userId
            },
            include: { payments: true }
        });
    }

    async delete(id: number, userId: number) {
        const category = await this.prisma.expenseCategory.findFirst({
            where: { id, userId }
        });
        if (!category) throw new Error('Category not found');

        return this.prisma.expenseCategory.delete({ where: { id } });
    }

    async addPayment(categoryId: number, userId: number, dto: CreateCategoryPaymentDto) {
        // Verify ownership
        const category = await this.prisma.expenseCategory.findFirst({
            where: { id: categoryId, userId }
        });
        if (!category) throw new Error('Category not found');

        return this.prisma.categoryPayment.create({
            data: {
                ...dto,
                date: dto.date ? new Date(dto.date) : new Date(),
                categoryId
            }
        });
    }

    async deletePayment(paymentId: number, userId: number) {
        const payment = await this.prisma.categoryPayment.findFirst({
            where: {
                id: paymentId,
                category: { userId }
            }
        });
        if (!payment) throw new Error('Payment not found');

        return this.prisma.categoryPayment.delete({ where: { id: paymentId } });
    }
}
