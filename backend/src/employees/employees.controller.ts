import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Post()
    create(@Request() req, @Body() dto: CreateEmployeeDto) {
        return this.employeesService.create(req.user.userId, dto);
    }

    @Get()
    findAll(@Request() req) {
        return this.employeesService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.employeesService.findOne(+id, req.user.userId);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
        return this.employeesService.update(+id, req.user.userId, dto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.employeesService.remove(+id, req.user.userId);
    }
}
