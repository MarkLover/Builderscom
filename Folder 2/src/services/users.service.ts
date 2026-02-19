import api from './api';

export const usersService = {
    update: async (id: number, data: any) => {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },

    // Method to update current user (if backend supports 'me' or we pass ID)
    // For now we will rely on passing ID which we usually have in context
};
