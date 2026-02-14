import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CompanyExpensesController } from './company-expenses.controller';
import { CompanyExpensesService } from './company-expenses.service';

@Module({
    imports: [PrismaModule],
    controllers: [CompanyExpensesController],
    providers: [CompanyExpensesService],
    exports: [CompanyExpensesService],
})
export class CompanyExpensesModule { }
