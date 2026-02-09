import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyUserDto } from './dto/create-company-user.dto';
import { UpdateCompanyUserDto } from './dto/update-company-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompanyUsersService {
    constructor(private prisma: PrismaService) { }

    async findAllByOwner(ownerId: number) {
        return this.prisma.companyUser.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: number, ownerId: number) {
        const user = await this.prisma.companyUser.findFirst({
            where: { id, ownerId },
        });
        if (!user) {
            throw new NotFoundException('Company user not found');
        }
        return user;
    }

    async findByPhone(phone: string) {
        return this.prisma.companyUser.findUnique({
            where: { phone },
            include: { owner: true },
        });
    }

    async create(ownerId: number, dto: CreateCompanyUserDto) {
        // Check if phone already exists
        const existing = await this.prisma.companyUser.findUnique({
            where: { phone: dto.phone },
        });
        if (existing) {
            throw new ConflictException('Phone number already registered');
        }

        // Also check main User table
        const existingUser = await this.prisma.user.findUnique({
            where: { phone: dto.phone },
        });
        if (existingUser) {
            throw new ConflictException('Phone number already registered as main user');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        return this.prisma.companyUser.create({
            data: {
                phone: dto.phone,
                password: hashedPassword,
                name: dto.name,
                role: dto.role,
                ownerId,
            },
        });
    }

    async update(id: number, ownerId: number, dto: UpdateCompanyUserDto) {
        await this.findById(id, ownerId); // verify ownership

        return this.prisma.companyUser.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: number, ownerId: number) {
        await this.findById(id, ownerId); // verify ownership

        return this.prisma.companyUser.delete({
            where: { id },
        });
    }
}
