import api from './api';

export interface CreateProjectDto {
    title: string;
    address?: string;
    budget?: number;
}

export const enrichProject = (project: any) => {
    let projectSpent = 0;
    let projectIncome = 0;
    let projectMaterials = 0;
    let projectLabor = 0;
    let projectOther = 0;

    // Process project-level transactions
    project.transactions?.forEach((t: any) => {
        if (t.type === 'expense') {
            projectSpent += t.amount;
            if (t.category === 'materials') projectMaterials += t.amount;
            else if (t.category === 'labor') projectLabor += t.amount;
            else projectOther += t.amount;
        } else {
            projectIncome += t.amount;
        }
    });

    // Process stage-level transactions and enrich stages
    const enrichedStages = (project.stages || []).map((stage: any) => {
        let stageSpent = 0;
        let stageIncome = 0;
        let stageMaterials = 0;
        let stageLabor = 0;
        let stageOther = 0;

        stage.transactions?.forEach((t: any) => {
            if (t.type === 'expense') {
                stageSpent += t.amount;
                projectSpent += t.amount; // Add to global project spent

                if (t.category === 'materials') {
                    stageMaterials += t.amount;
                    projectMaterials += t.amount;
                } else if (t.category === 'labor') {
                    stageLabor += t.amount;
                    projectLabor += t.amount;
                } else {
                    stageOther += t.amount;
                    projectOther += t.amount;
                }
            } else {
                stageIncome += t.amount;
                projectIncome += t.amount; // Add to global project income
            }
        });

        return {
            ...stage,
            spent: stageSpent,
            income: stageIncome,
            materials: stageMaterials,
            labor: stageLabor,
            other: stageOther,
        };
    });

    return {
        ...project,
        spent: projectSpent,
        income: projectIncome,
        materials: projectMaterials,
        labor: projectLabor,
        other: projectOther,
        stages: enrichedStages,
    };
};

export const projectsService = {
    getAll: async () => {
        const response = await api.get('/projects');
        return response.data.map(enrichProject);
    },

    getOne: async (id: number) => {
        const response = await api.get(`/projects/${id}`);
        return enrichProject(response.data);
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
    },

    uploadReceipt: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};

