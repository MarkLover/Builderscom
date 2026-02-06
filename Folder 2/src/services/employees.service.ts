import api from './api';

export interface CreateEmployeeDto {
    name: string;
    role: string;
    phone?: string;
    telegram?: string;
    whatsapp?: string;
    max?: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
    status?: string;
}

export const employeesService = {
    getAll: async () => {
        const response = await api.get('/employees');
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get(`/employees/${id}`);
        return response.data;
    },

    create: async (data: CreateEmployeeDto) => {
        const response = await api.post('/employees', data);
        return response.data;
    },

    update: async ({ id, data }: { id: number, data: UpdateEmployeeDto }) => {
        const response = await api.patch(`/employees/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/employees/${id}`);
        return response.data;
    }
};
