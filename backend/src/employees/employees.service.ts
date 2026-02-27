import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, dto: CreateEmployeeDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionActive: true }
        });

        if (!user) throw new NotFoundException('User not found');

        if (!user.subscriptionActive) {
            const employeeCount = await this.prisma.employee.count({
                where: { userId }
            });

            if (employeeCount >= 10) {
                throw new ForbiddenException('Достигнут лимит сотрудников на бесплатном тарифе');
            }
        }

        return this.prisma.employee.create({
            data: {
                ...dto,
                userId,
            },
            include: {
                tasks: true,
            }
        });
    }

    async findAll(userId: number) {
        return this.prisma.employee.findMany({
            where: { userId },
            include: {
                tasks: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: number, userId: number) {
        return this.prisma.employee.findFirst({
            where: { id, userId },
            include: {
                tasks: true,
            }
        });
    }

    async update(id: number, userId: number, dto: UpdateEmployeeDto) {
        const employee = await this.prisma.employee.findFirst({
            where: { id, userId }
        });
        if (!employee) throw new Error('Employee not found');

        return this.prisma.employee.update({
            where: { id },
            data: dto,
            include: {
                tasks: true,
            }
        });
    }

    async remove(id: number, userId: number) {
        const employee = await this.prisma.employee.findFirst({
            where: { id, userId }
        });
        if (!employee) throw new Error('Employee not found');

        return this.prisma.employee.delete({
            where: { id }
        });
    }
}
