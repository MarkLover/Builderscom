import api from './api';

export interface CompanyUserPermissions {
    dashboard: boolean;
    projects: boolean;
    finances: boolean;
    commercial: boolean;
    employees: boolean;
    tasks: boolean;
    profile: boolean;
    subscription: boolean;
}

export interface CompanyUser {
    id: number;
    phone: string;
    name: string;
    role: string;
    canDashboard: boolean;
    canProjects: boolean;
    canFinances: boolean;
    canCommercial: boolean;
    canEmployees: boolean;
    canTasks: boolean;
    canProfile: boolean;
    canSubscription: boolean;
    createdAt: string;
}

export interface CreateCompanyUserDto {
    phone: string;
    password: string;
    name: string;
    role: string;
}

export interface UpdateCompanyUserDto {
    name?: string;
    role?: string;
    canDashboard?: boolean;
    canProjects?: boolean;
    canFinances?: boolean;
    canCommercial?: boolean;
    canEmployees?: boolean;
    canTasks?: boolean;
    canProfile?: boolean;
    canSubscription?: boolean;
}

export const companyUsersService = {
    async getAll(): Promise<CompanyUser[]> {
        const response = await api.get('/company-users');
        return response.data;
    },

    async create(data: CreateCompanyUserDto): Promise<CompanyUser> {
        const response = await api.post('/company-users', data);
        return response.data;
    },

    async update(id: number, data: UpdateCompanyUserDto): Promise<CompanyUser> {
        const response = await api.patch(`/company-users/${id}`, data);
        return response.data;
    },

    async remove(id: number): Promise<void> {
        await api.delete(`/company-users/${id}`);
    },
};
