import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
    constructor(private prisma: PrismaService) { }

    // Get subscription status for a user
    async getStatus(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                subscriptionActive: true,
                subscriptionExpiry: true,
            },
        });

        if (!user) {
            return { active: false, expiry: null };
        }

        // Check if subscription has expired
        const isExpired = user.subscriptionExpiry
            ? new Date(user.subscriptionExpiry) < new Date()
            : true;

        return {
            active: user.subscriptionActive && !isExpired,
            expiry: user.subscriptionExpiry,
            isExpired: isExpired && user.subscriptionExpiry !== null,
        };
    }

    // Update subscription (for admin use or after payment verification)
    async activateSubscription(userId: number, months: number = 1) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + months);

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionActive: true,
                subscriptionExpiry: expiryDate,
            },
            select: {
                id: true,
                subscriptionActive: true,
                subscriptionExpiry: true,
            },
        });
    }

    // Deactivate subscription
    async deactivateSubscription(userId: number) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionActive: false,
            },
            select: {
                id: true,
                subscriptionActive: true,
                subscriptionExpiry: true,
            },
        });
    }
}
