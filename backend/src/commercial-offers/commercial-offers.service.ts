import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommercialOfferDto } from './dto/create-commercial-offer.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateWorkDto } from './dto/create-work.dto';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateCommercialOfferDto } from './dto/update-commercial-offer.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class CommercialOffersService {
    constructor(private prisma: PrismaService) { }

    // Create a new commercial offer
    async create(userId: number, dto: CreateCommercialOfferDto) {
        // Enforce limit: Max 1 offer if no active subscription
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionActive: true }
        });

        if (!user) throw new NotFoundException('User not found');

        if (!user.subscriptionActive) {
            const offerCount = await this.prisma.commercialOffer.count({
                where: { userId }
            });

            if (offerCount >= 1) {
                throw new ForbiddenException('TRIAL_LIMIT_REACHED');
            }
        }

        return this.prisma.commercialOffer.create({
            data: {
                address: dto.address,
                customerName: dto.customerName,
                customerPhone: dto.customerPhone,
                executorId: dto.executorId,
                planImage: dto.planImage,
                userId,
            },
            include: {
                rooms: {
                    include: {
                        works: true,
                        materials: true,
                    },
                },
            },
        });
    }

    // Get all commercial offers for a user
    async findAll(userId: number) {
        return this.prisma.commercialOffer.findMany({
            where: { userId },
            include: {
                rooms: {
                    include: {
                        works: true,
                        materials: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Get a single commercial offer
    async findOne(id: number, userId: number) {
        const offer = await this.prisma.commercialOffer.findFirst({
            where: { id, userId },
            include: {
                rooms: {
                    include: {
                        works: true,
                        materials: true,
                    },
                },
            },
        });

        if (!offer) {
            throw new NotFoundException('Commercial offer not found');
        }

        return offer;
    }

    // Delete a commercial offer
    async delete(id: number, userId: number) {
        const offer = await this.prisma.commercialOffer.findFirst({
            where: { id, userId },
        });

        if (!offer) {
            throw new NotFoundException('Commercial offer not found');
        }

        return this.prisma.commercialOffer.delete({ where: { id } });
    }

    // Update a commercial offer
    async update(id: number, userId: number, dto: UpdateCommercialOfferDto) {
        const offer = await this.prisma.commercialOffer.findFirst({
            where: { id, userId },
        });

        if (!offer) {
            throw new NotFoundException('Commercial offer not found');
        }

        return this.prisma.commercialOffer.update({
            where: { id },
            data: {
                ...dto,
            },
            include: {
                executor: true,
                rooms: {
                    include: {
                        works: true,
                        materials: true,
                    },
                },
            },
        });
    }

    // Add a room to an offer
    async addRoom(offerId: number, userId: number, dto: CreateRoomDto) {
        // Verify ownership
        const offer = await this.prisma.commercialOffer.findFirst({
            where: { id: offerId, userId },
        });

        if (!offer) {
            throw new NotFoundException('Commercial offer not found');
        }

        return this.prisma.commercialOfferRoom.create({
            data: {
                name: dto.name,
                area: dto.area || 0,
                wallArea: dto.wallArea || 0,
                offerId,
            },
            include: {
                works: true,
                materials: true,
            },
        });
    }

    // Delete a room
    async deleteRoom(roomId: number, userId: number) {
        const room = await this.prisma.commercialOfferRoom.findFirst({
            where: { id: roomId },
            include: { offer: true },
        });

        if (!room || room.offer.userId !== userId) {
            throw new NotFoundException('Room not found');
        }

        return this.prisma.commercialOfferRoom.delete({ where: { id: roomId } });
    }

    // Add a work to a room
    async addWork(roomId: number, userId: number, dto: CreateWorkDto) {
        // Verify ownership through room -> offer -> user chain
        const room = await this.prisma.commercialOfferRoom.findFirst({
            where: { id: roomId },
            include: { offer: true },
        });

        if (!room || room.offer.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return this.prisma.commercialOfferWork.create({
            data: {
                name: dto.name,
                quantity: dto.quantity,
                unit: dto.unit,
                price: dto.price,
                roomId,
            },
        });
    }

    // Delete a work
    async deleteWork(workId: number, userId: number) {
        const work = await this.prisma.commercialOfferWork.findFirst({
            where: { id: workId },
            include: { room: { include: { offer: true } } },
        });

        if (!work || work.room.offer.userId !== userId) {
            throw new NotFoundException('Work not found');
        }

        return this.prisma.commercialOfferWork.delete({ where: { id: workId } });
    }

    // Update work
    async updateWork(workId: number, userId: number, dto: UpdateWorkDto) {
        const work = await this.prisma.commercialOfferWork.findFirst({
            where: { id: workId },
            include: { room: { include: { offer: true } } },
        });

        if (!work || work.room.offer.userId !== userId) {
            throw new NotFoundException('Work not found');
        }

        return this.prisma.commercialOfferWork.update({
            where: { id: workId },
            data: { ...dto },
        });
    }

    // Add a material to a room
    async addMaterial(roomId: number, userId: number, dto: CreateMaterialDto) {
        // Verify ownership through room -> offer -> user chain
        const room = await this.prisma.commercialOfferRoom.findFirst({
            where: { id: roomId },
            include: { offer: true },
        });

        if (!room || room.offer.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return this.prisma.commercialOfferMaterial.create({
            data: {
                name: dto.name,
                quantity: dto.quantity,
                unit: dto.unit,
                price: dto.price,
                roomId,
            },
        });
    }

    // Delete a material
    async deleteMaterial(materialId: number, userId: number) {
        const material = await this.prisma.commercialOfferMaterial.findFirst({
            where: { id: materialId },
            include: { room: { include: { offer: true } } },
        });

        if (!material || material.room.offer.userId !== userId) {
            throw new NotFoundException('Material not found');
        }

        return this.prisma.commercialOfferMaterial.delete({ where: { id: materialId } });
    }

    // Update material
    async updateMaterial(materialId: number, userId: number, dto: UpdateMaterialDto) {
        const material = await this.prisma.commercialOfferMaterial.findFirst({
            where: { id: materialId },
            include: { room: { include: { offer: true } } },
        });

        if (!material || material.room.offer.userId !== userId) {
            throw new NotFoundException('Material not found');
        }

        return this.prisma.commercialOfferMaterial.update({
            where: { id: materialId },
            data: { ...dto },
        });
    }
}
