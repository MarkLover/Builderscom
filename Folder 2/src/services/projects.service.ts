import api from './api';

export interface CreateProjectDto {
    title: string;
    address?: string;
    budget?: number;
}

export const projectsService = {
    getAll: async () => {
        const response = await api.get('/projects');
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },

    create: async (data: CreateProjectDto) => {
        const response = await api.post('/projects', data);
        return response.data;
    },

    update: async ({ id, data }: { id: number, data: any }) => {
        const response = await api.patch(`/projects/${id}`, data);
        return response.data;
    },

    createStage: async ({ projectId, data }: { projectId: number, data: { title: string, budget?: number } }) => {
        const response = await api.post(`/projects/${projectId}/stages`, data);
        return response.data;
    },

    createTransaction: async ({ projectId, data }: { projectId: number, data: any }) => {
        const response = await api.post(`/projects/${projectId}/transactions`, data);
        return response.data;
    },

    updateTransaction: async ({ transactionId, data }: { transactionId: number, data: any }) => {
        const response = await api.patch(`/projects/transactions/${transactionId}`, data);
        return response.data;
    },

    deleteTransaction: async (transactionId: number) => {
        const response = await api.delete(`/projects/transactions/${transactionId}`);
        return response.data;
    }
};

