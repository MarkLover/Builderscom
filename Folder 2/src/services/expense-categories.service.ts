import api from './api';

export interface CategoryPayment {
    id: number;
    amount: number;
    date: string;
    description?: string;
    categoryId: number;
    createdAt: string;
}

export interface ExpenseCategory {
    id: number;
    name: string;
    type: 'recurring' | 'one-time';
    amount: number; // Planned amount
    description?: string;
    userId: number;
    payments: CategoryPayment[];
    createdAt: string;
}

export interface CreateExpenseCategoryDto {
    name: string;
    type: 'recurring' | 'one-time';
    amount?: number;
    description?: string;
}

export interface CreateCategoryPaymentDto {
    amount: number;
    date?: string;
    description?: string;
}

export const expenseCategoriesService = {
    getAll: async (): Promise<ExpenseCategory[]> => {
        const response = await api.get('/expense-categories');
        return response.data;
    },

    create: async (data: CreateExpenseCategoryDto): Promise<ExpenseCategory> => {
        const response = await api.post('/expense-categories', data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/expense-categories/${id}`);
    },

    addPayment: async (categoryId: number, data: CreateCategoryPaymentDto): Promise<CategoryPayment> => {
        const response = await api.post(`/expense-categories/${categoryId}/payments`, data);
        return response.data;
    },

    deletePayment: async (paymentId: number): Promise<void> => {
        await api.delete(`/expense-categories/payments/${paymentId}`);
    }
};
