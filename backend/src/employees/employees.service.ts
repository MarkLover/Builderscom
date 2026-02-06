import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, dto: CreateEmployeeDto) {
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
