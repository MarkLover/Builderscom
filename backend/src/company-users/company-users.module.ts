import { Module } from '@nestjs/common';
import { CompanyUsersController } from './company-users.controller';
import { CompanyUsersService } from './company-users.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CompanyUsersController],
    providers: [CompanyUsersService],
    exports: [CompanyUsersService],
})
export class CompanyUsersModule { }
