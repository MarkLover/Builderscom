import api from './api';

export interface CommercialOffer {
    id: number;
    address: string;
    customerName?: string;
    customerPhone?: string;
    discount?: number;
    discountType?: string;
    createdAt: string;
    updatedAt: string;
    rooms: Room[];
}

export interface Room {
    id: number;
    name: string;
    area: number;
    wallArea: number;
    works: Work[];
    materials: Material[];
}

export interface Work {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    price: number;
    discount?: number;
    discountType?: string;
}

export interface Material {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    price: number;
    discount?: number;
    discountType?: string;
}

export interface CreateOfferDto {
    address: string;
    customerName?: string;
    customerPhone?: string;
}

export interface CreateRoomDto {
    name: string;
    area?: number;
    wallArea?: number;
}

export interface CreateWorkDto {
    name: string;
    quantity: number;
    unit: string;
    price: number;
    discount?: number;
    discountType?: string;
}

export interface CreateMaterialDto {
    name: string;
    quantity: number;
    unit: string;
    price: number;
    discount?: number;
    discountType?: string;
}

export const commercialOffersService = {
    // Offers
    getAll: async (): Promise<CommercialOffer[]> => {
        const response = await api.get('/commercial-offers');
        return response.data;
    },

    getOne: async (id: number): Promise<CommercialOffer> => {
        const response = await api.get(`/commercial-offers/${id}`);
        return response.data;
    },

    create: async (data: CreateOfferDto): Promise<CommercialOffer> => {
        const response = await api.post('/commercial-offers', data);
        return response.data;
    },

    update: async (id: number, data: Partial<CreateOfferDto> & { discount?: number, discountType?: string }): Promise<CommercialOffer> => {
        const response = await api.patch(`/commercial-offers/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/commercial-offers/${id}`);
    },

    // Rooms
    addRoom: async (offerId: number, data: CreateRoomDto): Promise<Room> => {
        const response = await api.post(`/commercial-offers/${offerId}/rooms`, data);
        return response.data;
    },

    deleteRoom: async (roomId: number): Promise<void> => {
        await api.delete(`/commercial-offers/rooms/${roomId}`);
    },

    // Works
    addWork: async (roomId: number, data: CreateWorkDto): Promise<Work> => {
        const response = await api.post(`/commercial-offers/rooms/${roomId}/works`, data);
        return response.data;
    },

    deleteWork: async (workId: number): Promise<void> => {
        await api.delete(`/commercial-offers/works/${workId}`);
    },

    updateWork: async (workId: number, data: Partial<CreateWorkDto> & { discount?: number, discountType?: string }): Promise<Work> => {
        const response = await api.patch(`/commercial-offers/works/${workId}`, data);
        return response.data;
    },

    // Materials
    addMaterial: async (roomId: number, data: CreateMaterialDto): Promise<Material> => {
        const response = await api.post(`/commercial-offers/rooms/${roomId}/materials`, data);
        return response.data;
    },

    deleteMaterial: async (materialId: number): Promise<void> => {
        await api.delete(`/commercial-offers/materials/${materialId}`);
    },

    updateMaterial: async (materialId: number, data: Partial<CreateMaterialDto> & { discount?: number, discountType?: string }): Promise<Material> => {
        const response = await api.patch(`/commercial-offers/materials/${materialId}`, data);
        return response.data;
    },
};
