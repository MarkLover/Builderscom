import api from './api';

export interface CompanyExpense {
    id: number;
    description: string;
    amount: number;
    category: 'rent' | 'salary' | 'fuel' | 'taxes' | 'other';
    date: string;
    receipt?: string;
    userId: number;
    createdAt: string;
}

export interface CreateCompanyExpenseDto {
    description: string;
    amount: number;
    category: string;
    date: string;
    receipt?: File;
}

export const companyExpensesService = {
    getAll: async (): Promise<CompanyExpense[]> => {
        const response = await api.get('/company-expenses');
        return response.data;
    },

    create: async (data: CreateCompanyExpenseDto): Promise<CompanyExpense> => {
        // Handle file upload if receipt is present
        // Since the backend DTO likely expects a string URL for receipt, 
        // we might need a separate file upload endpoint or logic. 
        // For now, assuming standard JSON or form-data if backend handles file upload directly.
        // Based on previous code, let's treat it as a standard POST, 
        // but typically files need FormData. 
        // Given the simplistic backend DTO (string receipt), I'll stick to JSON for data.
        // If file upload is needed, we'd need a separate mechanism or FormData.

        // Let's assume for now we send data as JSON and receipt is just a string (url) or handled separately.
        // If the backend expects a real file upload, we need to adjust.
        // Looking at backend dto: `receipt?: string;` => it expects a URL or string path.
        // Real file upload to S3/disk usually happens separately or via Interceptors.

        const response = await api.post('/company-expenses', {
            ...data,
            receipt: typeof data.receipt === 'string' ? data.receipt : undefined
        });
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/company-expenses/${id}`);
    }
};
