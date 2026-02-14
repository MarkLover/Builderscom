import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyExpenseDto } from './dto/create-company-expense.dto';

@Injectable()
export class CompanyExpensesService {
    constructor(private prisma: PrismaService) { }

    async getAll(userId: number) {
        return this.prisma.companyExpense.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });
    }

    async create(userId: number, dto: CreateCompanyExpenseDto) {
        return this.prisma.companyExpense.create({
            data: {
                ...dto,
                date: new Date(dto.date),
                userId
            }
        });
    }

    async delete(id: number, userId: number) {
        const expense = await this.prisma.companyExpense.findFirst({
            where: { id, userId }
        });
        if (!expense) throw new Error('Expense not found');

        return this.prisma.companyExpense.delete({ where: { id } });
    }
}
