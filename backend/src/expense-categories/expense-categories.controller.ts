import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExpenseCategoriesService } from './expense-categories.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { CreateCategoryPaymentDto } from './dto/create-category-payment.dto';

@Controller('expense-categories')
@UseGuards(JwtAuthGuard)
export class ExpenseCategoriesController {
    constructor(private service: ExpenseCategoriesService) { }

    @Get()
    getAll(@Req() req: any) {
        return this.service.getAll(req.user.userId);
    }

    @Post()
    create(@Req() req: any, @Body() dto: CreateExpenseCategoryDto) {
        return this.service.create(req.user.userId, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string, @Req() req: any) {
        return this.service.delete(+id, req.user.userId);
    }

    @Post(':id/payments')
    addPayment(@Param('id') id: string, @Req() req: any, @Body() dto: CreateCategoryPaymentDto) {
        return this.service.addPayment(+id, req.user.userId, dto);
    }

    @Delete('payments/:id')
    deletePayment(@Param('id') id: string, @Req() req: any) {
        return this.service.deletePayment(+id, req.user.userId);
    }
}
