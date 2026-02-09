import { Module } from '@nestjs/common';
import { CommercialOffersController } from './commercial-offers.controller';
import { CommercialOffersService } from './commercial-offers.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CommercialOffersController],
    providers: [CommercialOffersService],
    exports: [CommercialOffersService],
})
export class CommercialOffersModule { }
