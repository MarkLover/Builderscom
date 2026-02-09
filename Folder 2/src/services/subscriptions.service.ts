import api from './api';

export interface SubscriptionStatus {
    active: boolean;
    expiry: string | null;
    isExpired?: boolean;
}

export const subscriptionsService = {
    getStatus: async (): Promise<SubscriptionStatus> => {
        const response = await api.get('/subscriptions/status');
        return response.data;
    },

    activate: async (months: number = 1): Promise<{ subscriptionActive: boolean; subscriptionExpiry: string }> => {
        const response = await api.post('/subscriptions/activate', { months });
        return response.data;
    },

    deactivate: async (): Promise<void> => {
        await api.post('/subscriptions/deactivate');
    },
};
