import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('stats')
    async getGlobalStats() {
        return this.adminService.getDashboardStats();
    }

    @Get('users')
    async getUsers(
        @Query('page') page: string,
        @Query('limit') limit: string,
    ) {
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 50;
        return this.adminService.getUsers(pageNumber, limitNumber);
    }
}
