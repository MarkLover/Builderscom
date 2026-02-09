import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { CommercialOffersService } from './commercial-offers.service';
import { CreateCommercialOfferDto } from './dto/create-commercial-offer.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateWorkDto } from './dto/create-work.dto';
import { CreateMaterialDto } from './dto/create-material.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('commercial-offers')
@UseGuards(JwtAuthGuard)
export class CommercialOffersController {
    constructor(private readonly service: CommercialOffersService) { }

    // === OFFERS ===

    @Post()
    create(@Request() req, @Body() dto: CreateCommercialOfferDto) {
        return this.service.create(req.user.userId, dto);
    }

    @Get()
    findAll(@Request() req) {
        return this.service.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.service.findOne(+id, req.user.userId);
    }

    @Delete(':id')
    delete(@Request() req, @Param('id') id: string) {
        return this.service.delete(+id, req.user.userId);
    }

    // === ROOMS ===

    @Post(':offerId/rooms')
    addRoom(
        @Request() req,
        @Param('offerId') offerId: string,
        @Body() dto: CreateRoomDto,
    ) {
        return this.service.addRoom(+offerId, req.user.userId, dto);
    }

    @Delete('rooms/:roomId')
    deleteRoom(@Request() req, @Param('roomId') roomId: string) {
        return this.service.deleteRoom(+roomId, req.user.userId);
    }

    // === WORKS ===

    @Post('rooms/:roomId/works')
    addWork(
        @Request() req,
        @Param('roomId') roomId: string,
        @Body() dto: CreateWorkDto,
    ) {
        return this.service.addWork(+roomId, req.user.userId, dto);
    }

    @Delete('works/:workId')
    deleteWork(@Request() req, @Param('workId') workId: string) {
        return this.service.deleteWork(+workId, req.user.userId);
    }

    // === MATERIALS ===

    @Post('rooms/:roomId/materials')
    addMaterial(
        @Request() req,
        @Param('roomId') roomId: string,
        @Body() dto: CreateMaterialDto,
    ) {
        return this.service.addMaterial(+roomId, req.user.userId, dto);
    }

    @Delete('materials/:materialId')
    deleteMaterial(@Request() req, @Param('materialId') materialId: string) {
        return this.service.deleteMaterial(+materialId, req.user.userId);
    }
}
