import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyExpensesService } from './company-expenses.service';
import { CreateCompanyExpenseDto } from './dto/create-company-expense.dto';

@Controller('company-expenses')
@UseGuards(JwtAuthGuard)
export class CompanyExpensesController {
    constructor(private service: CompanyExpensesService) { }

    @Get()
    getAll(@Req() req: any) {
        return this.service.getAll(req.user.userId);
    }

    @Post()
    create(@Req() req: any, @Body() dto: CreateCompanyExpenseDto) {
        return this.service.create(req.user.userId, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string, @Req() req: any) {
        return this.service.delete(+id, req.user.userId);
    }
}
