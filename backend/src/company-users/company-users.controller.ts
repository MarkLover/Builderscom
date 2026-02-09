import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyUsersService } from './company-users.service';
import { CreateCompanyUserDto } from './dto/create-company-user.dto';
import { UpdateCompanyUserDto } from './dto/update-company-user.dto';

@Controller('company-users')
@UseGuards(JwtAuthGuard)
export class CompanyUsersController {
    constructor(private companyUsersService: CompanyUsersService) { }

    @Get()
    findAll(@Request() req) {
        return this.companyUsersService.findAllByOwner(req.user.userId);
    }

    @Post()
    create(@Request() req, @Body() dto: CreateCompanyUserDto) {
        return this.companyUsersService.create(req.user.userId, dto);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() dto: UpdateCompanyUserDto) {
        return this.companyUsersService.update(+id, req.user.userId, dto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.companyUsersService.remove(+id, req.user.userId);
    }
}
