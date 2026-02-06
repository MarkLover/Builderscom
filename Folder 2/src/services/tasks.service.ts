import api from './api';

export interface CreateTaskDto {
    title: string;
    description?: string;
    projectId: number;
    assigneeId?: number;
    dueDate?: string;
    priority?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
    status?: string;
}

export const tasksService = {
    getAll: async () => {
        const response = await api.get('/tasks');
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get(`/tasks/${id}`);
        return response.data;
    },

    create: async (data: CreateTaskDto) => {
        const response = await api.post('/tasks', data);
        return response.data;
    },

    update: async ({ id, data }: { id: number, data: UpdateTaskDto }) => {
        const response = await api.patch(`/tasks/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    }
};
