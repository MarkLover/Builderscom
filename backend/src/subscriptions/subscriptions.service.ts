import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubscriptionsService {
    private readonly logger = new Logger(SubscriptionsService.name);
    private readonly YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
    private readonly YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
    private readonly PREMIUM_PRICE = 10; // ВРЕМЕННО ДЛЯ ТЕСТА (вернуть 799 потом)
    private readonly TRIAL_PRICE = 1;

    constructor(private prisma: PrismaService) { }

    private getAuthHeader() {
        return 'Basic ' + Buffer.from(`${this.YOOKASSA_SHOP_ID}:${this.YOOKASSA_SECRET_KEY}`).toString('base64');
    }

    // Generate a YooKassa payment link for premium subscription
    async createPayment(userId: number, returnUrl: string) {
        const idempotenceKey = uuidv4();

        // 1. Get User to check trial status
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        const isTrial = !user.hasUsedTrial;
        const price = isTrial ? this.TRIAL_PRICE : this.PREMIUM_PRICE;
        const months = isTrial ? 0 : 1; // 0 months for trial (we'll grant 7 days later based on isTrial flag)

        try {
            const response = await axios.post('https://api.yookassa.ru/v3/payments', {
                amount: {
                    value: price.toString() + '.00',
                    currency: 'RUB'
                },
                capture: true,
                confirmation: {
                    type: 'redirect',
                    return_url: returnUrl
                },
                description: isTrial ? `Пробная подписка на 7 дней. Пользователь: ${userId}` : `Подписка на тариф ПростоСтройка. Пользователь: ${userId}`,
                metadata: {
                    userId: userId.toString(),
                    months: months.toString(),
                    isTrial: isTrial ? "true" : "false"
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Idempotence-Key': idempotenceKey,
                    'Authorization': this.getAuthHeader()
                }
            });

            const paymentData = response.data;

            // Save pending payment to our database
            await this.prisma.payment.create({
                data: {
                    paymentId: paymentData.id,
                    status: paymentData.status,
                    amount: parseFloat(paymentData.amount.value),
                    currency: paymentData.amount.currency,
                    description: paymentData.description,
                    metadata: paymentData.metadata,
                    userId: userId
                }
            });

            return {
                confirmationUrl: paymentData.confirmation.confirmation_url,
                paymentId: paymentData.id
            };

        } catch (error) {
            this.logger.error('Error creating payment:', error);
            throw error;
        }
    }

    // Process YooKassa incoming webhooks
    async handleWebhook(payload: any) {
        if (!payload || !payload.object) return { success: false };

        const paymentObj = payload.object;
        const paymentId = paymentObj.id;
        const status = paymentObj.status; // 'succeeded', 'canceled', etc

        try {
            const dbPayment = await this.prisma.payment.findUnique({
                where: { paymentId }
            });

            if (!dbPayment) {
                this.logger.warn(`Payment ${paymentId} not found in DB`);
                return { success: false, reason: 'Payment not found' };
            }

            // Update payment status in our DB
            await this.prisma.payment.update({
                where: { paymentId },
                data: { status }
            });

            // If payment succeeded, activate the subscription
            if (status === 'succeeded' && payload.event === 'payment.succeeded') {
                const userId = parseInt(paymentObj.metadata.userId, 10);
                const isTrial = paymentObj.metadata.isTrial === "true";
                const months = parseInt(paymentObj.metadata.months || "1", 10);

                if (!isNaN(userId)) {
                    if (isTrial) {
                        await this.activateTrial(userId);
                        this.logger.log(`Trial activated for user ${userId} via YooKassa payment ${paymentId}`);
                    } else {
                        await this.activateSubscription(userId, months);
                        this.logger.log(`Subscription activated for user ${userId} via YooKassa payment ${paymentId}`);
                    }
                }
            }

            return { success: true };
        } catch (error) {
            this.logger.error('Webhook processing error:', error);
            throw error;
        }
    }

    // Get subscription status for a user
    async getStatus(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                subscriptionActive: true,
                subscriptionExpiry: true,
                hasUsedTrial: true,
            },
        });

        if (!user) {
            return { active: false, expiry: null, hasUsedTrial: false };
        }

        // Check if subscription has expired
        const isExpired = user.subscriptionExpiry
            ? new Date(user.subscriptionExpiry) < new Date()
            : true;

        return {
            active: user.subscriptionActive && !isExpired,
            expiry: user.subscriptionExpiry,
            isExpired: isExpired && user.subscriptionExpiry !== null,
            hasUsedTrial: user.hasUsedTrial,
        };
    }

    // Update subscription (for admin use or after payment verification)
    async activateSubscription(userId: number, months: number = 1) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) return null;

        // Add time to current expiry if it's already active, otherwise start from today
        let expiryDate = new Date();
        if (user.subscriptionActive && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date()) {
            expiryDate = new Date(user.subscriptionExpiry);
        }
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
                hasUsedTrial: true,
            },
        });
    }

    async activateTrial(userId: number) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) return null;

        let expiryDate = new Date();
        if (user.subscriptionActive && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date()) {
            expiryDate = new Date(user.subscriptionExpiry);
        }
        expiryDate.setDate(expiryDate.getDate() + 7); // Trial is 7 days

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionActive: true,
                subscriptionExpiry: expiryDate,
                hasUsedTrial: true, // Mark trial as used
            },
            select: {
                id: true,
                subscriptionActive: true,
                subscriptionExpiry: true,
                hasUsedTrial: true,
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
