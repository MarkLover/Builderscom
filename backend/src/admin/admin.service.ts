import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats() {
        const totalUsers = await this.prisma.user.count();
        const activeSubscribers = await this.prisma.user.count({
            where: { subscriptionActive: true }
        });
        const freeUsers = await this.prisma.user.count({
            where: { subscriptionActive: false, role: 'user' }
        });
        const totalProjects = await this.prisma.project.count();
        const totalEmployees = await this.prisma.employee.count();

        return {
            totalUsers,
            activeSubscribers,
            freeUsers,
            totalProjects,
            totalEmployees
        };
    }

    async getUsers(page: number = 1, limit: number = 50) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    phone: true,
                    name: true,
                    company: true,
                    role: true,
                    subscriptionActive: true,
                    subscriptionExpiry: true,
                    createdAt: true,
                    _count: {
                        select: {
                            projects: true,
                            commercialOffers: true
                        }
                    }
                }
            }),
            this.prisma.user.count()
        ]);

        return {
            users,
            total,
            page,
            pageCount: Math.ceil(total / limit)
        };
    }
}
