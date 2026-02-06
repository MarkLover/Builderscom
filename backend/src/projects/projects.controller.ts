import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(req.user.userId, createProjectDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.projectsService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.projectsService.findOne(+id, req.user.userId);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
        return this.projectsService.update(+id, req.user.userId, updateProjectDto);
    }

    @Post(':id/stages')
    createStage(@Request() req, @Param('id') id: string, @Body() createStageDto: CreateStageDto) {
        return this.projectsService.createStage(+id, req.user.userId, createStageDto);
    }

    @Post(':id/transactions')
    createTransaction(@Request() req, @Param('id') id: string, @Body() createTransactionDto: CreateTransactionDto) {
        return this.projectsService.createTransaction(+id, req.user.userId, createTransactionDto);
    }

    @Patch('transactions/:transactionId')
    updateTransaction(@Request() req, @Param('transactionId') transactionId: string, @Body() data: any) {
        return this.projectsService.updateTransaction(+transactionId, req.user.userId, data);
    }

    @Delete('transactions/:transactionId')
    deleteTransaction(@Request() req, @Param('transactionId') transactionId: string) {
        return this.projectsService.deleteTransaction(+transactionId, req.user.userId);
    }
}

