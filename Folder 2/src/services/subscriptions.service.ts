import api from './api';

export interface SubscriptionStatus {
    active: boolean;
    expiry: string | null;
    isExpired?: boolean;
    hasUsedTrial?: boolean;
}

export const subscriptionsService = {
    getStatus: async (): Promise<SubscriptionStatus> => {
        const response = await api.get('/subscriptions/status');
        return response.data;
    },

    // Generates YooKassa payment link
    generatePaymentLink: async (returnUrl: string): Promise<{ confirmationUrl: string, paymentId: string }> => {
        const response = await api.post('/subscriptions/pay/premium', { returnUrl });
        return response.data;
    },

    // Developer testing (Activate directly without payment)
    activate: async (months: number = 1) => {
        const response = await api.post('/subscriptions/activate', { months });
        return response.data;
    },

    deactivate: async (): Promise<void> => {
        await api.post('/subscriptions/deactivate');
    },
};
